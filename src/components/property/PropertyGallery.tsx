import React, { useState, useEffect } from 'react';
import { Images, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=85',
  ];

  const mainImage = displayImages[0];
  const sideImages = displayImages.slice(1, 5);

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, displayImages.length]);

  return (
    <div className="space-y-4">
      {/* Desktop Grid Layout (1 Large + 4 Small) */}
      <div className="relative hidden md:grid grid-cols-4 gap-3.5 h-[480px] lg:h-[540px] rounded-[24px] overflow-hidden border border-[#D4AF37]/20 bg-[#111111] p-1.5">
        {/* Large Main Photo */}
        <div
          onClick={() => {
            setActivePhotoIndex(0);
            setIsLightboxOpen(true);
          }}
          className="col-span-2 h-full rounded-[18px] overflow-hidden relative group cursor-pointer"
        >
          <img
            src={mainImage}
            alt={`${title} - Hình ảnh chính`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        </div>

        {/* 4 Small Side Photos */}
        <div className="col-span-2 grid grid-cols-2 gap-3.5 h-full">
          {sideImages.map((img, idx) => {
            const isLast = idx === 3 && displayImages.length > 5;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIndex(idx + 1);
                  setIsLightboxOpen(true);
                }}
                className="relative rounded-[16px] overflow-hidden group cursor-pointer bg-[#161616]"
              >
                <img
                  src={img}
                  alt={`${title} - Ảnh ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-[#F8F5EE] group-hover:bg-black/60 transition-colors">
                    <Images className="w-6 h-6 text-[#F2D675] mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      +{displayImages.length - 5} Ảnh khác
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Fill if less than 4 side images */}
          {Array.from({ length: Math.max(0, 4 - sideImages.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-[16px] bg-[#161616] flex items-center justify-center text-[#77736B] text-xs border border-white/5"
            >
              AURA Luxury
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button
          onClick={() => {
            setActivePhotoIndex(0);
            setIsLightboxOpen(true);
          }}
          className="absolute bottom-5 right-5 px-4 py-2.5 rounded-full bg-[#050505]/90 backdrop-blur-md border border-[#D4AF37]/40 text-[#F2D675] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-gold-gradient hover:text-black transition-all shadow-xl cursor-pointer"
        >
          <Images className="w-4 h-4" />
          <span>Xem tất cả ({displayImages.length} ảnh)</span>
        </button>
      </div>

      {/* Mobile Slider / Carousel (Aspect 4:3) */}
      <div className="md:hidden relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#161616] border border-[#D4AF37]/20">
        <img
          src={displayImages[activePhotoIndex]}
          alt={`${title} - Ảnh ${activePhotoIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Prev / Next buttons with 44px min touch target */}
        <button
          onClick={prevPhoto}
          aria-label="Ảnh trước"
          className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextPhoto}
          aria-label="Ảnh tiếp theo"
          className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Action button & indicator on mobile */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => {
              setIsLightboxOpen(true);
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[#F2D675] text-xs font-semibold flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Phóng to</span>
          </button>

          <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono text-[#F2D675] border border-white/10">
            {activePhotoIndex + 1} / {displayImages.length}
          </div>
        </div>
      </div>

      {/* Full Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between text-[#F8F5EE] border-b border-white/10 pb-4">
            <div className="truncate pr-4">
              <span className="text-xs font-mono text-[#D4AF37] block">BỘ SƯU TẬP ẢNH</span>
              <h4 className="font-serif text-sm sm:text-base font-bold truncate">{title}</h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#B8B3A7]">
                {activePhotoIndex + 1} / {displayImages.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Đóng thư viện ảnh"
                className="min-w-[44px] min-h-[44px] rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-[#B8B3A7] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={displayImages[activePhotoIndex]}
              alt={`${title} - Phóng to ${activePhotoIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {/* Navigation buttons */}
            <button
              onClick={prevPhoto}
              aria-label="Ảnh trước"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 min-w-[48px] min-h-[48px] rounded-full bg-black/60 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 min-w-[48px] min-h-[48px] rounded-full bg-black/60 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 justify-start sm:justify-center border-t border-white/10">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activePhotoIndex === idx
                    ? 'border-[#D4AF37] scale-105'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
