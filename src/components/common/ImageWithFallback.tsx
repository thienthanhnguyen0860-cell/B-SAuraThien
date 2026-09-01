import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  aspectRatio?: '4/3' | '16/9' | '1/1' | 'auto';
  className?: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  aspectRatio = '4/3',
  className = '',
  fallbackText = 'Hình ảnh đang được cập nhật',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
    'auto': '',
  }[aspectRatio];

  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectClass} bg-[#161616] border border-white/5 flex flex-col items-center justify-center text-center p-4 select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#26231c] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-2 shadow-inner">
          <Building2 className="w-5 h-5 opacity-80" />
        </div>
        <span className="text-[11px] font-medium text-[#77736B] tracking-wide max-w-[200px] leading-tight">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#161616] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#1f1d18] animate-pulse z-0" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
