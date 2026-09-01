import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, isSuperAdmin, openAuthModal } = useAuth();

  const hasAdminAccess = isSuperAdmin || userProfile?.role === 'admin';

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#050505] p-4">
        <SEOHead title="Quản Trị Hệ Thống | AURA LUXURY" noIndex />
        <div className="max-w-md w-full text-center space-y-6 bg-[#111111] p-8 sm:p-10 rounded-[28px] border border-[#D4AF37]/30 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto text-[#D4AF37]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
              Cổng Quản Trị Viên AURA
            </h2>
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Khu vực bảo mật dành riêng cho Ban Quản Trị. Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Tài Khoản Admin</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="w-full py-3 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Trang Chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#050505] p-4">
        <SEOHead title="Truy Cập Bị Từ Chối (403) | AURA LUXURY" noIndex />
        <div className="max-w-md w-full text-center space-y-6 bg-[#111111] p-8 sm:p-10 rounded-[28px] border border-[#EF4444]/30 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 flex items-center justify-center mx-auto text-[#EF4444]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
              Truy Cập Bị Từ Chối (403)
            </h2>
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Tài khoản <strong className="text-[#F8F5EE]">{currentUser.email}</strong> không có quyền quản trị viên (Admin). Vui lòng liên hệ Quản trị viên cấp cao để được phân quyền.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider"
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Tổng Quan Quản Trị Hệ Thống | AURA LUXURY" noIndex />
      <AdminLayout onNavigate={onNavigate} />
    </>
  );
};
