import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Building, DollarSign, ArrowRight } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { PROPERTY_TYPES, PROVINCES } from '../../lib/utils';
import { PropertyFilterParams } from '../../types';

interface HeroSectionProps {
  onSearch: (params: PropertyFilterParams) => void;
  onOpenConsultation: () => void;
  onNavigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenConsultation,
  onNavigate,
}) => {
  const { siteSettings } = useSite();

  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState('all');
  const [province, setProvince] = useState('all');
  const [priceRangeIndex, setPriceRangeIndex] = useState('all');

  const priceRanges = [
    { label: 'Tất cả mức giá', min: undefined, max: undefined },
    { label: 'Dưới 30 Tỷ', min: 0, max: 30000000000 },
    { label: '30 - 70 Tỷ', min: 30000000000, max: 70000000000 },
    { label: '70 - 150 Tỷ', min: 70000000000, max: 150000000000 },
    { label: 'Trên 150 Tỷ', min: 150000000000, max: undefined },
  ];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPrice = priceRangeIndex !== 'all' ? priceRanges[Number(priceRangeIndex)] : null;
    onSearch({
      listingType,
      propertyType: propertyType !== 'all' ? (propertyType as any) : undefined,
      province: province !== 'all' ? province : undefined,
      minPrice: selectedPrice?.min,
      maxPrice: selectedPrice?.max,
    });
  };

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center pt-16 pb-20 overflow-hidden">
      {/* Hero Background with High Luxury Imagery */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            siteSettings.hero.backgroundImage ||
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&auto=format&fit=crop&q=85'
          }
          alt="Luxury Architecture"
          className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
        />
        {/* Luxury Black Overlay 60-65% */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/65 to-[#050505]/75" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-10">
        {/* Text Container */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/80 border border-[#D4AF37]/30 backdrop-blur-md shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#F2D675] uppercase">
              {siteSettings.hero.eyebrow}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F8F5EE] leading-[1.15] uppercase"
          >
            {siteSettings.hero.heading.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i === 0 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#B8B3A7] max-w-2xl mx-auto font-light leading-relaxed"
          >
            {siteSettings.hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => onNavigate('/properties')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-gradient text-[#050505] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all cursor-pointer"
            >
              <span>{siteSettings.hero.primaryCTA}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConsultation}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#D4AF37]/30 text-[#F8F5EE] font-semibold text-sm tracking-wider uppercase hover:border-[#D4AF37] hover:bg-[#161616] transition-all cursor-pointer"
            >
              {siteSettings.hero.secondaryCTA}
            </button>
          </motion.div>
        </div>

        {/* Hero Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-4xl mx-auto bg-[#111111]/90 backdrop-blur-xl border border-[#D4AF37]/25 rounded-[24px] p-4 sm:p-6 shadow-2xl"
        >
          {/* Mua / Thuê fast tabs */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setListingType('sale')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                listingType === 'sale'
                  ? 'bg-gold-gradient text-[#050505] shadow-lg'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              Bất Động Sản Bán
            </button>
            <button
              type="button"
              onClick={() => setListingType('rent')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                listingType === 'rent'
                  ? 'bg-gold-gradient text-[#050505] shadow-lg'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              Bất Động Sản Thuê
            </button>
          </div>

          <form onSubmit={handleHeroSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {/* Loại BĐS */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#77736B] flex items-center gap-1.5">
                <Building className="w-3 h-3 text-[#D4AF37]" />
                <span>Loại Bất Động Sản</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Tất cả loại hình</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Khu vực */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#77736B] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span>Khu Vực / Tỉnh Thành</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Tất cả tỉnh thành</option>
                {PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Khoảng giá */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#77736B] flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-[#D4AF37]" />
                <span>Khoảng Giá Dự Kiến</span>
              </label>
              <select
                value={priceRangeIndex}
                onChange={(e) => setPriceRangeIndex(e.target.value)}
                className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
              >
                {priceRanges.map((r, i) => (
                  <option key={i} value={i === 0 ? 'all' : i.toString()}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                id="hero-search-btn"
                className="w-full py-2.5 sm:py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#D4AF37]/25 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Kiếm</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
