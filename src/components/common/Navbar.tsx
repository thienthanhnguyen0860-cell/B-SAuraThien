import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Building2,
  Phone,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { currentUser, userProfile, isAdmin, logout, openAuthModal } = useAuth();
  const { siteSettings } = useSite();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const favoriteCount = userProfile?.favorites?.length || 0;

  const navLinks = [
    { label: 'Bất Động Sản', path: '/properties' },
    { label: 'Dự Án', path: '/projects' },
    { label: 'Mua', path: '/properties?listingType=sale' },
    { label: 'Thuê', path: '/properties?listingType=rent' },
    { label: 'Về Chúng Tôi', path: '/about' },
    { label: 'Liên Hệ', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-[#D4AF37]/18 py-3.5 shadow-2xl shadow-black/80'
          : 'bg-[#050505]/60 backdrop-blur-md border-b border-[#D4AF37]/10 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#8C6A19] to-[#050505] p-0.5 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#050505] rounded-[7px] flex items-center justify-center">
              <span className="font-serif font-bold text-[#F2D675] text-lg tracking-widest">A</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.18em] text-[#F8F5EE] uppercase group-hover:text-[#F2D675] transition-colors">
              {siteSettings.siteName.split(' ')[0] || 'AURA'}
            </span>
            <span className="text-[9px] tracking-[0.3em] text-[#D4AF37] uppercase font-semibold -mt-1">
              LUXURY REALTY
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8" id="desktop-nav">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path.startsWith('/properties') && currentPath.startsWith('/properties') && link.path.includes(currentPath));
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.path)}
                className={`text-sm font-medium tracking-wider uppercase transition-colors relative py-1 ${
                  isActive ? 'text-[#F2D675]' : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4" id="navbar-actions">
          {/* Search Trigger */}
          <button
            id="navbar-search-btn"
            aria-label="Tìm kiếm bất động sản"
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
              else handleNavClick('/properties');
            }}
            className="w-10 h-10 rounded-full bg-[#111111] border border-[#D4AF37]/15 flex items-center justify-center text-[#B8B3A7] hover:text-[#F2D675] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Favorite Trigger */}
          <button
            id="navbar-favorites-btn"
            aria-label="Danh sách yêu thích"
            onClick={() => handleNavClick('/account?tab=favorites')}
            className="relative w-10 h-10 rounded-full bg-[#111111] border border-[#D4AF37]/15 flex items-center justify-center text-[#B8B3A7] hover:text-[#F2D675] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#050505] text-[10px] font-bold flex items-center justify-center shadow-md">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Admin Fast Link */}
          {isAdmin && (
            <button
              id="navbar-admin-btn"
              onClick={() => handleNavClick('/admin')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F2D675] text-xs font-semibold hover:bg-[#D4AF37]/20 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* User Auth Popover / Button */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161616] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-sm text-[#F8F5EE] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#F2D675] flex items-center justify-center text-xs font-bold">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-medium">
                  {userProfile?.displayName || 'Tài khoản'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#77736B]" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111111] border border-[#D4AF37]/20 shadow-2xl p-2 z-50 text-sm"
                  >
                    <div className="px-3 py-2 border-b border-[#D4AF37]/10">
                      <p className="text-xs text-[#77736B]">Đăng nhập với</p>
                      <p className="font-semibold text-[#F8F5EE] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#D4AF37]/15 text-[#F2D675] uppercase">
                        {userProfile?.role || 'Khách hàng'}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('/account')}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616] flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        <span>Tổng quan tài khoản</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/account?tab=reservations')}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616] flex items-center gap-2.5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        <span>Lịch sử giao dịch</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('/account?tab=favorites')}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616] flex items-center gap-2.5 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#D4AF37]" />
                        <span>Bất động sản đã lưu</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleNavClick('/admin')}
                          className="w-full text-left px-3 py-2 rounded-lg text-[#F2D675] hover:bg-[#D4AF37]/10 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                          <span>Quản trị viên (Admin)</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#D4AF37]/10">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => openAuthModal('login')}
              className="px-4 sm:px-5 py-2 rounded-full bg-gold-gradient text-[#050505] font-semibold text-xs sm:text-sm tracking-wider uppercase hover:shadow-lg hover:shadow-[#D4AF37]/25 transition-all cursor-pointer"
            >
              Đăng Nhập
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle"
            aria-label="Mở menu điện thoại"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-[#111111] border border-[#D4AF37]/15 flex items-center justify-center text-[#F8F5EE]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0B0B0B] border-b border-[#D4AF37]/20 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.path)}
                  className="text-left py-2 text-base font-medium text-[#B8B3A7] hover:text-[#F2D675] border-b border-white/5 transition-colors"
                >
                  {link.label}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  className="text-left py-2 text-base font-semibold text-[#F2D675] flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Trang Quản Trị Admin</span>
                </button>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <a
                  href={`tel:${siteSettings.hotline}`}
                  className="flex items-center gap-3 text-sm text-[#D4AF37] font-medium"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hotline VIP: {siteSettings.hotline}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
