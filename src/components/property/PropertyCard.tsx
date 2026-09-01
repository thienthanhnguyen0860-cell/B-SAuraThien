import React from 'react';
import { Heart, Bed, Bath, Maximize2, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface PropertyCardProps {
  property: Property;
  onNavigate: (path: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onNavigate }) => {
  const { toggleFavorite, isFavorite } = useAuth();
  const favorited = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const handleCardClick = () => {
    onNavigate(`/property/${property.slug || property.id}`);
  };

  const imageSrc = property.thumbnail || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85';

  const formatPriceText = () => {
    if (!property.price || property.price <= 0) {
      return 'Giá thương lượng';
    }
    return formatCurrency(property.price, property.priceUnit);
  };

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="group cursor-pointer luxury-card overflow-hidden flex flex-col h-full bg-[#111111]"
    >
      {/* Image Thumbnail Container (Strict 4:3 Aspect Ratio) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#161616]">
        <ImageWithFallback
          src={imageSrc}
          alt={property.title}
          aspectRatio="4/3"
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Dark subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Listing Type Tag */}
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#050505]/85 text-[#F2D675] border border-[#D4AF37]/30 backdrop-blur-md">
              {property.listingType === 'rent' ? 'Cho Thuê' : 'Bán Độc Quyền'}
            </span>

            {/* Hot / New Tag */}
            {property.isHot && (
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#EF4444]/90 text-white shadow-md">
                HOT
              </span>
            )}
            {property.isNew && (
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#22C55E]/90 text-white shadow-md">
                MỚI
              </span>
            )}
            {property.status === 'reserved' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#F59E0B]/90 text-black shadow-md">
                ĐÃ GIỮ CHỖ
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Lưu bất động sản yêu thích"
            className="pointer-events-auto min-w-[36px] min-h-[36px] w-9 h-9 rounded-full bg-[#050505]/80 backdrop-blur-md border border-[#D4AF37]/20 flex items-center justify-center text-[#B8B3A7] hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-all shadow-md cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorited ? 'fill-[#EF4444] text-[#EF4444]' : ''
              }`}
            />
          </button>
        </div>

        {/* Property Code Pill */}
        <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
          <span className="text-[10px] font-mono tracking-wider text-[#B8B3A7] bg-black/75 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
            {property.propertyCode || 'LUX-VIP'}
          </span>
        </div>
      </div>

      {/* Details Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-[#B8B3A7]">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">
              {property.location?.district ? `${property.location.district}, ` : ''}{property.location?.province || property.address || 'Hồ Chí Minh'}
            </span>
          </div>

          {/* Title with uniform 2-line height */}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#F8F5EE] line-clamp-2 leading-snug min-h-[2.75rem] group-hover:text-[#F2D675] transition-colors">
            {property.title}
          </h3>
        </div>

        {/* Specs Grid (Bedrooms, Bathrooms, Area) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#D4AF37]/10 text-xs text-[#B8B3A7]">
          <div className="flex items-center gap-1.5 truncate">
            <Bed className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{property.bedrooms != null ? `${property.bedrooms} PN` : '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Bath className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{property.bathrooms != null ? `${property.bathrooms} WC` : '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{property.area ? `${formatNumber(property.area)} m²` : '—'}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#77736B] block">
              Mức giá niêm yết
            </span>
            <span className="font-serif text-base sm:text-xl font-bold text-[#F2D675] tracking-tight">
              {formatPriceText()}
            </span>
          </div>

          <span className="text-xs font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Chi tiết →
          </span>
        </div>
      </div>
    </div>
  );
};
