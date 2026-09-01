import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { z } from 'zod';
import firebaseConfigData from './firebase-applet-config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Backend Firebase Instance
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const serverFirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(serverFirebaseApp, firebaseConfigData.firestoreDatabaseId || '(default)');

const SUPER_ADMIN_EMAILS = ['thienthanhnguyen0860@gmail.com'];

// Helper: Check Admin Role from Firestore User Document or SuperAdmin email
async function verifyIsAdmin(adminUid?: string, adminEmail?: string): Promise<boolean> {
  if (adminEmail && SUPER_ADMIN_EMAILS.includes(adminEmail.toLowerCase().trim())) {
    return true;
  }
  if (!adminUid) return false;

  try {
    const userDoc = await getDoc(doc(db, 'users', adminUid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === 'admin' && data.status === 'active';
    }
  } catch (err) {
    console.error('Error verifying admin permissions:', err);
  }
  return false;
}

// Helper: Generate Secure Reservation Code (RS + YYMMDD + 4 alphanumeric chars)
function generateSecureReservationCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RS${dateStr}${rand}`;
}

// Simple in-memory rate limiter for spam prevention
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(key: string, maxRequests = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count++;
  return true;
}

// -------------------------------------------------------------
// EXPIRATION ENGINE: Check and transition expired pending reservations
// -------------------------------------------------------------
async function checkAndExpireReservations(): Promise<{ expiredCount: number }> {
  try {
    const q = query(
      collection(db, 'reservations'),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    if (snap.empty) return { expiredCount: 0 };

    const now = new Date();
    let expiredCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (!data.expiresAt) continue;

      const expiryDate = new Date(data.expiresAt);
      if (expiryDate <= now) {
        const resId = docSnap.id;
        const resRef = doc(db, 'reservations', resId);

        try {
          await runTransaction(db, async (transaction) => {
            const currentResSnap = await transaction.get(resRef);
            if (!currentResSnap.exists()) return;
            const currentData = currentResSnap.data();

            if (currentData.status !== 'pending') return;

            // 1. Mark reservation as expired
            transaction.update(resRef, {
              status: 'expired',
              updatedAt: serverTimestamp(),
            });

            // 2. Unlock property if reserved by this reservation
            if (currentData.propertyId) {
              const propRef = doc(db, 'properties', currentData.propertyId);
              const propSnap = await transaction.get(propRef);
              if (propSnap.exists()) {
                const pData = propSnap.data();
                if (
                  pData.status === 'reserved' &&
                  (pData.reservedByReservationId === resId || !pData.reservedByReservationId)
                ) {
                  transaction.update(propRef, {
                    status: 'available',
                    reservedByReservationId: null,
                    updatedAt: serverTimestamp(),
                  });
                }
              }
            }

            // 3. System audit log
            const logRef = doc(collection(db, 'adminLogs'));
            transaction.set(logRef, {
              adminId: 'system',
              action: 'EXPIRE_RESERVATION',
              entityType: 'reservation',
              entityId: resId,
              description: `Hệ thống tự động chuyển trạng thái HẾT HẠN cho giao dịch giữ chỗ mã ${currentData.reservationCode || resId} do quá thời hạn thanh toán.`,
              createdAt: serverTimestamp(),
            });
          });

          expiredCount++;
        } catch (txErr) {
          console.error(`Error expiring reservation ${resId}:`, txErr);
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`[ExpirationEngine] Successfully expired ${expiredCount} pending reservations.`);
    }
    return { expiredCount };
  } catch (err) {
    console.error('[ExpirationEngine] Error running checkAndExpireReservations:', err);
    return { expiredCount: 0 };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Security Headers & Request Correlation ID Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const requestId = req.headers['x-request-id'] || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', String(requestId));
    next();
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const robotsContent = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /account/',
      'Disallow: /checkout/',
      'Disallow: /api/internal/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robotsContent);
  });

  // Dynamic sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      const now = new Date().toISOString();

      const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
        { loc: `${baseUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/properties`, lastmod: now, changefreq: 'hourly', priority: '0.9' },
        { loc: `${baseUrl}/projects`, lastmod: now, changefreq: 'daily', priority: '0.8' },
      ];

      // Published properties from Firestore
      try {
        const propsSnap = await getDocs(collection(db, 'properties'));
        for (const docSnap of propsSnap.docs) {
          const data = docSnap.data();
          if (data.status && ['available', 'reserved', 'sold', 'rented'].includes(data.status)) {
            const slug = data.slug || docSnap.id;
            let lastModDate = now;
            if (data.updatedAt?.toDate) {
              lastModDate = data.updatedAt.toDate().toISOString();
            } else if (data.createdAt?.toDate) {
              lastModDate = data.createdAt.toDate().toISOString();
            }
            urls.push({
              loc: `${baseUrl}/property/${encodeURIComponent(slug)}`,
              lastmod: lastModDate,
              changefreq: 'daily',
              priority: '0.8',
            });
          }
        }
      } catch (e) {
        console.warn('Sitemap property fetch notice:', e);
      }

      // Projects from Firestore
      try {
        const projSnap = await getDocs(collection(db, 'projects'));
        for (const docSnap of projSnap.docs) {
          const data = docSnap.data();
          const slug = data.slug || docSnap.id;
          let lastModDate = now;
          if (data.updatedAt?.toDate) {
            lastModDate = data.updatedAt.toDate().toISOString();
          }
          urls.push({
            loc: `${baseUrl}/project/${encodeURIComponent(slug)}`,
            lastmod: lastModDate,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      } catch (e) {
        console.warn('Sitemap project fetch notice:', e);
      }

      const sitemapXml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
        ),
        '</urlset>',
      ].join('\n');

      res.type('application/xml').send(sitemapXml);
    } catch (err: any) {
      console.error('Error generating sitemap.xml:', err);
      res.status(500).type('text/plain').send('Error generating sitemap');
    }
  });

  // Validate slug uniqueness
  app.post('/api/properties/validate-slug', async (req, res) => {
    try {
      const { slug, excludePropertyId } = req.body;
      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ valid: false, message: 'Slug không hợp lệ' });
      }
      const cleanSlug = slug.toLowerCase().trim();
      const q = query(collection(db, 'properties'), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      const isDuplicate = snap.docs.some((d) => d.id !== excludePropertyId);
      if (isDuplicate) {
        return res.json({ valid: false, message: 'Slug này đã được sử dụng. Vui lòng chọn slug khác.' });
      }
      return res.json({ valid: true });
    } catch (err: any) {
      return res.status(500).json({ valid: false, message: err.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Manual / on-demand expiration check (safely returns status)
  app.get('/api/reservations/check-expired', async (req, res) => {
    try {
      const result = await checkAndExpireReservations();
      res.json({ success: true, ...result });
    } catch {
      res.json({ success: true, expiredCount: 0 });
    }
  });

  // -------------------------------------------------------------
  // 1. CREATE RESERVATION (Server Authority with Snapshots)
  // -------------------------------------------------------------
  const CreateReservationSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    userEmail: z.string().email('Invalid email address'),
    userName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    userPhone: z.string().min(8, 'Phone must be at least 8 digits').max(20),
    propertyId: z.string().min(1, 'Property ID is required'),
    depositAmount: z.number().positive().optional(),
  });

  app.post('/api/reservations/create', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(`res_${clientIp}`, 15, 60000)) {
        return res.status(429).json({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau 1 phút.',
        });
      }

      const parsed = CreateReservationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.',
        });
      }

      const { userId, userEmail, userName, userPhone, propertyId } = parsed.data;

      // 1. Verify Property Status
      const propRef = doc(db, 'properties', propertyId);
      const propSnap = await getDoc(propRef);

      if (!propSnap.exists()) {
        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: 'Bất động sản không tồn tại trên hệ thống.',
        });
      }

      const propertyData = propSnap.data();
      if (propertyData.status !== 'available') {
        return res.status(400).json({
          success: false,
          code: 'PROPERTY_UNAVAILABLE',
          message: 'Bất động sản này hiện không còn khả dụng để giữ chỗ (Đã được giữ chỗ hoặc đã bán).',
        });
      }

      // 2. Fetch Payment Policy Settings for deposit amount & expiry
      let depositAmount = 100000000;
      let expiryMinutes = 1440; // Default 24 hours

      try {
        const paymentRef = doc(db, 'paymentSettings', 'main');
        const paymentSnap = await getDoc(paymentRef);
        if (paymentSnap.exists()) {
          const pData = paymentSnap.data();
          if (pData.reservationDepositDefault && typeof pData.reservationDepositDefault === 'number') {
            depositAmount = pData.reservationDepositDefault;
          }
          if (pData.reservationExpiryMinutes && typeof pData.reservationExpiryMinutes === 'number') {
            expiryMinutes = pData.reservationExpiryMinutes;
          }
        }
      } catch (e) {
        console.warn('Using default deposit config:', e);
      }

      if (parsed.data.depositAmount && parsed.data.depositAmount > 0) {
        depositAmount = parsed.data.depositAmount;
      }

      // 3. Generate unique reservation code
      let reservationCode = generateSecureReservationCode();
      let resRef = doc(db, 'reservations', reservationCode);
      let attempts = 0;
      while ((await getDoc(resRef)).exists() && attempts < 5) {
        reservationCode = generateSecureReservationCode();
        resRef = doc(db, 'reservations', reservationCode);
        attempts++;
      }

      const transferContent = `DATCOC ${reservationCode}`;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

      const newReservation = {
        id: reservationCode,
        reservationCode,
        userId,
        userEmail: userEmail.toLowerCase().trim(),
        userName: userName.trim(),
        userPhone: userPhone.trim(),
        propertyId,
        propertyTitle: propertyData.title || 'Bất động sản cao cấp',
        propertyCode: propertyData.propertyCode || null,
        propertyThumbnail: propertyData.thumbnail || (propertyData.images && propertyData.images[0]) || null,
        depositAmount,
        transferContent,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        createdAt: serverTimestamp(),
        expiresAt,
        approvedAt: null,
        approvedBy: null,
        cancelledAt: null,
        adminNote: '',
        notificationState: {
          approvedEmailSentAt: null,
          cancelledEmailSentAt: null,
        },
      };

      await setDoc(resRef, newReservation);

      return res.json({
        success: true,
        reservationCode,
        reservation: newReservation,
      });
    } catch (err: any) {
      console.error('API /api/reservations/create error:', err);
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        message: err.message || 'Lỗi hệ thống khi tạo yêu cầu giữ chỗ.',
      });
    }
  });

  // -------------------------------------------------------------
  // 2. APPROVE RESERVATION (Server Transaction with Anti-Collision Locking)
  // -------------------------------------------------------------
  const ApproveReservationSchema = z.object({
    reservationId: z.string().min(1),
    adminUid: z.string().optional(),
    adminEmail: z.string().email(),
  });

  app.post('/api/reservations/approve', async (req, res) => {
    try {
      const parsed = ApproveReservationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Thông tin yêu cầu duyệt không hợp lệ.',
        });
      }

      const { reservationId, adminUid, adminEmail } = parsed.data;

      // Verify Admin
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền thực hiện thao tác quản trị này.',
        });
      }

      const resRef = doc(db, 'reservations', reservationId);

      // Execute Atomic Transaction
      const result = await runTransaction(db, async (transaction) => {
        const resSnap = await transaction.get(resRef);
        if (!resSnap.exists()) {
          throw new Error('NOT_FOUND:Không tìm thấy thông tin giao dịch giữ chỗ.');
        }

        const reservationData = resSnap.data();

        // Prevent race conditions / double approval
        if (reservationData.status !== 'pending') {
          throw new Error(`ALREADY_PROCESSED:Giao dịch mã ${reservationData.reservationCode} đã ở trạng thái [${reservationData.status}] trước đó.`);
        }

        const propertyId = reservationData.propertyId;
        const propRef = doc(db, 'properties', propertyId);
        const propSnap = await transaction.get(propRef);

        if (!propSnap.exists()) {
          throw new Error('NOT_FOUND:Không tìm thấy bất động sản liên kết.');
        }

        const propertyData = propSnap.data();
        if (propertyData.status !== 'available') {
          throw new Error(`PROPERTY_UNAVAILABLE:Bất động sản hiện không ở trạng thái sẵn sàng (Hiện tại: ${propertyData.status}).`);
        }

        // 1. Update Reservation
        transaction.update(resRef, {
          status: 'paid',
          approvedAt: serverTimestamp(),
          approvedBy: adminUid || adminEmail,
          updatedAt: serverTimestamp(),
          'notificationState.approvedEmailSentAt': new Date().toISOString(),
        });

        // 2. Lock Property to 'reserved' and attach reservedByReservationId
        transaction.update(propRef, {
          status: 'reserved',
          reservedByReservationId: reservationId,
          updatedAt: serverTimestamp(),
        });

        // 3. Create Audit Log
        const logRef = doc(collection(db, 'adminLogs'));
        transaction.set(logRef, {
          adminId: adminUid || adminEmail,
          action: 'APPROVE_RESERVATION',
          entityType: 'reservation',
          entityId: reservationId,
          description: `Admin (${adminEmail}) xác nhận duyệt thanh toán đặt cọc ${new Intl.NumberFormat('vi-VN').format(reservationData.depositAmount)} VNĐ cho BĐS "${reservationData.propertyTitle}" (Mã BĐS: ${propertyData.propertyCode || propertyId})`,
          createdAt: serverTimestamp(),
        });

        return {
          reservationCode: reservationData.reservationCode,
          propertyTitle: reservationData.propertyTitle,
        };
      });

      return res.json({
        success: true,
        message: `Đã xác nhận thanh toán giữ chỗ mã ${result.reservationCode}. BĐS đã chuyển sang trạng thái ĐÃ GIỮ CHỖ.`,
      });
    } catch (err: any) {
      console.error('API /api/reservations/approve error:', err);
      const errMsg = err.message || '';
      if (errMsg.startsWith('ALREADY_PROCESSED:')) {
        return res.status(409).json({ success: false, code: 'ALREADY_PROCESSED', message: errMsg.replace('ALREADY_PROCESSED:', '') });
      }
      if (errMsg.startsWith('PROPERTY_UNAVAILABLE:')) {
        return res.status(409).json({ success: false, code: 'PROPERTY_UNAVAILABLE', message: errMsg.replace('PROPERTY_UNAVAILABLE:', '') });
      }
      if (errMsg.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: errMsg.replace('NOT_FOUND:', '') });
      }
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Lỗi máy chủ khi duyệt giữ chỗ.' });
    }
  });

  // -------------------------------------------------------------
  // 3. CANCEL RESERVATION (Server Transaction with Safe Release)
  // -------------------------------------------------------------
  const CancelReservationSchema = z.object({
    reservationId: z.string().min(1),
    reason: z.string().min(3, 'Lý do hủy phải từ 3 ký tự trở lên'),
    adminUid: z.string().optional(),
    adminEmail: z.string().email(),
  });

  app.post('/api/reservations/cancel', async (req, res) => {
    try {
      const parsed = CancelReservationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.',
        });
      }

      const { reservationId, reason, adminUid, adminEmail } = parsed.data;

      // Verify Admin
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền thực hiện thao tác quản trị này.',
        });
      }

      const resRef = doc(db, 'reservations', reservationId);

      const result = await runTransaction(db, async (transaction) => {
        const resSnap = await transaction.get(resRef);
        if (!resSnap.exists()) {
          throw new Error('NOT_FOUND:Không tìm thấy giao dịch giữ chỗ.');
        }

        const reservationData = resSnap.data();

        if (reservationData.status === 'cancelled') {
          throw new Error(`ALREADY_PROCESSED:Giao dịch mã ${reservationData.reservationCode} đã bị hủy trước đó.`);
        }

        // 1. Update Reservation
        transaction.update(resRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          adminNote: `[Hủy bởi ${adminEmail}]: ${reason.trim()}`,
          updatedAt: serverTimestamp(),
          'notificationState.cancelledEmailSentAt': new Date().toISOString(),
        });

        // 2. Check Property release: ONLY release to 'available' IF it was reserved by this exact reservation
        let releasedProperty = false;
        if (reservationData.propertyId) {
          const propRef = doc(db, 'properties', reservationData.propertyId);
          const propSnap = await transaction.get(propRef);
          if (propSnap.exists()) {
            const propData = propSnap.data();
            if (
              propData.status === 'reserved' &&
              (propData.reservedByReservationId === reservationId || !propData.reservedByReservationId)
            ) {
              transaction.update(propRef, {
                status: 'available',
                reservedByReservationId: null,
                updatedAt: serverTimestamp(),
              });
              releasedProperty = true;
            }
          }
        }

        // 3. Create Audit Log
        const logRef = doc(collection(db, 'adminLogs'));
        transaction.set(logRef, {
          adminId: adminUid || adminEmail,
          action: 'CANCEL_RESERVATION',
          entityType: 'reservation',
          entityId: reservationId,
          description: `Admin (${adminEmail}) hủy yêu cầu giữ chỗ mã ${reservationData.reservationCode}. Lý do: "${reason.trim()}". BĐS ${releasedProperty ? 'đã được mở khả dụng trở lại' : 'giữ nguyên trạng thái'}.`,
          createdAt: serverTimestamp(),
        });

        return {
          reservationCode: reservationData.reservationCode,
          releasedProperty,
        };
      });

      return res.json({
        success: true,
        message: `Đã hủy yêu cầu giữ chỗ mã ${result.reservationCode}.${result.releasedProperty ? ' Bất động sản đã được mở khả dụng trở lại.' : ''}`,
      });
    } catch (err: any) {
      console.error('API /api/reservations/cancel error:', err);
      const errMsg = err.message || '';
      if (errMsg.startsWith('ALREADY_PROCESSED:')) {
        return res.status(409).json({ success: false, code: 'ALREADY_PROCESSED', message: errMsg.replace('ALREADY_PROCESSED:', '') });
      }
      if (errMsg.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: errMsg.replace('NOT_FOUND:', '') });
      }
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Lỗi máy chủ khi hủy yêu cầu giữ chỗ.' });
    }
  });

  // -------------------------------------------------------------
  // 4. SUBMIT INQUIRY (Server Sanitization & Rate-limiting)
  // -------------------------------------------------------------
  const SubmitInquirySchema = z.object({
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(8, 'Số điện thoại từ 8-20 số').max(20),
    message: z.string().max(1000).optional().default(''),
    propertyId: z.string().optional().nullable(),
    propertyTitle: z.string().optional().nullable(),
    source: z.string().optional().default('general_inquiry'),
    userId: z.string().optional().nullable(),
  });

  app.post('/api/inquiries/create', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(`inq_${clientIp}`, 10, 60000)) {
        return res.status(429).json({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Bạn đang gửi yêu cầu quá thường xuyên. Vui lòng chờ ít phút.',
        });
      }

      const parsed = SubmitInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ.',
        });
      }

      const { fullName, email, phone, message, propertyId, propertyTitle, source, userId } = parsed.data;

      const newInquiry = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: (message || '').trim(),
        propertyId: propertyId || null,
        propertyTitle: propertyTitle || null,
        source: source || 'property_detail',
        userId: userId || null,
        status: 'new',
        assignedAgentId: null,
        assignedTo: null,
        adminNote: '',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'inquiries'), newInquiry);

      // Increment inquiry count atomically
      if (propertyId && propertyId !== 'general-consultation') {
        try {
          const propRef = doc(db, 'properties', propertyId);
          await updateDoc(propRef, {
            inquiryCount: increment(1),
          });
        } catch (e) {
          // Non-blocking
        }
      }

      return res.json({ success: true, inquiryId: docRef.id });
    } catch (err: any) {
      console.error('API /api/inquiries/create error:', err);
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Lỗi khi gửi yêu cầu tư vấn.' });
    }
  });

  // -------------------------------------------------------------
  // 5. LEAD PIPELINE MANAGEMENT (Admin Endpoints)
  // -------------------------------------------------------------
  // Update Inquiry Status
  app.post('/api/inquiries/update-status', async (req, res) => {
    try {
      const { inquiryId, status, adminUid, adminEmail } = req.body;
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Truy cập bị từ chối.' });
      }

      const validStatuses = ['new', 'contacted', 'qualified', 'closed', 'spam'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Trạng thái không hợp lệ.' });
      }

      const inqRef = doc(db, 'inquiries', inquiryId);
      const inqSnap = await getDoc(inqRef);
      if (!inqSnap.exists()) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Không tìm thấy Lead tư vấn.' });
      }

      await updateDoc(inqRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'adminLogs'), {
        adminId: adminUid || adminEmail,
        action: 'CHANGE_INQUIRY_STATUS',
        entityType: 'inquiry',
        entityId: inquiryId,
        description: `Admin (${adminEmail}) chuyển trạng thái lead tư vấn của khách "${inqSnap.data().fullName}" sang [${status}].`,
        createdAt: serverTimestamp(),
      });

      return res.json({ success: true, message: 'Đã cập nhật trạng thái lead thành công.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Assign Agent to Inquiry
  app.post('/api/inquiries/assign-agent', async (req, res) => {
    try {
      const { inquiryId, agentId, adminUid, adminEmail } = req.body;
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Truy cập bị từ chối.' });
      }

      const inqRef = doc(db, 'inquiries', inquiryId);
      const inqSnap = await getDoc(inqRef);
      if (!inqSnap.exists()) {
        return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Không tìm thấy Lead tư vấn.' });
      }

      let agentName = 'Chưa gán';
      if (agentId) {
        const agentDoc = await getDoc(doc(db, 'agents', agentId));
        if (!agentDoc.exists()) {
          return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Chuyên viên tư vấn không tồn tại.' });
        }
        agentName = agentDoc.data().name || agentId;
      }

      await updateDoc(inqRef, {
        assignedAgentId: agentId || null,
        assignedTo: agentId || null,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'adminLogs'), {
        adminId: adminUid || adminEmail,
        action: 'ASSIGN_INQUIRY_AGENT',
        entityType: 'inquiry',
        entityId: inquiryId,
        description: `Admin (${adminEmail}) gán chuyên viên tư vấn "${agentName}" cho Lead của khách "${inqSnap.data().fullName}".`,
        createdAt: serverTimestamp(),
      });

      return res.json({ success: true, message: 'Đã gán chuyên viên tư vấn thành công.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Update Admin Note on Inquiry
  app.post('/api/inquiries/update-note', async (req, res) => {
    try {
      const { inquiryId, adminNote, adminUid, adminEmail } = req.body;
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Truy cập bị từ chối.' });
      }

      const sanitizedNote = String(adminNote || '').slice(0, 3000).trim();

      const inqRef = doc(db, 'inquiries', inquiryId);
      await updateDoc(inqRef, {
        adminNote: sanitizedNote,
        notes: sanitizedNote,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'adminLogs'), {
        adminId: adminUid || adminEmail,
        action: 'UPDATE_ADMIN_NOTE',
        entityType: 'inquiry',
        entityId: inquiryId,
        description: `Admin (${adminEmail}) cập nhật ghi chú nội bộ cho Lead.`,
        createdAt: serverTimestamp(),
      });

      return res.json({ success: true, message: 'Đã lưu ghi chú nội bộ.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, code: 'SERVER_ERROR', message: err.message });
    }
  });

  // -------------------------------------------------------------
  // 6. ATOMIC VIEW & FAVORITE COUNTERS
  // -------------------------------------------------------------
  app.post('/api/properties/increment-view', async (req, res) => {
    try {
      const { propertyId } = req.body;
      if (!propertyId || typeof propertyId !== 'string') {
        return res.status(400).json({ success: false, message: 'Property ID required' });
      }

      const propRef = doc(db, 'properties', propertyId);
      await updateDoc(propRef, {
        viewCount: increment(1),
      });

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false });
    }
  });

  // Atomic Favorite Toggle
  app.post('/api/users/toggle-favorite', async (req, res) => {
    try {
      const { userId, propertyId } = req.body;
      if (!userId || !propertyId) {
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Missing parameters' });
      }

      const userRef = doc(db, 'users', userId);
      const propRef = doc(db, 'properties', propertyId);

      const result = await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const propSnap = await transaction.get(propRef);

        if (!userSnap.exists()) {
          throw new Error('User does not exist');
        }

        const userData = userSnap.data();
        const currentFavorites: string[] = userData.favorites || [];
        const isFavorite = currentFavorites.includes(propertyId);

        let newFavorites: string[];
        let countDelta = 0;

        if (isFavorite) {
          newFavorites = currentFavorites.filter((id) => id !== propertyId);
          countDelta = -1;
        } else {
          newFavorites = [...currentFavorites, propertyId];
          countDelta = 1;
        }

        transaction.update(userRef, {
          favorites: newFavorites,
          updatedAt: serverTimestamp(),
        });

        if (propSnap.exists()) {
          const currentCount = propSnap.data().favoriteCount || 0;
          const updatedCount = Math.max(0, currentCount + countDelta);
          transaction.update(propRef, {
            favoriteCount: updatedCount,
          });
        }

        return { isFavorite: !isFavorite, newFavorites };
      });

      return res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // -------------------------------------------------------------
  // 7. UPDATE PAYMENT SETTINGS (Admin Exclusive & Sanitized)
  // -------------------------------------------------------------
  app.post('/api/admin/payment-settings', async (req, res) => {
    try {
      const { settings, adminUid, adminEmail } = req.body;
      const isAdmin = await verifyIsAdmin(adminUid, adminEmail);
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Truy cập bị từ chối.' });
      }

      const sanitizedPublicSettings = {
        bankName: String(settings.bankName || '').trim(),
        bankCode: String(settings.bankCode || '').trim().toUpperCase(),
        accountName: String(settings.accountName || '').trim().toUpperCase(),
        accountNumber: String(settings.accountNumber || '').trim(),
        branch: String(settings.branch || '').trim(),
        qrTemplateUrl: settings.qrTemplateUrl || null,
        qrTemplate: settings.qrTemplate || 'compact2',
        paymentInstructions: String(settings.paymentInstructions || '').trim(),
        reservationDepositDefault: Number(settings.reservationDepositDefault) || 100000000,
        reservationExpiryMinutes: Number(settings.reservationExpiryMinutes) || 1440,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'paymentPublicSettings', 'main'), sanitizedPublicSettings, { merge: true });
      await setDoc(doc(db, 'paymentSettings', 'main'), sanitizedPublicSettings, { merge: true });

      // Audit log
      await addDoc(collection(db, 'adminLogs'), {
        adminId: adminUid || adminEmail,
        action: 'UPDATE_PAYMENT_SETTINGS',
        entityType: 'paymentSettings',
        entityId: 'main',
        description: `Admin (${adminEmail}) cập nhật cấu hình tài khoản ngân hàng và chính sách giữ chỗ.`,
        createdAt: serverTimestamp(),
      });

      return res.json({ success: true });
    } catch (err: any) {
      console.error('API /api/admin/payment-settings error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ.' });
    }
  });

  // Helper: Inject Dynamic Social Meta into HTML
  async function renderHtmlWithDynamicMeta(rawHtml: string, req: express.Request): Promise<string> {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      const pathname = req.path;

      let title = 'AURA LUXURY | Bất Động Sản Đẳng Cấp & Thượng Lưu';
      let description = 'Khám phá những bất động sản thượng lưu, biệt thự, penthouse, shophouse đắt giá hàng đầu.';
      let ogImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85';
      let canonicalUrl = `${baseUrl}${pathname}`;

      // 1. Property Detail Route: /property/:slug or /properties/:slug
      if (pathname.startsWith('/property/') || (pathname.startsWith('/properties/') && pathname !== '/properties')) {
        const slugOrId = pathname.replace(/^\/propert(y|ies)\//, '');
        if (slugOrId) {
          // Query by slug or doc id
          let propData: any = null;
          try {
            const q = query(collection(db, 'properties'), where('slug', '==', slugOrId));
            const snap = await getDocs(q);
            if (!snap.empty) {
              propData = snap.docs[0].data();
            } else {
              const docSnap = await getDoc(doc(db, 'properties', slugOrId));
              if (docSnap.exists()) {
                propData = docSnap.data();
              }
            }
          } catch (e) {
            console.warn('SSR property lookup notice:', e);
          }

          if (propData) {
            title = propData.seo?.title || `${propData.title} | AURA LUXURY`;
            description = (propData.seo?.description || propData.shortDescription || propData.description || description)
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 157);
            ogImage = propData.seo?.ogImage || propData.thumbnail || (propData.images && propData.images[0]) || ogImage;
            if (ogImage.startsWith('/')) ogImage = `${baseUrl}${ogImage}`;
            canonicalUrl = `${baseUrl}/property/${encodeURIComponent(propData.slug || slugOrId)}`;
          }
        }
      } else if (pathname === '/properties') {
        title = 'Bộ Sưu Tập Bất Động Sản Cao Cấp | AURA LUXURY';
        description = 'Danh sách biệt thự, dinh thự, penthouse và bất động sản thượng lưu đang mở bán và cho thuê.';
        canonicalUrl = `${baseUrl}/properties`;
      } else if (pathname === '/projects') {
        title = 'Dự Án Đại Đô Thị & Nghỉ Dưỡng Hạng Sang | AURA LUXURY';
        description = 'Khám phá các tổ hợp dự án nghỉ dưỡng, dinh thự và căn hộ hàng hiệu hàng đầu Việt Nam.';
        canonicalUrl = `${baseUrl}/projects`;
      }

      // Escape HTML
      const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      let modifiedHtml = rawHtml;
      // Replace <title>
      modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

      // Replace or insert meta tags
      const metaTags = `
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />`;

      if (modifiedHtml.includes('</head>')) {
        modifiedHtml = modifiedHtml.replace('</head>', `${metaTags}\n  </head>`);
      }

      return modifiedHtml;
    } catch (err) {
      console.error('Error injecting dynamic SSR meta:', err);
      return rawHtml;
    }
  }

  // -------------------------------------------------------------
  // 8. Vite Integration & SPA Fallback
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    let cachedHtml = '';

    app.use(express.static(distPath, { index: false }));

    app.get('*', async (req, res) => {
      try {
        if (!cachedHtml && fs.existsSync(indexHtmlPath)) {
          cachedHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        }
        if (cachedHtml) {
          const html = await renderHtmlWithDynamicMeta(cachedHtml, req);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(html);
        }
        return res.sendFile(indexHtmlPath);
      } catch (err) {
        return res.sendFile(indexHtmlPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURA Luxury Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
