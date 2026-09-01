import React, { useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { Property, Project } from '../../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string | null;
  canonicalPath?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  property?: Property | null;
  project?: Project | null;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  ogImage,
  canonicalPath,
  type = 'website',
  noIndex = false,
  property,
  project,
  breadcrumbs,
}) => {
  const { siteSettings } = useSite();

  const appBaseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : ((import.meta as any).env?.VITE_APP_URL || 'https://ais-dev-zyopguxwspgeb2grt6vofe-238415144583.asia-southeast1.run.app');

  // Fallback hierarchies
  const siteName = siteSettings?.siteName || 'AURA LUXURY';
  const defaultTitle = siteSettings?.seo?.defaultTitle || `${siteName} | Bất Động Sản Đẳng Cấp & Thượng Lưu`;
  const defaultDescription = siteSettings?.seo?.defaultDescription || 'Khám phá bộ sưu tập bất động sản thượng lưu, biệt thự, penthouse đắt giá hàng đầu.';
  const defaultOgImage = siteSettings?.seo?.defaultOgImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85';

  // Compute final title
  let finalTitle = title;
  if (!finalTitle) {
    if (property) {
      finalTitle = property.seo?.title || `${property.title} | ${siteName}`;
    } else if (project) {
      finalTitle = project.seo?.title || `${project.name} | ${siteName}`;
    } else {
      finalTitle = defaultTitle;
    }
  }

  // Compute final description (truncate cleanly to ~155 chars)
  let rawDesc = description;
  if (!rawDesc) {
    if (property) {
      rawDesc = property.seo?.description || property.shortDescription || property.description;
    } else if (project) {
      rawDesc = project.seo?.description || project.description;
    } else {
      rawDesc = defaultDescription;
    }
  }
  const cleanDesc = (rawDesc || defaultDescription).replace(/\s+/g, ' ').trim();
  const finalDescription = cleanDesc.length > 160 ? cleanDesc.substring(0, 157) + '...' : cleanDesc;

  // Compute final absolute OG Image
  let rawOgImage = ogImage;
  if (!rawOgImage) {
    if (property) {
      rawOgImage = property.seo?.ogImage || property.thumbnail || (property.images && property.images[0]) || defaultOgImage;
    } else if (project) {
      rawOgImage = project.seo?.ogImage || project.thumbnail || defaultOgImage;
    } else {
      rawOgImage = defaultOgImage;
    }
  }
  let finalOgImage = rawOgImage || defaultOgImage;
  if (finalOgImage.startsWith('/')) {
    finalOgImage = `${appBaseUrl}${finalOgImage}`;
  }

  // Compute canonical URL (strip tracking and extra query params)
  const currentPath = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const finalCanonical = `${appBaseUrl}${currentPath === '' ? '/' : currentPath}`;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Title
    document.title = finalTitle;

    // Helper: set or create meta tag
    const setMeta = (nameAttr: 'name' | 'property', nameVal: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${nameVal}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('name', 'description', finalDescription);

    // 3. Robots
    if (noIndex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // 4. OpenGraph
    setMeta('property', 'og:title', finalTitle);
    setMeta('property', 'og:description', finalDescription);
    setMeta('property', 'og:image', finalOgImage);
    setMeta('property', 'og:url', finalCanonical);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:locale', 'vi_VN');

    // 5. Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', finalTitle);
    setMeta('name', 'twitter:description', finalDescription);
    setMeta('name', 'twitter:image', finalOgImage);

    // 6. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonical);

    // 7. Structured Data (JSON-LD)
    const jsonLdId = 'aura-structured-data';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredDataArray: any[] = [];

    // Organization / Real Estate Agent Schema
    const orgSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: siteName,
      url: appBaseUrl,
      logo: siteSettings?.logoUrl || `${appBaseUrl}/favicon.ico`,
      telephone: siteSettings?.hotline || '0988888888',
      email: siteSettings?.email || 'concierge@aura-luxury.vn',
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteSettings?.address || 'Quận 1, TP. Hồ Chí Minh',
        addressLocality: 'Hồ Chí Minh',
        addressCountry: 'VN',
      },
    };

    const sameAs = [
      siteSettings?.facebookUrl,
      siteSettings?.youtubeUrl,
      siteSettings?.zaloUrl,
    ].filter(Boolean);
    if (sameAs.length > 0) {
      orgSchema.sameAs = sameAs;
    }
    structuredDataArray.push(orgSchema);

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${appBaseUrl}${b.path}`,
        })),
      });
    }

    // Property Detail Real Estate Schema
    if (property) {
      const propertySchema: any = {
        '@context': 'https://schema.org',
        '@type': ['RealEstateListing', 'SingleFamilyResidence'],
        name: property.title,
        description: finalDescription,
        url: `${appBaseUrl}/property/${property.slug || property.id}`,
        image: property.images && property.images.length > 0 ? property.images : [finalOgImage],
        address: {
          '@type': 'PostalAddress',
          streetAddress: property.address || '',
          addressLocality: property.location?.district || '',
          addressRegion: property.location?.province || 'Hồ Chí Minh',
          addressCountry: 'VN',
        },
      };

      if (property.bedrooms != null && property.bedrooms > 0) {
        propertySchema.numberOfBedrooms = property.bedrooms;
      }
      if (property.bathrooms != null && property.bathrooms > 0) {
        propertySchema.numberOfBathroomsTotal = property.bathrooms;
      }
      if (property.area != null && property.area > 0) {
        propertySchema.floorSize = {
          '@type': 'QuantitativeValue',
          value: property.area,
          unitCode: 'MTK',
        };
      }

      // Valid price Offer
      if (property.price && property.price > 0 && property.priceUnit !== 'negotiable') {
        propertySchema.offers = {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: 'VND',
          availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          businessFunction: property.listingType === 'rent' ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell',
        };
      }

      structuredDataArray.push(propertySchema);
    }

    scriptTag.text = JSON.stringify(structuredDataArray);
  }, [
    finalTitle,
    finalDescription,
    finalOgImage,
    finalCanonical,
    type,
    noIndex,
    property,
    project,
    breadcrumbs,
    siteSettings,
  ]);

  return null;
};
