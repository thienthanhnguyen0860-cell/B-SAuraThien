import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Property,
  Project,
  Inquiry,
  Reservation,
  PropertyFilterParams,
  Agent,
} from '../types';
import { generateReservationCode } from '../lib/utils';
import {
  INITIAL_PROPERTIES,
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
  INITIAL_SITE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
} from '../lib/seedData';

// Fetch all public properties with fallback
export async function getProperties(params?: PropertyFilterParams): Promise<Property[]> {
  try {
    const colRef = collection(db, 'properties');
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return filterPropertiesLocally(INITIAL_PROPERTIES, params);
    }

    let list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Property));
    return filterPropertiesLocally(list, params);
  } catch (err) {
    console.error('Error fetching properties from Firestore, fallback to local data:', err);
    return filterPropertiesLocally(INITIAL_PROPERTIES, params);
  }
}

// Memory filtering and sorting for instant UI response and seamless user experience
export function filterPropertiesLocally(
  list: Property[],
  params?: PropertyFilterParams
): Property[] {
  let result = [...list];

  if (!params) return result;

  // Filter by listingType
  if (params.listingType && params.listingType !== 'all') {
    result = result.filter((p) => p.listingType === params.listingType);
  }

  // Filter by propertyType
  if (params.propertyType && params.propertyType !== 'all') {
    result = result.filter((p) => p.propertyType === params.propertyType);
  }

  // Filter by province
  if (params.province && params.province !== 'all') {
    result = result.filter((p) =>
      p.location?.province?.toLowerCase().includes(params.province!.toLowerCase())
    );
  }

  // Filter by district
  if (params.district && params.district !== 'all') {
    result = result.filter((p) =>
      p.location?.district?.toLowerCase().includes(params.district!.toLowerCase())
    );
  }

  // Filter by price range
  if (params.minPrice !== undefined && params.minPrice > 0) {
    result = result.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    result = result.filter((p) => p.price <= params.maxPrice!);
  }

  // Filter by area range
  if (params.minArea !== undefined && params.minArea > 0) {
    result = result.filter((p) => p.area >= params.minArea!);
  }
  if (params.maxArea !== undefined && params.maxArea > 0) {
    result = result.filter((p) => p.area <= params.maxArea!);
  }

  // Filter by bedrooms
  if (params.bedrooms && params.bedrooms !== 'all') {
    const bedCount = Number(params.bedrooms);
    if (!isNaN(bedCount)) {
      result = result.filter((p) => p.bedrooms >= bedCount);
    }
  }

  // Search keyword (Sanitized & multi-field search)
  if (params.keyword && params.keyword.trim() !== '') {
    const kw = params.keyword.toLowerCase().trim().slice(0, 100);
    result = result.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(kw);
      const addressMatch = p.address?.toLowerCase().includes(kw);
      const codeMatch = p.propertyCode?.toLowerCase().includes(kw);
      const descMatch = p.shortDescription?.toLowerCase().includes(kw);
      const distMatch = p.location?.district?.toLowerCase().includes(kw);
      const provMatch = p.location?.province?.toLowerCase().includes(kw);
      const projMatch = p.projectName?.toLowerCase().includes(kw);
      return (
        titleMatch ||
        addressMatch ||
        codeMatch ||
        descMatch ||
        distMatch ||
        provMatch ||
        projMatch
      );
    });
  }

  // Sort Whitelist
  if (params.sort) {
    switch (params.sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'area_desc':
        result.sort((a, b) => b.area - a.area);
        break;
      case 'most_viewed':
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }
  }

  return result;
}

// Get single property by ID or Slug
export async function getPropertyByIdOrSlug(idOrSlug: string): Promise<Property | null> {
  try {
    // Check by ID
    const docRef = doc(db, 'properties', idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Property;
    }

    // Query by Slug
    const q = query(collection(db, 'properties'), where('slug', '==', idOrSlug), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() } as Property;
    }

    // Check seed fallback
    const match = INITIAL_PROPERTIES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    return match || null;
  } catch (err) {
    console.error('Error fetching property:', err);
    return INITIAL_PROPERTIES.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
}

// Track Property View with 30-minute anti-spam cooldown per session
export async function incrementPropertyView(propertyId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storageKey = `aura_viewed_${propertyId}`;
      const lastViewed = sessionStorage.getItem(storageKey);
      const now = Date.now();
      if (lastViewed && now - Number(lastViewed) < 30 * 60 * 1000) {
        // Cooldown active, skip increment
        return;
      }
      sessionStorage.setItem(storageKey, String(now));
    }

    await fetch('/api/properties/increment-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
  } catch (err) {
    try {
      const docRef = doc(db, 'properties', propertyId);
      await updateDoc(docRef, {
        viewCount: increment(1),
      });
    } catch (e) {
      // Non-blocking
    }
  }
}

export const incrementPropertyViews = incrementPropertyView;
export const trackPropertyView = incrementPropertyView;

// Toggle User Favorite (Atomic)
export async function toggleFavorite(userId: string, propertyId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/users/toggle-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, propertyId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data.isFavorite;
      }
    }
  } catch (apiErr) {
    console.warn('API toggle favorite error, fallback to direct Firestore:', apiErr);
  }

  // Fallback direct Firestore transaction
  try {
    const userRef = doc(db, 'users', userId);
    const propRef = doc(db, 'properties', propertyId);

    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      const propSnap = await transaction.get(propRef);

      const favs: string[] = userSnap.data().favorites || [];
      const isFav = favs.includes(propertyId);
      const newFavs = isFav ? favs.filter((id) => id !== propertyId) : [...favs, propertyId];
      const delta = isFav ? -1 : 1;

      transaction.update(userRef, {
        favorites: newFavs,
        updatedAt: serverTimestamp(),
      });

      if (propSnap.exists()) {
        const cur = propSnap.data().favoriteCount || 0;
        transaction.update(propRef, {
          favoriteCount: Math.max(0, cur + delta),
        });
      }

      return !isFav;
    });

    return result;
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return false;
  }
}

// Get Projects
export async function getProjects(): Promise<Project[]> {
  try {
    const colRef = collection(db, 'projects');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return INITIAL_PROJECTS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  } catch (err) {
    return INITIAL_PROJECTS;
  }
}

export async function getProjectByIdOrSlug(idOrSlug: string): Promise<Project | null> {
  try {
    const docRef = doc(db, 'projects', idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Project;
    }

    const q = query(collection(db, 'projects'), where('slug', '==', idOrSlug), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() } as Project;
    }

    return INITIAL_PROJECTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  } catch (err) {
    return INITIAL_PROJECTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
}

// Get Agents
export async function getAgents(): Promise<Agent[]> {
  try {
    const colRef = collection(db, 'agents');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return INITIAL_AGENTS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Agent));
  } catch (err) {
    return INITIAL_AGENTS;
  }
}

// Submit Inquiry (Backend API with client-side fallback)
export async function submitInquiry(
  inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'notes' | 'assignedTo'>
): Promise<string> {
  try {
    const response = await fetch('/api/inquiries/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.inquiryId) {
        return data.inquiryId;
      }
    }
  } catch (apiErr) {
    console.warn('API inquiry submit error, fallback to direct Firestore:', apiErr);
  }

  // Fallback direct Firestore creation adhering to secure rules
  try {
    const newInquiry = {
      ...inquiryData,
      status: 'new',
      notes: '',
      adminNote: '',
      assignedTo: null,
      assignedAgentId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'inquiries'), newInquiry);

    if (inquiryData.propertyId && inquiryData.propertyId !== 'general-consultation') {
      try {
        await updateDoc(doc(db, 'properties', inquiryData.propertyId), {
          inquiryCount: increment(1),
        });
      } catch (e) {
        // Safe ignore
      }
    }

    return docRef.id;
  } catch (err: any) {
    console.error('Error submitting inquiry:', err);
    throw new Error('Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
  }
}

export const createInquiry = submitInquiry;

// Create Reservation (Server API with Fallback)
export async function createReservation(params: {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  property: Property;
  depositAmount?: number;
}): Promise<Reservation> {
  try {
    if (params.property.status !== 'available') {
      throw new Error('Bất động sản này hiện không còn khả dụng để giữ chỗ.');
    }

    // Call server endpoint
    const response = await fetch('/api/reservations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        userPhone: params.userPhone,
        propertyId: params.property.id,
        depositAmount: params.depositAmount,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.reservation) {
        return data.reservation as Reservation;
      }
      if (data.message) {
        throw new Error(data.message);
      }
    }
  } catch (apiErr: any) {
    console.warn('API reservation create error, attempting direct Firestore write:', apiErr);
  }

  // Fallback direct Firestore
  try {
    const reservationCode = generateReservationCode();
    const transferContent = `DATCOC ${reservationCode}`;

    const reservationData: Reservation = {
      id: reservationCode,
      reservationCode,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userPhone: params.userPhone,
      propertyId: params.property.id,
      propertyTitle: params.property.title,
      propertyCode: params.property.propertyCode,
      propertyThumbnail: params.property.thumbnail || params.property.images?.[0] || null,
      depositAmount: params.depositAmount || 100000000,
      transferContent,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      approvedAt: null,
      approvedBy: null,
      cancelledAt: null,
      adminNote: '',
    };

    await setDoc(doc(db, 'reservations', reservationCode), reservationData);
    return reservationData;
  } catch (err: any) {
    console.error('Error creating reservation:', err);
    throw err;
  }
}

// Get User Reservations (Secure Query for User ID with Status and Expiration Checks)
export async function getUserReservations(userId: string): Promise<Reservation[]> {
  try {
    // Trigger quick background check for expired reservations
    fetch('/api/reservations/check-expired').catch(() => {});

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
  } catch (err) {
    try {
      const fallbackQuery = query(collection(db, 'reservations'), where('userId', '==', userId));
      const snap2 = await getDocs(fallbackQuery);
      const list = snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
      return list.sort((a, b) => {
        const timeA = new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (e) {
      console.error('Error fetching user reservations:', e);
      return [];
    }
  }
}

// Get Reservation by Code (With auto-check for expiration)
export async function getReservationByCode(code: string): Promise<Reservation | null> {
  try {
    const docRef = doc(db, 'reservations', code);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }

    const data = { id: snap.id, ...snap.data() } as Reservation;

    // Check if pending but expiresAt is in the past
    if (data.status === 'pending' && data.expiresAt) {
      const expDate = new Date(data.expiresAt);
      if (expDate <= new Date()) {
        // Trigger server expire check
        fetch('/api/reservations/check-expired').catch(() => {});
        data.status = 'expired';
      }
    }

    return data;
  } catch (err) {
    console.error('Error fetching reservation by code:', err);
    return null;
  }
}

// Seed initial database collections if empty
export async function seedInitialDatabaseIfNeeded(): Promise<void> {
  try {
    const propSnap = await getDocs(collection(db, 'properties'));
    if (propSnap.empty) {
      console.log('Seeding initial properties to Firestore...');
      for (const prop of INITIAL_PROPERTIES) {
        await setDoc(doc(db, 'properties', prop.id), {
          ...prop,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const projSnap = await getDocs(collection(db, 'projects'));
    if (projSnap.empty) {
      console.log('Seeding initial projects to Firestore...');
      for (const proj of INITIAL_PROJECTS) {
        await setDoc(doc(db, 'projects', proj.id), {
          ...proj,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const agentSnap = await getDocs(collection(db, 'agents'));
    if (agentSnap.empty) {
      console.log('Seeding initial agents to Firestore...');
      for (const agent of INITIAL_AGENTS) {
        await setDoc(doc(db, 'agents', agent.id), {
          ...agent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Ensure siteSettings and paymentSettings docs exist
    const siteSettingsDoc = await getDoc(doc(db, 'siteSettings', 'global'));
    if (!siteSettingsDoc.exists()) {
      await setDoc(doc(db, 'siteSettings', 'global'), {
        ...INITIAL_SITE_SETTINGS,
        updatedAt: serverTimestamp(),
      });
    }

    const paymentSettingsDoc = await getDoc(doc(db, 'paymentSettings', 'main'));
    if (!paymentSettingsDoc.exists()) {
      await setDoc(doc(db, 'paymentSettings', 'main'), {
        ...INITIAL_PAYMENT_SETTINGS,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Database seeding check completed or skipped:', err);
  }
}
