import React from 'react';
import { Phone, Mail, MapPin, Shield, ArrowUpRight, Award, Clock } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { siteSettings } = useSite();

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#D4AF37]/18 pt-16 pb-12 text-[#B8B3A7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#8C6A19] to-[#050505] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#050505] rounded-[6px] flex items-center justify-center">
                  <span className="font-serif font-bold text-[#F2D675] text-base">A</span>
                </div>
              </div>
              <span className="font-serif text-lg font-bold tracking-[0.16em] text-[#F8F5EE] uppercase">
                {siteSettings.siteName}
              </span>
            </div>
            <p className="text-sm text-[#77736B] leading-relaxed">
              {siteSettings.footerDescription}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#D4AF37] pt-2">
              <Shield className="w-4 h-4" />
              <span>Bảo mật thông tin giao dịch & Private Client 100%</span>
            </div>
          </div>

          {/* Real Estate Categories */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F8F5EE] tracking-wider uppercase">
              Danh Mục Luxury
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/properties?type=villa')}
                  className="hover:text-[#F2D675] transition-colors flex items-center gap-1.5"
                >
                  <span>Biệt Thự & Dinh Thự Đơn Lập</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?type=penthouse')}
                  className="hover:text-[#F2D675] transition-colors flex items-center gap-1.5"
                >
                  <span>Penthouse & Sky Villa Cao Cấp</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?type=apartment')}
                  className="hover:text-[#F2D675] transition-colors flex items-center gap-1.5"
                >
                  <span>Căn Hộ Hàng Hiệu Marriott & Branded</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?type=shophouse')}
                  className="hover:text-[#F2D675] transition-colors flex items-center gap-1.5"
                >
                  <span>Shophouse & Nhà Phố Thương Mại</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?type=resort')}
                  className="hover:text-[#F2D675] transition-colors flex items-center gap-1.5"
                >
                  <span>Biệt Thự Biển & Nghỉ Dưỡng</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Quick links & Locations */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F8F5EE] tracking-wider uppercase">
              Khu Vực Trọng Điểm
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/properties?province=TP.+Hồ+Chí+Minh&district=Quận+2+(TP.+Thủ+Đức)')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Thảo Điền & Thủ Thiêm (TP. Thủ Đức)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?province=TP.+Hồ+Chí+Minh&district=Quận+1')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Bến Nghé & Trung Tâm Quận 1
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?province=Hà+Nội&district=Tây+Hồ')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Bán Đảo Quảng An, Tây Hồ (Hà Nội)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/properties?province=Đà+Nẵng')}
                  className="hover:text-[#F2D675] transition-colors"
                >
                  Cung Đường Biển Non Nước (Đà Nẵng)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="hover:text-[#F2D675] transition-colors font-medium text-[#D4AF37]"
                >
                  Xem Tất Cả Dự Án Tiêu Biểu →
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#F8F5EE] tracking-wider uppercase">
              Liên Hệ & Concierge
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1" />
                <span className="leading-relaxed">{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href={`tel:${siteSettings.hotline}`} className="text-[#F8F5EE] font-semibold hover:text-[#F2D675]">
                  {siteSettings.hotline}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="hover:text-[#F2D675]">
                  {siteSettings.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#77736B] pt-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Phục vụ 24/7 đối với Khách hàng Private VIP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77736B]">
          <p>© {new Date().getFullYear()} {siteSettings.siteName}. Toàn bộ bản quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/about')} className="hover:text-[#B8B3A7] transition-colors">
              Chính sách bảo mật
            </button>
            <button onClick={() => onNavigate('/contact')} className="hover:text-[#B8B3A7] transition-colors">
              Điều khoản giao dịch
            </button>
            <button onClick={() => onNavigate('/admin')} className="hover:text-[#D4AF37] transition-colors">
              Cổng Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
