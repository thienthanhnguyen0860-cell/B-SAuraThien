import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Property, PropertyFilterParams } from '../types';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyFilter } from '../components/property/PropertyFilter';
import { EmptyState } from '../components/common/EmptyState';
import { PropertyCardSkeleton } from '../components/common/Skeleton';
import { filterPropertiesLocally } from '../services/propertyService';
import { SEOHead } from '../components/common/SEOHead';
import { trackPropertySearch } from '../lib/analytics';

const ITEMS_PER_PAGE = 12;

interface PropertiesPageProps {
  properties: Property[];
  initialFilters?: PropertyFilterParams;
  onNavigate: (path: string) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  properties,
  initialFilters = {},
  onNavigate,
}) => {
  const [filters, setFilters] = useState<PropertyFilterParams>(initialFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Sync initialFilters if they change externally
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      setCurrentPage(1);
    }
  }, [initialFilters]);

  const filteredList = useMemo(() => {
    return filterPropertiesLocally(properties, filters);
  }, [properties, filters]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;

  // Paginated slice
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const handleFilterChange = (newF: PropertyFilterParams) => {
    setIsTransitioning(true);
    setFilters(newF);
    setCurrentPage(1);
    trackPropertySearch({
      keyword: newF.keyword,
      propertyType: newF.propertyType,
      listingType: newF.listingType,
      province: newF.province,
      minPrice: newF.minPrice,
      maxPrice: newF.maxPrice,
    });
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handleResetFilters = () => {
    setIsTransitioning(true);
    setFilters({
      listingType: 'all',
      propertyType: 'all',
      province: 'all',
      district: 'all',
      bedrooms: 'all',
      sort: 'newest',
    });
    setCurrentPage(1);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setIsTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => {
      setIsTransitioning(false);
      listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#050505] py-8 sm:py-12">
      <SEOHead
        title="Danh Mục Bất Động Sản Thượng Hạng | AURA LUXURY"
        description="Khám phá danh mục siêu dinh thự, Penthouse triệu đô và các kiệt tác kiến trúc được bảo chứng về pháp lý và vị thế độc tôn."
        canonicalPath="/properties"
        breadcrumbs={[
          { name: 'Trang chủ', path: '/' },
          { name: 'Bất động sản', path: '/properties' },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" ref={listTopRef}>
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            BỘ SƯU TẬP NIÊM YẾT ĐỘC QUYỀN
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F8F5EE]">
            Bất Động Sản Thượng Hạng
          </h1>
          <p className="text-xs sm:text-sm text-[#B8B3A7] leading-relaxed">
            Khám phá danh mục siêu dinh thự, Penthouse triệu đô và các kiệt tác kiến trúc được bảo chứng về pháp lý và vị thế độc tôn.
          </p>
        </div>

        {/* Filter Bar */}
        <PropertyFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={filteredList.length}
        />

        {/* Properties Grid with Loading Skeletons */}
        {isTransitioning ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState
            variant="search"
            title="Không tìm thấy bất động sản phù hợp"
            description="Hãy thử nới lỏng các tiêu chí lọc như khoảng giá, loại hình hoặc địa bàn tìm kiếm để xem thêm nhiều lựa chọn hơn."
            actionText="Xóa toàn bộ bộ lọc"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedList.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#D4AF37]/15">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-[#F8F5EE] hover:border-[#D4AF37]/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first, last, and current +/- 1
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1
                    ) {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gold-gradient text-black font-bold shadow-md shadow-[#D4AF37]/20'
                              : 'bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-[#F8F5EE]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="text-[#77736B] px-1 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang tiếp theo"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-[#F8F5EE] hover:border-[#D4AF37]/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
