import React from 'react';
import { Building2, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface FeaturedProjectsProps {
  projects: Project[];
  onNavigate: (path: string) => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ projects, onNavigate }) => {
  const displayProjects = projects.slice(0, 3);

  return (
    <section className="py-20 bg-[#0B0B0B] border-y border-[#D4AF37]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D4AF37]/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              <Building2 className="w-4 h-4" />
              <span>DỰ ÁN BIỂU TƯỢNG</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#F8F5EE] tracking-tight">
              Quần Thể & Đại Dự Án Hạng Sang
            </h2>
            <p className="text-sm text-[#B8B3A7] max-w-xl">
              Quy tụ các dự án danh giá mang thương hiệu quốc tế với tiêu chuẩn sống vượt mọi giới hạn.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/projects')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[#F2D675] hover:text-[#D4AF37] transition-colors self-start md:self-auto cursor-pointer group"
          >
            <span>Xem Tất Cả Dự Án</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Editorial Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onNavigate(`/projects?id=${proj.slug || proj.id}`)}
              className="group cursor-pointer rounded-[24px] overflow-hidden bg-[#111111] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-xl"
            >
              {/* Image Banner */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#161616]">
                <img
                  src={proj.thumbnail}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/80 text-[#F2D675] border border-[#D4AF37]/30 backdrop-blur-md">
                    {proj.projectType}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#B8B3A7]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{proj.district}, {proj.province}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#F8F5EE] group-hover:text-[#F2D675] transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-[#77736B] line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[#77736B] block">Khoảng giá</span>
                    <span className="font-serif font-bold text-[#F2D675]">
                      {proj.minPrice ? `Từ ${formatCurrency(proj.minPrice)}` : 'Đang cập nhật'}
                    </span>
                  </div>
                  <span className="font-semibold text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Khám phá →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
