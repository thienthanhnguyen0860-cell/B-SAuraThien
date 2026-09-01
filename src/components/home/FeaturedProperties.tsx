import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Property } from '../../types';
import { PropertyCard } from '../property/PropertyCard';
import { PropertyCardSkeleton } from '../common/Skeleton';

interface FeaturedPropertiesProps {
  properties: Property[];
  loading?: boolean;
  onNavigate: (path: string) => void;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  loading = false,
  onNavigate,
}) => {
  const featuredList = properties.slice(0, 6);

  return (
    <section className="py-20 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D4AF37]/15 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>BỘ SƯU TẬP ĐỘC BẢN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#F8F5EE] tracking-tight">
              Bất Động Sản Nổi Bật
            </h2>
            <p className="text-sm text-[#B8B3A7] max-w-xl">
              Tuyển tập những siêu dinh thự ven sông, Penthouse biểu tượng và tài sản truyền đời dành cho giới tinh hoa.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/properties')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[#F2D675] hover:text-[#D4AF37] transition-colors self-start md:self-auto cursor-pointer group"
          >
            <span>Xem Tất Cả Bất Động Sản</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredList.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA button */}
        <div className="text-center pt-6">
          <button
            onClick={() => onNavigate('/properties')}
            className="px-8 py-3.5 rounded-full bg-[#111111] border border-[#D4AF37]/30 text-[#F2D675] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-gold-gradient hover:text-black transition-all shadow-xl cursor-pointer"
          >
            Khám Phá Toàn Bộ {properties.length}+ Bất Động Sản Triệu Đô →
          </button>
        </div>
      </div>
    </section>
  );
};
