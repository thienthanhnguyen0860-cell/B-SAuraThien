import React from 'react';
import { AccountDashboard } from '../components/account/AccountDashboard';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/common/SEOHead';

interface AccountPageProps {
  allProperties: Property[];
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  allProperties,
  onNavigate,
}) => {
  const { currentUser, openAuthModal } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#050505] px-4">
        <SEOHead title="Đăng Nhập Tài Khoản | AURA LUXURY" noIndex />
        <div className="max-w-md w-full text-center space-y-6 bg-[#111111] p-8 rounded-[24px] border border-[#D4AF37]/20 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto text-[#D4AF37]">
            <span className="font-serif text-2xl font-bold">A</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
              Tài Khoản Thành Viên VIP
            </h2>
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Vui lòng đăng nhập hoặc đăng ký để quản lý danh sách yêu thích, theo dõi tiến độ giữ chỗ và hồ sơ cá nhân.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#D4AF37]/25 transition-all"
          >
            Đăng Nhập Ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-10 sm:py-14">
      <SEOHead title="Quản Lý Tài Khoản VIP | AURA LUXURY" noIndex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccountDashboard allProperties={allProperties} onNavigate={onNavigate} />
      </div>
    </div>
  );
};
