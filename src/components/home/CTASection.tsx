import React from 'react';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

interface CTASectionProps {
  onOpenConsultation: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenConsultation }) => {
  const { siteSettings } = useSite();

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background visual subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 bg-[#111111]/80 backdrop-blur-xl border border-[#D4AF37]/30 rounded-[32px] p-10 sm:p-16 shadow-2xl">
        <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
          TƯ VẤN DANH MỤC RIÊNG TƯ
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F5EE] leading-tight">
          Bạn đang tìm một bất động sản khác biệt?
        </h2>

        <p className="text-base sm:text-lg text-[#B8B3A7] max-w-2xl mx-auto leading-relaxed">
          Để đội ngũ tư vấn riêng của chúng tôi giúp bạn tìm lựa chọn phù hợp, kín đáo và đúng chuẩn mực thượng lưu.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenConsultation}
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-gold-gradient text-[#050505] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Yêu Cầu Tư Vấn Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={`tel:${siteSettings.hotline}`}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#161616] border border-[#D4AF37]/30 text-[#F8F5EE] font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:border-[#D4AF37] transition-all"
          >
            <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
            <span>Hotline: {siteSettings.hotline}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
