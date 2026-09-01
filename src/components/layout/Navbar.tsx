import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Heart,
  User,
  Shield,
  Phone,
  ChevronDown,
  LogOut,
  Building,
  Sparkles,
  Search,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenConsultation,
}) => {
  const { currentUser, userProfile, isSuperAdmin, openAuthModal, logout, favorites } = useAuth();
  const { siteSettings } = useSite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const hasAdminAccess = isSuperAdmin || userProfile?.role === 'admin';

  const navLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Bất Động Sản', path: '/properties' },
    { label: 'Dự Án Độc Bản', path: '/projects' },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleMobileNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/92 backdrop-blur-md border-b border-[#D4AF37]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-gradient text-black flex items-center justify-center font-serif font-bold text-xl shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-gold-gradient block">
                {siteSettings.brandName || 'AURA LUXURY'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#77736B] block">
                Private Real Estate
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path);

              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`text-xs uppercase tracking-widest font-semibold transition-all py-1 border-b-2 cursor-pointer ${
                    isActive
                      ? 'text-[#F2D675] border-[#D4AF37]'
                      : 'text-[#B8B3A7] border-transparent hover:text-[#F8F5EE] hover:border-white/20'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <button
              onClick={onOpenConsultation}
              className="text-xs uppercase tracking-widest font-semibold text-[#D4AF37] hover:text-[#F2D675] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tư Vấn VIP</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Favorites Icon */}
            <button
              onClick={() => onNavigate('/account?tab=favorites')}
              className="relative p-2.5 rounded-full bg-[#161616] border border-white/10 text-[#B8B3A7] hover:text-[#F2D675] transition-colors cursor-pointer"
              title="Danh sách BĐS yêu thích"
            >
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut if Admin */}
            {hasAdminAccess && (
              <button
                onClick={() => onNavigate('/admin')}
                className="px-3.5 py-2 rounded-xl bg-[#26231c] border border-[#D4AF37]/40 text-[#F2D675] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
                title="Truy cập Bảng điều khiển Quản trị"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Quản Trị</span>
              </button>
            )}

            {/* User Account / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs font-semibold text-[#F8F5EE] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-gradient text-black flex items-center justify-center font-serif text-[10px] font-bold">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#77736B]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-[#D4AF37]/30 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs font-semibold text-[#F8F5EE] truncate">
                        {userProfile?.displayName || 'Thành viên VIP'}
                      </p>
                      <p className="text-[10px] text-[#77736B] truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/account?tab=overview');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#B8B3A7] hover:text-white hover:bg-[#161616] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Hồ Sơ & Giao Dịch</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/account?tab=favorites');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#B8B3A7] hover:text-white hover:bg-[#161616] flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#EF4444]" />
                      <span>Danh Sách Yêu Thích</span>
                    </button>

                    {hasAdminAccess && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('/admin');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs text-[#F2D675] hover:bg-[#161616] flex items-center gap-2 border-t border-white/5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Trang Quản Trị Admin</span>
                      </button>
                    )}

                    <div className="border-t border-white/10 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[#EF4444] hover:bg-[#161616] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/30 transition-all cursor-pointer"
              >
                Đăng Nhập
              </button>
            )}
          </div>

          {/* Mobile Right Bar: Favorite + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('/account?tab=favorites')}
              aria-label="Danh sách yêu thích"
              className="relative min-w-[44px] min-h-[44px] rounded-xl bg-[#161616] border border-white/10 text-[#B8B3A7] flex items-center justify-center cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-[#161616] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Slide in from Right: min(88vw, 360px)) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-[min(88vw,360px)] h-full bg-[#111111] border-l border-[#D4AF37]/30 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl z-10">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-gradient text-black flex items-center justify-center font-serif font-bold text-sm">
                    A
                  </div>
                  <span className="font-serif text-base font-bold text-gold-gradient">
                    {siteSettings.brandName || 'AURA LUXURY'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Đóng menu"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-[#161616] border border-white/10 flex items-center justify-center text-[#B8B3A7] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Snippet on Mobile */}
              {currentUser ? (
                <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#D4AF37]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold-gradient text-black flex items-center justify-center font-serif font-bold text-xs">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#F8F5EE] truncate">
                        {userProfile?.displayName || 'Thành viên VIP'}
                      </p>
                      <p className="text-[10px] text-[#77736B] truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMobileNav('/account')}
                    className="text-[11px] font-semibold text-[#D4AF37] hover:underline"
                  >
                    Xem
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
                >
                  <span>Đăng Nhập / Đăng Ký</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Nav Items */}
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.path === '/'
                      ? currentPath === '/'
                      : currentPath.startsWith(link.path);

                  return (
                    <button
                      key={link.path}
                      onClick={() => handleMobileNav(link.path)}
                      className={`w-full min-h-[48px] px-4 rounded-xl text-left text-xs uppercase tracking-widest font-semibold flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-gold-gradient text-black font-bold'
                          : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 -rotate-90 opacity-60`} />
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenConsultation();
                  }}
                  className="w-full min-h-[48px] px-4 rounded-xl text-left text-xs uppercase tracking-widest font-semibold text-[#D4AF37] hover:bg-[#161616] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Tư Vấn VIP Riêng</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {hasAdminAccess && (
                  <button
                    onClick={() => handleMobileNav('/admin')}
                    className="w-full min-h-[48px] px-4 rounded-xl text-left text-xs uppercase tracking-widest font-semibold text-[#F2D675] bg-[#26231c] border border-[#D4AF37]/30 flex items-center justify-between mt-2"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Bảng Quản Trị Admin</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#B8B3A7]">
                <span>Hotline VIP:</span>
                <a
                  href={`tel:${siteSettings.hotline || '0988888888'}`}
                  className="font-mono text-[#F2D675] font-bold"
                >
                  {siteSettings.hotline || '0988 888 888'}
                </a>
              </div>

              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-[#161616] border border-white/10 text-xs font-semibold text-[#EF4444] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
