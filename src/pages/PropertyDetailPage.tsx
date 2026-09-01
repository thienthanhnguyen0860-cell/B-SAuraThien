import React, { useState, useEffect } from 'react';
import {
  Bed,
  Bath,
  Maximize2,
  FileCheck,
  ShieldCheck,
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Lock,
  Building,
} from 'lucide-react';
import { Property, Agent } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { PropertyGallery } from '../components/property/PropertyGallery';
import { InquiryForm } from '../components/property/InquiryForm';
import { ReservationModal } from '../components/property/ReservationModal';
import { PropertyCard } from '../components/property/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { incrementPropertyViews } from '../services/propertyService';
import { EmptyState } from '../components/common/EmptyState';
import { SEOHead } from '../components/common/SEOHead';
import { trackPropertyView, trackPhoneClick, trackFavoriteToggle } from '../lib/analytics';

interface PropertyDetailPageProps {
  property: Property;
  allProperties: Property[];
  agent?: Agent | null;
  onNavigate: (path: string) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  allProperties,
  agent,
  onNavigate,
}) => {
  const { currentUser, toggleFavorite, isFavorite, openAuthModal } = useAuth();
  const { siteSettings } = useSite();
  const { success, error } = useToast();

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const favorited = isFavorite(property?.id || '');

  useEffect(() => {
    if (property?.id) {
      incrementPropertyViews(property.id);
      trackPropertyView({
        propertyId: property.id,
        propertyType: property.propertyType,
        listingType: property.listingType,
        province: property.location?.province,
        price: property.price,
      });
    }
  }, [property?.id, property?.propertyType, property?.listingType, property?.location?.province, property?.price]);

  if (!property) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#050505] p-4">
        <SEOHead title="Không Tìm Thấy Bất Động Sản | AURA LUXURY" noIndex />
        <EmptyState
          title="Không tìm thấy thông tin bất động sản"
          description="Bất động sản này có thể đã được gỡ xuống hoặc chuyển nhượng thành công."
          actionText="Về danh mục bất động sản"
          onAction={() => onNavigate('/properties')}
        />
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Chiêm ngưỡng ${property.title} tại AURA Luxury`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Đã sao chép liên kết bất động sản vào clipboard.');
    }
  };

  const handleStartReservation = () => {
    if (!currentUser) {
      error('Vui lòng đăng nhập để tiếp tục giữ chỗ.');
      openAuthModal('login');
      return;
    }

    if (property.status !== 'available') {
      error('Bất động sản này hiện không còn khả dụng để giữ chỗ.');
      return;
    }

    setIsReservationModalOpen(true);
  };

  const formatPriceText = () => {
    if (!property.price || property.price <= 0) {
      return 'Giá thương lượng';
    }
    return formatCurrency(property.price, property.priceUnit);
  };

  // Related properties in same area or type
  const relatedProperties = allProperties
    .filter((p) => p.id !== property.id && (p.propertyType === property.propertyType || p.location?.province === property.location?.province))
    .slice(0, 3);

  const displayAgent = agent || {
    id: 'agent-default',
    name: 'Nguyễn Thành Nam',
    title: 'Giám Đốc Khối Khách Hàng VIP',
    phone: siteSettings.hotline || '0988 888 888',
    email: siteSettings.email || 'concierge@aura-luxury.vn',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    specialties: ['Biệt thự Thảo Điền', 'Penthouse Thủ Thiêm', 'Dinh thự ven sông'],
  };

  return (
    <div className="min-h-screen bg-[#050505] py-6 sm:py-10 pb-28 md:pb-12">
      <SEOHead
        property={property}
        breadcrumbs={[
          { name: 'Trang chủ', path: '/' },
          { name: 'Bất động sản', path: '/properties' },
          { name: property.title, path: `/property/${property.slug || property.id}` },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('/properties')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] hover:text-[#F2D675] transition-colors cursor-pointer w-fit min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh mục BĐS</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`min-h-[40px] px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                favorited
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : 'bg-[#111111] border-white/10 text-[#B8B3A7] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-[#EF4444]' : ''}`} />
              <span>{favorited ? 'Đã Lưu Yêu Thích' : 'Lưu Tin'}</span>
            </button>

            <button
              onClick={handleShare}
              className="min-h-[40px] px-4 py-2 rounded-full bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia Sẻ</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#D4AF37] bg-[#161616] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
              {property.propertyCode || 'LUX-VIP'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-gradient text-black">
              {property.listingType === 'rent' ? 'Cho Thuê' : 'Bán Độc Quyền'}
            </span>
            {property.isHot && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EF4444] text-white">
                HOT
              </span>
            )}
            {property.isNew && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#22C55E] text-white">
                MỚI
              </span>
            )}
            {property.status === 'reserved' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#F59E0B] text-black">
                ĐÃ GIỮ CHỖ
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F8F5EE] leading-tight">
            {property.title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#B8B3A7]">
            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>{property.address}</span>
          </div>
        </div>

        {/* Media Gallery */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Main Content & Sticky Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
          {/* Left Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Specs Highlight Box */}
            <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-[24px] p-5 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 shadow-xl">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">
                  Giá Niêm Yết
                </span>
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#F2D675] tracking-tight">
                  {formatPriceText()}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">
                  Diện Tích
                </span>
                <div className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F8F5EE]">
                    {property.area ? `${formatNumber(property.area)} m²` : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">
                  Phòng Ngủ
                </span>
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F8F5EE]">
                    {property.bedrooms != null ? `${property.bedrooms} Phòng` : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">
                  Phòng Tắm / WC
                </span>
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F8F5EE]">
                    {property.bathrooms != null ? `${property.bathrooms} WC` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Specs Grid */}
            <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-5 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-[#F8F5EE] border-b border-white/10 pb-3">
                Thông Số Kỹ Thuật & Pháp Lý
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Mã BĐS:</span>
                  <span className="font-mono font-bold text-[#D4AF37]">{property.propertyCode || '—'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Loại hình:</span>
                  <span className="font-semibold text-[#F8F5EE] capitalize">{property.propertyType || '—'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Số tầng:</span>
                  <span className="font-semibold text-[#F8F5EE]">{property.floors ? `${property.floors} Tầng` : 'Theo thiết kế'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Hướng chính:</span>
                  <span className="font-semibold text-[#F8F5EE]">{property.direction || 'Đông Nam'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Tình trạng nội thất:</span>
                  <span className="font-semibold text-[#F8F5EE]">{property.furnishing || 'Cao cấp nhập khẩu'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#77736B]">Tình trạng pháp lý:</span>
                  <span className="font-semibold text-[#22C55E] flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{property.legal || 'Sổ hồng lâu dài'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-5 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-[#F8F5EE] border-b border-white/10 pb-3">
                Mô Tả Không Gian Sống & Kiến Trúc
              </h3>
              <div className="text-xs sm:text-sm text-[#B8B3A7] leading-relaxed whitespace-pre-line space-y-3 font-light">
                {property.description}
              </div>
            </div>

            {/* Amenities Grid */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-5 sm:p-8 space-y-4 shadow-xl">
                <h3 className="font-serif text-lg font-bold text-[#F8F5EE] border-b border-white/10 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Tiện Ích Đặc Quyền Dành Cho Chủ Nhân</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#161616] border border-[#D4AF37]/15 flex items-center gap-2 text-xs text-[#F8F5EE]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                      <span className="font-medium truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Quick Action: Online Reservation Card */}
            <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-[24px] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#77736B] tracking-wider block">
                    Khóa quyền ưu tiên
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#F8F5EE]">
                    Giữ Chỗ Trực Tuyến
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-[#B8B3A7] leading-relaxed">
                Khóa giữ vị trí bất động sản này trong 24 giờ. Thủ tục bảo mật và đối soát hoàn cọc theo quy chế AURA.
              </p>

              <button
                id="btn-reserve-property"
                onClick={handleStartReservation}
                disabled={property.status !== 'available'}
                className="w-full min-h-[48px] py-3.5 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {property.status === 'available'
                    ? 'Yêu Cầu Giữ Chỗ Ngay'
                    : 'BĐS Này Đã Được Giữ Chỗ'}
                </span>
              </button>
            </div>

            {/* Inquiry Form */}
            <InquiryForm property={property} />

            {/* Assigned VIP Agent Concierge Card */}
            <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 space-y-4 shadow-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#77736B] block">
                CHUYÊN VIÊN PHỤ TRÁCH DANH MỤC
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={displayAgent.avatar}
                  alt={displayAgent.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#D4AF37]/30"
                />
                <div>
                  <h5 className="font-serif text-sm font-bold text-[#F8F5EE]">
                    {displayAgent.name}
                  </h5>
                  <p className="text-[11px] text-[#D4AF37]">{displayAgent.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${displayAgent.phone}`}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#161616] border border-[#D4AF37]/30 text-xs font-bold text-[#F2D675] flex items-center justify-center gap-1.5 hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi Điện</span>
                </a>
                <a
                  href={`https://zalo.me/${displayAgent.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-gold-gradient text-xs font-bold text-black flex items-center justify-center gap-1.5 hover:shadow-md transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat Zalo</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="pt-12 border-t border-[#D4AF37]/15 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                  GỢI Ý TƯƠNG ĐỒNG
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EE] mt-1">
                  Bất Động Sản Cùng Phân Khúc
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/properties')}
                className="text-xs font-semibold text-[#F2D675] hover:underline cursor-pointer"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedProperties.map((p) => (
                <PropertyCard key={p.id} property={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar with Safe Area */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#D4AF37]/25 p-3.5 px-4 pb-safe shadow-2xl">
        <div className="flex items-center gap-3">
          <a
            href={`tel:${displayAgent.phone}`}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#161616] border border-[#D4AF37]/35 text-[#F2D675] text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Gọi Tư Vấn</span>
          </a>

          <button
            onClick={handleStartReservation}
            disabled={property.status !== 'available'}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gold-gradient text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-40"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{property.status === 'available' ? 'Giữ Chỗ Ngay' : 'Đã Giữ Chỗ'}</span>
          </button>
        </div>
      </div>

      {/* Reservation Modal */}
      {isReservationModalOpen && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          property={property}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
