import React from 'react';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Mail, Shield, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenConsultation,
}) => {
  const { siteSettings } = useSite();
  const { currentUser, isSuperAdmin, userProfile } = useAuth();

  const hasAdminAccess = isSuperAdmin || userProfile?.role === 'admin';

  return (
    <footer className="bg-[#050505] text-[#B8B3A7] border-t border-[#D4AF37]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Slogan (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient text-black flex items-center justify-center font-serif font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-gold-gradient tracking-wider block">
                  {siteSettings.brandName || 'AURA LUXURY'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#77736B] block">
                  Private Real Estate
                </span>
              </div>
            </div>

            <p className="text-xs text-[#B8B3A7] leading-relaxed max-w-sm">
              {siteSettings.slogan ||
                'Nền tảng giao dịch và quản lý bất động sản siêu sang, bảo chứng giá trị truyền đời và vị thế của giới tinh hoa.'}
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`tel:${siteSettings.hotline}`}
                  className="font-mono font-bold text-[#F2D675] hover:underline"
                >
                  {siteSettings.hotline}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{siteSettings.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#F8F5EE] uppercase tracking-wider">
              Khám Phá Danh Mục
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/properties?propertyType=villa')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Biệt Thự & Dinh Thự Ven Sông
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?propertyType=penthouse')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Penthouse & Sky Villa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?propertyType=apartment')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Căn Hộ Hạng Sang Trung Tâm
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?propertyType=shophouse')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Shophouse & Phố Thương Mại
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Quần Thể Đô Thị Nghỉ Dưỡng
                </button>
              </li>
            </ul>
          </div>

          {/* Exclusive Services */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#F8F5EE] uppercase tracking-wider">
              Dịch Vụ Đặc Quyền
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Tư Vấn Đầu Tư Private Client
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Thẩm Định & Định Giá Di Sản
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Ký Gửi & Bàn Giao Kín (Off-market)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Hỗ Trợ Pháp Lý & Khóa Cọc Trực Tuyến
                </button>
              </li>
            </ul>
          </div>

          {/* VIP Concierge Newsletter & Admin Link */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#F8F5EE] uppercase tracking-wider">
              Thành Viên VIP
            </h4>
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Đăng ký nhận báo cáo thị trường độc quyền và các danh mục bất động sản off-market chưa công khai.
            </p>

            <button
              onClick={onOpenConsultation}
              className="w-full py-2.5 px-4 rounded-xl bg-[#161616] border border-[#D4AF37]/40 text-xs font-bold text-[#F2D675] hover:bg-gold-gradient hover:text-black transition-all flex items-center justify-center gap-1.5"
            >
              <span>Đăng Ký Tư Vấn VIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/admin')}
                className="text-[11px] text-[#77736B] hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Cổng Quản Trị Hệ Thống</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77736B]">
          <p>© {new Date().getFullYear()} AURA Luxury Real Estate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Tiêu Chuẩn Bảo Mật SSL 256-Bit</span>
            <span>Bảo Chứng Pháp Lý</span>
            <span>Chính Sách Giữ Chỗ 24H</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
