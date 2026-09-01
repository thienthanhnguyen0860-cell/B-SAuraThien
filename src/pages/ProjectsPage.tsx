import React, { useState } from 'react';
import { Project, Property } from '../types';
import { Building2, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { SEOHead } from '../components/common/SEOHead';

interface ProjectsPageProps {
  projects: Project[];
  properties: Property[];
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  properties,
  onNavigate,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getPropertiesInProject = (project: Project) => {
    return properties.filter(
      (p) =>
        p.projectId === project.id ||
        (p.projectName && p.projectName.toLowerCase() === project.name.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] py-12 sm:py-16">
      <SEOHead
        title="Dự Án Biểu Tượng & Quần Thể Nghỉ Dưỡng Hạng Sang | AURA LUXURY"
        description="Tuyển tập các siêu dự án định danh vị thế thượng lưu, sở hữu tọa độ kim cương cùng hệ sinh thái tiện ích độc bản tại Việt Nam."
        canonicalPath="/projects"
        breadcrumbs={[
          { name: 'Trang chủ', path: '/' },
          { name: 'Dự án', path: '/projects' },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            QUẦN THỂ ĐÔ THỊ & KIỆT TÁC DANH GIÁ
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F5EE]">
            Dự Án Biểu Tượng
          </h1>
          <p className="text-sm text-[#B8B3A7] leading-relaxed">
            Tuyển tập các siêu dự án định danh vị thế thượng lưu, sở hữu tọa độ kim cương cùng hệ sinh thái tiện ích độc bản tại Việt Nam.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => {
            const linkedProps = getPropertiesInProject(proj);

            return (
              <div
                key={proj.id}
                className="group bg-[#111111] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-[24px] overflow-hidden transition-all duration-500 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={proj.thumbnail}
                      alt={proj.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-gradient text-black">
                        {proj.projectType}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#111111]/80 text-[#22C55E] border border-[#22C55E]/40 backdrop-blur-md">
                        {proj.status === 'selling' ? 'Đang Mở Bán' : 'Bàn Giao'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase">
                        {proj.developer || 'Chủ đầu tư hàng đầu'}
                      </p>
                      <h3 className="font-serif text-xl font-bold text-[#F8F5EE] group-hover:text-[#F2D675] transition-colors">
                        {proj.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#B8B3A7]">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{proj.district}, {proj.province}</span>
                    </div>

                    <p className="text-xs text-[#B8B3A7] line-clamp-3 leading-relaxed font-light">
                      {proj.description}
                    </p>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 pt-0 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-[10px] uppercase text-[#77736B] font-bold block">
                        Giá Khởi Điểm
                      </span>
                      <span className="font-serif text-base font-bold text-[#F2D675]">
                        {proj.minPrice ? `Từ ${formatCurrency(proj.minPrice)}` : 'Liên hệ'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#77736B] font-bold block">
                        Sản Phẩm Độc Quyền
                      </span>
                      <span className="font-serif text-sm font-bold text-[#F8F5EE]">
                        {linkedProps.length} BĐS đang niêm yết
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="w-full py-2.5 rounded-xl bg-[#161616] text-[#F8F5EE] text-xs font-semibold hover:bg-white/10 transition-colors border border-white/5"
                    >
                      Xem Tổng Thể
                    </button>
                    <button
                      onClick={() => onNavigate(`/properties?projectName=${encodeURIComponent(proj.name)}`)}
                      className="w-full py-2.5 rounded-xl bg-gold-gradient text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:shadow-md transition-all"
                    >
                      <span>Xem BĐS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Project Overview */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          subtitle={`Chủ đầu tư: ${selectedProject.developer} - ${selectedProject.district}, ${selectedProject.province}`}
          maxWidth="xl"
        >
          <div className="space-y-6 pt-2">
            <img
              src={selectedProject.thumbnail}
              alt={selectedProject.name}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-white/10 shadow-lg"
            />

            <div className="space-y-3">
              <h4 className="font-serif text-lg font-bold text-[#F8F5EE]">
                Quy Mô & Tầm Nhìn Dự Án
              </h4>
              <p className="text-sm text-[#B8B3A7] leading-relaxed whitespace-pre-line">
                {selectedProject.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#77736B] block">Khoản đầu tư ước tính</span>
                <span className="font-serif text-xl font-bold text-[#F2D675]">
                  {selectedProject.minPrice ? formatCurrency(selectedProject.minPrice) : 'Theo biểu giá chủ đầu tư'}
                </span>
              </div>

              <button
                onClick={() => {
                  const name = selectedProject.name;
                  setSelectedProject(null);
                  onNavigate(`/properties?projectName=${encodeURIComponent(name)}`);
                }}
                className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider"
              >
                Khám Phá Danh Mục BĐS Tại Dự Án
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
