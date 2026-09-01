import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RotateCcw, X, Check, Filter } from 'lucide-react';
import { PropertyFilterParams } from '../../types';
import { PROPERTY_TYPES, PROVINCES } from '../../lib/utils';

interface PropertyFilterProps {
  filters: PropertyFilterParams;
  onFilterChange: (newFilters: PropertyFilterParams) => void;
  onReset: () => void;
  totalResults?: number;
}

export const PropertyFilter: React.FC<PropertyFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState(filters.keyword || '');

  // Keep local keyword in sync with external filters
  useEffect(() => {
    setKeywordInput(filters.keyword || '');
  }, [filters.keyword]);

  // Debounce keyword update by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.keyword || '') !== keywordInput) {
        onFilterChange({
          ...filters,
          keyword: keywordInput,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keywordInput]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  const handleFieldChange = (key: keyof PropertyFilterParams, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const selectedProvince = PROVINCES.find((p) => p.name === filters.province);

  const priceRanges = [
    { label: 'Dưới 30 Tỷ', min: 0, max: 30000000000 },
    { label: '30 - 70 Tỷ', min: 30000000000, max: 70000000000 },
    { label: '70 - 150 Tỷ', min: 70000000000, max: 150000000000 },
    { label: 'Trên 150 Tỷ', min: 150000000000, max: undefined },
  ];

  const handlePricePreset = (min?: number, max?: number) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  // Build active chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (filters.keyword) {
    activeChips.push({
      id: 'keyword',
      label: `Từ khóa: "${filters.keyword}"`,
      onRemove: () => handleFieldChange('keyword', ''),
    });
  }

  if (filters.listingType && filters.listingType !== 'all') {
    activeChips.push({
      id: 'listingType',
      label: filters.listingType === 'sale' ? 'Giao dịch: Bán' : 'Giao dịch: Cho Thuê',
      onRemove: () => handleFieldChange('listingType', 'all'),
    });
  }

  if (filters.propertyType && filters.propertyType !== 'all') {
    const pt = PROPERTY_TYPES.find((t) => t.value === filters.propertyType);
    activeChips.push({
      id: 'propertyType',
      label: `Loại: ${pt?.label || filters.propertyType}`,
      onRemove: () => handleFieldChange('propertyType', 'all'),
    });
  }

  if (filters.province && filters.province !== 'all') {
    activeChips.push({
      id: 'province',
      label: `Tỉnh: ${filters.province}`,
      onRemove: () => {
        handleFieldChange('province', 'all');
        handleFieldChange('district', 'all');
      },
    });
  }

  if (filters.district && filters.district !== 'all') {
    activeChips.push({
      id: 'district',
      label: `Quận: ${filters.district}`,
      onRemove: () => handleFieldChange('district', 'all'),
    });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    let priceLabel = 'Khoảng giá';
    if (filters.minPrice === 0 && filters.maxPrice === 30000000000) priceLabel = '< 30 Tỷ';
    else if (filters.minPrice === 30000000000 && filters.maxPrice === 70000000000) priceLabel = '30 - 70 Tỷ';
    else if (filters.minPrice === 70000000000 && filters.maxPrice === 150000000000) priceLabel = '70 - 150 Tỷ';
    else if (filters.minPrice === 150000000000) priceLabel = '> 150 Tỷ';
    else priceLabel = 'Giá tùy chỉnh';

    activeChips.push({
      id: 'price',
      label: `Giá: ${priceLabel}`,
      onRemove: () => handlePricePreset(undefined, undefined),
    });
  }

  if (filters.bedrooms && filters.bedrooms !== 'all') {
    activeChips.push({
      id: 'bedrooms',
      label: `${filters.bedrooms}+ Phòng ngủ`,
      onRemove: () => handleFieldChange('bedrooms', 'all'),
    });
  }

  const activeFilterCount = activeChips.length;

  return (
    <div className="space-y-4">
      {/* Top Search & Fast Listing Type Switcher Bar */}
      <div className="bg-[#111111] p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#77736B]" />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Tìm theo tên dự án, đường, mã BĐS, khu vực..."
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          {/* Listing Type Tabs */}
          <div className="flex items-center bg-[#161616] p-1 rounded-xl border border-[#D4AF37]/15 shrink-0">
            <button
              onClick={() => handleFieldChange('listingType', 'all')}
              className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                !filters.listingType || filters.listingType === 'all'
                  ? 'bg-gold-gradient text-[#050505] shadow-md font-bold'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => handleFieldChange('listingType', 'sale')}
              className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filters.listingType === 'sale'
                  ? 'bg-gold-gradient text-[#050505] shadow-md font-bold'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              Mua Bán
            </button>
            <button
              onClick={() => handleFieldChange('listingType', 'rent')}
              className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filters.listingType === 'rent'
                  ? 'bg-gold-gradient text-[#050505] shadow-md font-bold'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              Cho Thuê
            </button>
          </div>

          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#161616] border border-[#D4AF37]/30 text-[#F2D675] text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ Lọc ({activeFilterCount})</span>
          </button>
        </div>

        {/* Quick Filter Row (Desktop) */}
        <div className="hidden lg:grid grid-cols-4 gap-3 pt-2">
          {/* Property Type */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#77736B] mb-1">
              Loại hình
            </label>
            <select
              value={filters.propertyType || 'all'}
              onChange={(e) => handleFieldChange('propertyType', e.target.value)}
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="all">Tất cả loại BĐS</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#77736B] mb-1">
              Tỉnh / Thành phố
            </label>
            <select
              value={filters.province || 'all'}
              onChange={(e) => {
                handleFieldChange('province', e.target.value);
                handleFieldChange('district', 'all');
              }}
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="all">Tất cả tỉnh thành</option>
              {PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#77736B] mb-1">
              Quận / Huyện
            </label>
            <select
              disabled={!selectedProvince}
              value={filters.district || 'all'}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37] disabled:opacity-40 cursor-pointer"
            >
              <option value="all">Tất cả quận huyện</option>
              {selectedProvince?.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#77736B] mb-1">
              Phòng ngủ tối thiểu
            </label>
            <select
              value={filters.bedrooms || 'all'}
              onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="all">Bất kỳ</option>
              <option value="2">Từ 2 phòng ngủ</option>
              <option value="3">Từ 3 phòng ngủ</option>
              <option value="4">Từ 4 phòng ngủ</option>
              <option value="5">Từ 5 phòng ngủ trở lên</option>
            </select>
          </div>
        </div>

        {/* Price preset pills (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[11px] text-[#77736B] font-semibold">Khoảng giá nhanh:</span>
          {priceRanges.map((p, idx) => {
            const isSelected = filters.minPrice === p.min && filters.maxPrice === p.max;
            return (
              <button
                key={idx}
                onClick={() => handlePricePreset(isSelected ? undefined : p.min, isSelected ? undefined : p.max)}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-gold-gradient text-black font-bold border-[#D4AF37]'
                    : 'bg-[#161616] text-[#B8B3A7] border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-1">
          <span className="text-xs text-[#77736B] font-semibold">Đang lọc:</span>
          {activeChips.map((chip) => (
            <div
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1711] border border-[#D4AF37]/35 text-[#F2D675] text-xs font-medium"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                aria-label={`Xóa lọc ${chip.label}`}
                className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-[#B8B3A7] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            onClick={onReset}
            className="text-xs text-[#D4AF37] hover:underline font-semibold ml-2 inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa tất cả</span>
          </button>
        </div>
      )}

      {/* Results Count & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1">
        <div className="text-xs text-[#B8B3A7]">
          {totalResults !== undefined && (
            <span>
              Tìm thấy <strong className="text-[#F2D675] font-semibold">{totalResults}</strong> bất động sản phù hợp
            </span>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#77736B] uppercase font-semibold">Sắp xếp:</span>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleFieldChange('sort', e.target.value)}
            className="bg-[#111111] border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="area_desc">Diện tích: Lớn nhất</option>
            <option value="most_viewed">Lượt xem nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Drawer (Slide in from Right: min(88vw, 360px)) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm lg:hidden">
          <div className="w-[min(88vw,360px)] bg-[#111111] h-full p-6 overflow-y-auto border-l border-[#D4AF37]/30 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-[#F8F5EE]">Bộ Lọc Nâng Cao</h3>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Đóng bộ lọc"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-[#161616] flex items-center justify-center text-[#B8B3A7] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Fields */}
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">Loại hình BĐS</label>
                <select
                  value={filters.propertyType || 'all'}
                  onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                  className="w-full min-h-[44px] bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE]"
                >
                  <option value="all">Tất cả loại BĐS</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">Tỉnh / Thành phố</label>
                <select
                  value={filters.province || 'all'}
                  onChange={(e) => {
                    handleFieldChange('province', e.target.value);
                    handleFieldChange('district', 'all');
                  }}
                  className="w-full min-h-[44px] bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE]"
                >
                  <option value="all">Tất cả tỉnh thành</option>
                  {PROVINCES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">Quận / Huyện</label>
                <select
                  disabled={!selectedProvince}
                  value={filters.district || 'all'}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  className="w-full min-h-[44px] bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] disabled:opacity-40"
                >
                  <option value="all">Tất cả quận huyện</option>
                  {selectedProvince?.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">Phòng ngủ</label>
                <select
                  value={filters.bedrooms || 'all'}
                  onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
                  className="w-full min-h-[44px] bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE]"
                >
                  <option value="all">Bất kỳ</option>
                  <option value="2">Từ 2 phòng ngủ</option>
                  <option value="3">Từ 3 phòng ngủ</option>
                  <option value="4">Từ 4 phòng ngủ</option>
                  <option value="5">Từ 5 phòng ngủ trở lên</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">Khoảng giá</label>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((p, idx) => {
                    const isSelected = filters.minPrice === p.min && filters.maxPrice === p.max;
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePricePreset(isSelected ? undefined : p.min, isSelected ? undefined : p.max)}
                        className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-gold-gradient text-black border-[#D4AF37] font-bold'
                            : 'bg-[#161616] text-[#B8B3A7] border-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions with Safe Area */}
            <div className="pt-6 border-t border-white/10 flex gap-3 pb-safe">
              <button
                onClick={() => {
                  onReset();
                  setMobileDrawerOpen(false);
                }}
                className="flex-1 min-h-[48px] rounded-xl bg-[#161616] border border-white/10 text-xs font-semibold text-[#B8B3A7]"
              >
                Xóa Bộ Lọc
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 min-h-[48px] rounded-xl bg-gold-gradient text-xs font-bold text-black uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20"
              >
                Xem Kết Quả ({totalResults ?? 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
