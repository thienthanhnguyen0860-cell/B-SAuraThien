import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Property,
  Project,
  Reservation,
  Inquiry,
  UserProfile,
  Agent,
  PaymentSettings,
  SiteSettings,
  AdminLog,
} from '../types';
import { generatePropertyCode, slugify } from '../lib/utils';
import { notificationService } from './notificationService';

// Log admin action
export async function createAdminLog(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  description: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      adminId,
      action,
      entityType,
      entityId,
      description,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}

// Fetch Admin Logs
export async function getAdminLogs(): Promise<AdminLog[]> {
  try {
    const q = query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog));
  } catch (err) {
    try {
      const snap2 = await getDocs(collection(db, 'adminLogs'));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog));
    } catch (e) {
      return [];
    }
  }
}

// APPROVE RESERVATION (Server Transaction with Anti-Collision Locking)
export async function approveReservation(
  reservationId: string,
  adminId: string,
  adminEmail: string
): Promise<{ success: boolean; message: string; code?: string }> {
  // 1. Backend Server-Authoritative API Call
  let apiSuccess = false;
  try {
    const response = await fetch('/api/reservations/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, adminUid: adminId, adminEmail }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      apiSuccess = true;
      // Trigger notification abstraction asynchronously
      try {
        const resDoc = await getDoc(doc(db, 'reservations', reservationId));
        if (resDoc.exists()) {
          const resData = resDoc.data() as Reservation;
          const siteDoc = await getDoc(doc(db, 'siteSettings', 'global'));
          const siteData = (siteDoc.exists() ? siteDoc.data() : {}) as SiteSettings;
          notificationService.sendReservationApproved(resData, siteData);
        }
      } catch (notifErr) {
        console.warn('Notification trigger warning:', notifErr);
      }

      return { success: true, message: data.message };
    }
    if (data.code === 'ALREADY_PROCESSED') {
      return { success: false, code: 'ALREADY_PROCESSED', message: data.message || 'Giao dịch này đã được xử lý trước đó.' };
    }
    if (data.message) {
      return { success: false, message: data.message };
    }
  } catch (apiErr) {
    console.warn('API approve error, fallback to direct Firestore transaction:', apiErr);
  }

  // 2. Direct Firestore fallback with strict transaction
  try {
    const resRef = doc(db, 'reservations', reservationId);
    const resSnap = await getDoc(resRef);

    if (!resSnap.exists()) {
      return { success: false, message: 'Không tìm thấy mã giao dịch giữ chỗ.' };
    }

    const reservation = resSnap.data() as Reservation;

    if (reservation.status !== 'pending') {
      return { success: false, code: 'ALREADY_PROCESSED', message: `Giao dịch đã ở trạng thái: ${reservation.status}` };
    }

    // Update reservation
    await updateDoc(resRef, {
      status: 'paid',
      approvedAt: serverTimestamp(),
      approvedBy: adminId,
      updatedAt: serverTimestamp(),
    });

    // Update property to 'reserved' and lock reservationId
    if (reservation.propertyId) {
      const propRef = doc(db, 'properties', reservation.propertyId);
      const propSnap = await getDoc(propRef);
      if (propSnap.exists()) {
        await updateDoc(propRef, {
          status: 'reserved',
          reservedByReservationId: reservationId,
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Log action
    await createAdminLog(
      adminId,
      'APPROVE_RESERVATION',
      'reservation',
      reservationId,
      `Admin (${adminEmail}) duyệt thanh toán giữ chỗ mã ${reservation.reservationCode} - Số tiền ${new Intl.NumberFormat('vi-VN').format(reservation.depositAmount)} VNĐ cho BĐS "${reservation.propertyTitle}"`
    );

    // Notify
    try {
      const siteDoc = await getDoc(doc(db, 'siteSettings', 'global'));
      const siteData = (siteDoc.exists() ? siteDoc.data() : {}) as SiteSettings;
      notificationService.sendReservationApproved(reservation, siteData);
    } catch (e) {}

    return { success: true, message: 'Đã xác nhận thanh toán và chuyển trạng thái BĐS sang "Đã giữ chỗ".' };
  } catch (err: any) {
    console.error('Error approving reservation:', err);
    return { success: false, message: err.message || 'Lỗi khi duyệt thanh toán.' };
  }
}

// CANCEL RESERVATION (Server Transaction with Safe Release)
export async function cancelReservation(
  reservationId: string,
  adminId: string,
  adminEmail: string,
  reason: string
): Promise<{ success: boolean; message: string; code?: string }> {
  // 1. Backend Server-Authoritative API Call
  try {
    const response = await fetch('/api/reservations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, reason, adminUid: adminId, adminEmail }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      // Trigger notification
      try {
        const resDoc = await getDoc(doc(db, 'reservations', reservationId));
        if (resDoc.exists()) {
          const resData = resDoc.data() as Reservation;
          const siteDoc = await getDoc(doc(db, 'siteSettings', 'global'));
          const siteData = (siteDoc.exists() ? siteDoc.data() : {}) as SiteSettings;
          notificationService.sendReservationCancelled(resData, siteData, reason);
        }
      } catch (e) {}

      return { success: true, message: data.message };
    }
    if (data.code === 'ALREADY_PROCESSED') {
      return { success: false, code: 'ALREADY_PROCESSED', message: data.message || 'Giao dịch đã được hủy trước đó.' };
    }
    if (data.message) {
      return { success: false, message: data.message };
    }
  } catch (apiErr) {
    console.warn('API cancel error, fallback to direct Firestore transaction:', apiErr);
  }

  // 2. Direct Firestore fallback
  try {
    const resRef = doc(db, 'reservations', reservationId);
    const resSnap = await getDoc(resRef);

    if (!resSnap.exists()) {
      return { success: false, message: 'Không tìm thấy giao dịch.' };
    }

    const reservation = resSnap.data() as Reservation;

    if (reservation.status === 'cancelled') {
      return { success: false, code: 'ALREADY_PROCESSED', message: 'Giao dịch này đã bị hủy trước đó.' };
    }

    await updateDoc(resRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      adminNote: reason ? `[Hủy bởi ${adminEmail}]: ${reason.trim()}` : `Hủy bởi ${adminEmail}`,
      updatedAt: serverTimestamp(),
    });

    // Check if property is reserved by this reservation, revert to available
    if (reservation.propertyId) {
      const propRef = doc(db, 'properties', reservation.propertyId);
      const propSnap = await getDoc(propRef);
      if (propSnap.exists()) {
        const propData = propSnap.data();
        if (propData.status === 'reserved' && (propData.reservedByReservationId === reservationId || !propData.reservedByReservationId)) {
          await updateDoc(propRef, {
            status: 'available',
            reservedByReservationId: null,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    // Log action
    await createAdminLog(
      adminId,
      'CANCEL_RESERVATION',
      'reservation',
      reservationId,
      `Admin (${adminEmail}) hủy giao dịch giữ chỗ ${reservation.reservationCode}. Lý do: ${reason || 'Không ghi rõ'}`
    );

    // Notify
    try {
      const siteDoc = await getDoc(doc(db, 'siteSettings', 'global'));
      const siteData = (siteDoc.exists() ? siteDoc.data() : {}) as SiteSettings;
      notificationService.sendReservationCancelled(reservation, siteData, reason);
    } catch (e) {}

    return { success: true, message: 'Đã hủy giao dịch và cập nhật trạng thái BĐS thành "Đang mở bán".' };
  } catch (err: any) {
    console.error('Error cancelling reservation:', err);
    return { success: false, message: err.message || 'Lỗi khi hủy giao dịch.' };
  }
}

// Fetch all reservations for Admin
export async function getAllReservations(): Promise<Reservation[]> {
  try {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
  } catch (err) {
    try {
      const snap2 = await getDocs(collection(db, 'reservations'));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
    } catch (e) {
      return [];
    }
  }
}

// Fetch all inquiries for Admin
export async function getAllInquiries(): Promise<Inquiry[]> {
  try {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
  } catch (err) {
    try {
      const snap2 = await getDocs(collection(db, 'inquiries'));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
    } catch (e) {
      return [];
    }
  }
}

// Update Inquiry Status (Server API with fallback)
export async function updateInquiryStatus(
  inquiryId: string,
  status: Inquiry['status'],
  assignedAgentId: string | null,
  adminNote: string,
  adminId: string
): Promise<void> {
  try {
    const res = await fetch('/api/inquiries/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, status, adminUid: adminId, adminEmail: adminId }),
    });
    if (res.ok) {
      if (assignedAgentId !== undefined) {
        await fetch('/api/inquiries/assign-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiryId, agentId: assignedAgentId, adminUid: adminId, adminEmail: adminId }),
        });
      }
      if (adminNote !== undefined) {
        await fetch('/api/inquiries/update-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiryId, adminNote, adminUid: adminId, adminEmail: adminId }),
        });
      }
      return;
    }
  } catch (e) {}

  // Fallback direct Firestore
  const docRef = doc(db, 'inquiries', inquiryId);
  await updateDoc(docRef, {
    status,
    assignedAgentId: assignedAgentId || null,
    assignedTo: assignedAgentId || null,
    adminNote: adminNote || '',
    notes: adminNote || '',
    updatedAt: serverTimestamp(),
  });
  await createAdminLog(adminId, 'UPDATE_INQUIRY', 'inquiry', inquiryId, `Cập nhật trạng thái lead sang [${status}]`);
}

// Property CRUD
export async function saveProperty(
  property: Partial<Property>,
  adminId: string
): Promise<string> {
  const id = property.id || `prop-${Date.now()}`;
  const docRef = doc(db, 'properties', id);

  const cleanSlug = property.slug || slugify(property.title || 'bat-dong-san');
  const code = property.propertyCode || generatePropertyCode();

  const dataToSave: Property = {
    id,
    title: property.title || 'Bất động sản cao cấp',
    slug: cleanSlug,
    propertyCode: code,
    listingType: property.listingType || 'sale',
    propertyType: property.propertyType || 'villa',
    status: property.status || 'available',
    shortDescription: property.shortDescription || '',
    description: property.description || '',
    price: Number(property.price) || 0,
    priceUnit: property.priceUnit || 'VND',
    area: Number(property.area) || 0,
    bedrooms: Number(property.bedrooms) || 0,
    bathrooms: Number(property.bathrooms) || 0,
    floors: Number(property.floors) || 1,
    parkingSlots: Number(property.parkingSlots) || 1,
    direction: property.direction || null,
    projectId: property.projectId || null,
    projectName: property.projectName || null,
    categoryId: property.categoryId || null,
    agentId: property.agentId || null,
    address: property.address || '',
    location: property.location || {
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: '',
      latitude: null,
      longitude: null,
    },
    amenities: property.amenities || [],
    legalStatus: property.legalStatus || 'Sổ hồng lâu dài chính chủ',
    images: property.images || [],
    thumbnail: property.thumbnail || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85',
    videoUrl: property.videoUrl || null,
    virtualTourUrl: property.virtualTourUrl || null,
    featured: Boolean(property.featured),
    isHot: Boolean(property.isHot),
    isNew: Boolean(property.isNew),
    viewCount: property.viewCount || 0,
    favoriteCount: property.favoriteCount || 0,
    inquiryCount: property.inquiryCount || 0,
    createdAt: property.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: property.publishedAt || serverTimestamp(),
    seo: property.seo || {
      title: property.title || '',
      description: property.shortDescription || '',
      keywords: 'bất động sản cao cấp, luxury real estate',
      ogImage: property.thumbnail || null,
    },
  };

  await setDoc(docRef, dataToSave, { merge: true });
  await createAdminLog(
    adminId,
    property.id ? 'UPDATE_PROPERTY' : 'CREATE_PROPERTY',
    'property',
    id,
    `Lưu bất động sản "${dataToSave.title}" (${dataToSave.propertyCode})`
  );

  return id;
}

export async function deleteProperty(propertyId: string, adminId: string): Promise<void> {
  await deleteDoc(doc(db, 'properties', propertyId));
  await createAdminLog(adminId, 'DELETE_PROPERTY', 'property', propertyId, `Xóa bất động sản ID ${propertyId}`);
}

// Project CRUD
export async function saveProject(project: Partial<Project>, adminId: string): Promise<string> {
  const id = project.id || `proj-${Date.now()}`;
  const docRef = doc(db, 'projects', id);
  const cleanSlug = project.slug || slugify(project.name || 'du-an');

  const dataToSave: Project = {
    id,
    name: project.name || '',
    slug: cleanSlug,
    developer: project.developer || '',
    projectType: project.projectType || '',
    status: project.status || 'selling',
    address: project.address || '',
    province: project.province || 'TP. Hồ Chí Minh',
    district: project.district || 'Quận 1',
    description: project.description || '',
    thumbnail: project.thumbnail || '',
    gallery: project.gallery || [],
    latitude: project.latitude || null,
    longitude: project.longitude || null,
    totalUnits: project.totalUnits || 0,
    availableUnits: project.availableUnits || 0,
    minPrice: project.minPrice || null,
    maxPrice: project.maxPrice || null,
    amenities: project.amenities || [],
    featured: Boolean(project.featured),
    createdAt: project.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    seo: project.seo || {
      title: project.name || '',
      description: project.description || '',
      keywords: 'dự án cao cấp, luxury project',
      ogImage: project.thumbnail || null,
    },
  };

  await setDoc(docRef, dataToSave, { merge: true });
  await createAdminLog(adminId, 'SAVE_PROJECT', 'project', id, `Lưu dự án "${dataToSave.name}"`);
  return id;
}

export async function deleteProject(projectId: string, adminId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
  await createAdminLog(adminId, 'DELETE_PROJECT', 'project', projectId, `Xóa dự án ID ${projectId}`);
}

// User management
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  } catch (err) {
    return [];
  }
}

export async function updateUserRole(
  targetUid: string,
  newRole: UserProfile['role'],
  adminId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { success: false, message: 'Không tìm thấy người dùng.' };

    const targetUser = snap.data() as UserProfile;

    // Check if target is admin and we are demoting them: verify they are not the last admin
    if (targetUser.role === 'admin' && newRole !== 'admin') {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Không thể hạ quyền của Admin duy nhất trong hệ thống.' };
      }
    }

    await updateDoc(userRef, { role: newRole, updatedAt: serverTimestamp() });
    await createAdminLog(adminId, 'UPDATE_USER_ROLE', 'user', targetUid, `Đổi vai trò người dùng ${targetUser.email} thành ${newRole}`);
    return { success: true, message: 'Đã cập nhật vai trò người dùng.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi cập nhật vai trò.' };
  }
}

export async function toggleUserBlockStatus(
  targetUid: string,
  currentStatus: UserProfile['status'],
  adminId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const userRef = doc(db, 'users', targetUid);
    await updateDoc(userRef, { status: nextStatus, updatedAt: serverTimestamp() });
    await createAdminLog(adminId, 'UPDATE_USER_STATUS', 'user', targetUid, `Chuyển trạng thái người dùng thành ${nextStatus}`);
    return { success: true, message: `Đã ${nextStatus === 'blocked' ? 'khóa' : 'mở khóa'} tài khoản thành công.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi cập nhật trạng thái.' };
  }
}

// Agent CRUD
export async function saveAgent(agent: Partial<Agent>, adminId: string): Promise<string> {
  const id = agent.id || `agent-${Date.now()}`;
  const docRef = doc(db, 'agents', id);
  const dataToSave: Agent = {
    id,
    name: agent.name || '',
    avatar: agent.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    phone: agent.phone || '',
    email: agent.email || '',
    position: agent.position || 'Chuyên Gia Tư Vấn BĐS Cao Cấp',
    bio: agent.bio || '',
    facebook: agent.facebook || '',
    zalo: agent.zalo || '',
    active: agent.active !== undefined ? agent.active : true,
    createdAt: agent.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, dataToSave, { merge: true });
  await createAdminLog(adminId, 'SAVE_AGENT', 'agent', id, `Lưu thông tin chuyên viên tư vấn "${dataToSave.name}"`);
  return id;
}

export async function deleteAgent(agentId: string, adminId: string): Promise<void> {
  await deleteDoc(doc(db, 'agents', agentId));
  await createAdminLog(adminId, 'DELETE_AGENT', 'agent', agentId, `Xóa chuyên viên ID ${agentId}`);
}

// Payment Settings Update
export async function updatePaymentSettings(settings: Partial<PaymentSettings>, adminId: string): Promise<void> {
  try {
    const res = await fetch('/api/admin/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, adminEmail: adminId, adminUid: adminId }),
    });
    if (res.ok) {
      return;
    }
  } catch (apiErr) {
    console.warn('API update payment settings error, fallback to Firestore client:', apiErr);
  }

  // Direct Firestore write fallback
  const docRef = doc(db, 'paymentSettings', 'main');
  const pubRef = doc(db, 'paymentPublicSettings', 'main');
  const data = { ...settings, updatedAt: serverTimestamp() };
  await setDoc(docRef, data, { merge: true });
  await setDoc(pubRef, data, { merge: true });
  await createAdminLog(adminId, 'UPDATE_PAYMENT_SETTINGS', 'settings', 'payment', 'Cập nhật cấu hình ngân hàng & giữ chỗ');
}

// Site Settings Update
export async function updateSiteSettings(settings: Partial<SiteSettings>, adminId: string): Promise<void> {
  const docRef = doc(db, 'siteSettings', 'global');
  await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
  await createAdminLog(adminId, 'UPDATE_SITE_SETTINGS', 'settings', 'site', 'Cập nhật cấu hình thương hiệu và nội dung website');
}

// Compatibility exports and aliases
export const logAdminAction = async (data: {
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
}) => {
  return createAdminLog(data.adminEmail, data.action, data.entity, data.entityId || '', data.description);
};

export const deletePropertyAdmin = deleteProperty;
export const createPropertyAdmin = async (data: Partial<Property>, adminEmail?: string) => {
  return saveProperty(data, adminEmail || 'admin');
};
export const updatePropertyAdmin = async (propertyId: string, data: Partial<Property>, adminEmail?: string) => {
  return saveProperty({ id: propertyId, ...data }, adminEmail || 'admin');
};

export const duplicatePropertyAdmin = async (originalProp: Property, adminEmail?: string) => {
  const newCode = generatePropertyCode();
  const copy: any = {
    ...originalProp,
    id: `prop-${Date.now()}`,
    propertyCode: newCode,
    title: `${originalProp.title} (Bản sao)`,
    slug: `${originalProp.slug || slugify(originalProp.title)}-copy-${Date.now().toString().slice(-4)}`,
    status: 'available',
    viewCount: 0,
    favoriteCount: 0,
    inquiryCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  return saveProperty(copy, adminEmail || 'admin');
};

export const updateInquiryStatusAdmin = async (
  inquiryId: string,
  status: Inquiry['status'],
  assignedTo?: string,
  notes?: string,
  adminEmail: string = 'admin'
) => {
  return updateInquiryStatus(inquiryId, status, assignedTo || null, notes || '', adminEmail);
};

export const approveReservationAdmin = async (
  reservationId: string,
  propertyId: string,
  adminEmail: string
) => {
  return approveReservation(reservationId, adminEmail, adminEmail);
};

export const cancelReservationAdmin = async (
  reservationId: string,
  propertyId: string,
  reason: string,
  adminEmail: string
) => {
  return cancelReservation(reservationId, adminEmail, adminEmail, reason);
};

export const updateUserRoleAdmin = async (
  targetUid: string,
  newRole: 'admin' | 'user',
  targetEmail: string,
  adminEmail: string
) => {
  return updateUserRole(targetUid, newRole, adminEmail);
};

export const toggleUserBlockAdmin = async (
  targetUid: string,
  isBlocked: boolean,
  targetEmail: string,
  adminEmail: string
) => {
  const userRef = doc(db, 'users', targetUid);
  await updateDoc(userRef, { isBlocked, updatedAt: serverTimestamp() });
  await createAdminLog(adminEmail, isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', 'users', targetUid, `${isBlocked ? 'Khóa' : 'Mở khóa'} tài khoản: ${targetEmail}`);
};

export const updatePaymentSettingsAdmin = async (
  settings: PaymentSettings,
  adminEmail: string
) => {
  return updatePaymentSettings(settings, adminEmail);
};

export const updateSiteSettingsAdmin = async (
  settings: SiteSettings,
  adminEmail: string
) => {
  return updateSiteSettings(settings, adminEmail);
};

export const getAllUsersAdmin = getAllUsers;

export const getInquiriesAdmin = async (): Promise<Inquiry[]> => {
  try {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
  } catch (err) {
    try {
      const snap2 = await getDocs(collection(db, 'inquiries'));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Inquiry));
    } catch (e) {
      return [];
    }
  }
};

export const getReservationsAdmin = async (): Promise<Reservation[]> => {
  try {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
  } catch (err) {
    try {
      const snap2 = await getDocs(collection(db, 'reservations'));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
    } catch (e) {
      return [];
    }
  }
};

// Re-export common getters
export { getProperties, getProjects, getAgents } from './propertyService';
