/**
 * Safe Google Analytics 4 Wrapper & Event Tracking
 * Strictly sanitized: Zero Personally Identifiable Information (PII) transmitted.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

let initializedGaId: string | null = null;

/**
 * Initialize or update Google Analytics script dynamically from siteSettings
 */
export function initGoogleAnalytics(gaId?: string | null): void {
  if (!gaId || typeof gaId !== 'string' || !gaId.startsWith('G-')) {
    // No valid GA ID configured by Admin
    return;
  }

  if (initializedGaId === gaId) {
    return; // Already initialized with this ID
  }

  // Prevent multiple script tags
  const existingScript = document.getElementById('ga-gtag-script');
  if (existingScript) {
    existingScript.remove();
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', gaId, {
    send_page_view: false, // Handled manually on SPA route transitions
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  initializedGaId = gaId;
}

/**
 * Track SPA Page View safely
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag || !initializedGaId) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Generic Safe Event Dispatcher with PII Sanitization
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (!window.gtag || !initializedGaId) return;

  // Enforce zero PII
  const FORBIDDEN_KEYS = ['email', 'phone', 'fullname', 'name', 'password', 'bank', 'transfercontent', 'reservationcode'];
  const safeParams: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_KEYS.some((f) => key.toLowerCase().includes(f))) {
      continue; // Skip any PII field
    }
    safeParams[key] = value;
  }

  window.gtag('event', eventName, safeParams);
}

// -------------------------------------------------------------
// Core Business Event Trackers (Strictly Non-PII)
// -------------------------------------------------------------

export function trackPropertyView(data: {
  propertyId: string;
  propertyType?: string;
  listingType?: string;
  province?: string;
  price?: number;
}): void {
  trackEvent('view_property', {
    property_id: data.propertyId,
    property_type: data.propertyType || 'unknown',
    listing_type: data.listingType || 'sale',
    province: data.province || 'unknown',
    value: data.price && data.price > 0 ? data.price : undefined,
    currency: 'VND',
  });
}

export function trackPropertySearch(filters: {
  keyword?: string;
  propertyType?: string;
  listingType?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
}): void {
  trackEvent('search_property', {
    search_term: filters.keyword ? filters.keyword.slice(0, 50) : undefined,
    property_type: filters.propertyType || 'all',
    listing_type: filters.listingType || 'all',
    province: filters.province || 'all',
  });
}

export function trackInquirySubmit(data: {
  propertyId?: string | null;
  source?: string;
}): void {
  trackEvent('submit_inquiry', {
    property_id: data.propertyId || 'general_consultation',
    inquiry_source: data.source || 'property_detail',
  });
}

export function trackReservationCreated(data: {
  propertyId: string;
  depositAmount?: number;
}): void {
  trackEvent('create_reservation', {
    property_id: data.propertyId,
    deposit_amount_bucket: data.depositAmount
      ? data.depositAmount >= 500_000_000
        ? '500M+'
        : data.depositAmount >= 200_000_000
        ? '200M-500M'
        : '100M-200M'
      : 'standard',
  });
}

export function trackReservationPaid(data: {
  propertyId: string;
}): void {
  trackEvent('reservation_paid', {
    property_id: data.propertyId,
  });
}

export function trackPhoneClick(location: string): void {
  trackEvent('click_phone', {
    click_location: location,
  });
}

export function trackFavoriteToggle(data: {
  propertyId: string;
  isFavorite: boolean;
}): void {
  trackEvent('favorite_property', {
    property_id: data.propertyId,
    action: data.isFavorite ? 'add' : 'remove',
  });
}
