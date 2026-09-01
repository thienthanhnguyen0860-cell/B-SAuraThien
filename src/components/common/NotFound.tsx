import React from 'react';
import { Home, Compass } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface NotFoundProps {
  title?: string;
  message?: string;
  onNavigate: (path: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = 'Không Tìm Thấy Trang Yêu Cầu',
  message = 'Địa chỉ bạn đang truy cập có thể đã được chuyển đổi vị trí, xóa bỏ hoặc tạm thời không khả dụng trong bộ sưu tập niêm yết của AURA Luxury.',
  onNavigate,
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#050505] px-4 py-16">
      <SEOHead title="404 - Không Tìm Thấy Trang | AURA LUXURY" noIndex />
      <div className="max-w-lg w-full text-center space-y-6 bg-[#111111] p-8 sm:p-12 rounded-[28px] border border-[#D4AF37]/25 shadow-2xl">
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-serif font-bold text-gold-gradient block">
            404
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block">
            TRANG KHÔNG TỒN TẠI
          </span>
        </div>

        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EE]">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-[#B8B3A7] leading-relaxed">
          {message}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </button>

          <button
            onClick={() => onNavigate('/properties')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 cursor-pointer min-h-[44px]"
          >
            <Compass className="w-4 h-4" />
            <span>Khám Phá Bất Động Sản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
