import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Heart,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Building,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Reservation, Property } from '../../types';
import { getUserReservations, getProperties } from '../../services/propertyService';
import { formatFullVND, formatDate } from '../../lib/utils';
import { PropertyCard } from '../property/PropertyCard';
import { EmptyState } from '../common/EmptyState';
import {
  PropertyCardSkeleton,
  ReservationCardSkeleton,
  FormFieldSkeleton,
} from '../common/Skeleton';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AccountDashboardProps {
  initialTab?: string;
  allProperties?: Property[];
  onNavigate: (path: string) => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  initialTab = 'overview',
  allProperties = [],
  onNavigate,
}) => {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Reservation Filtering & Pagination (10/page)
  const [resStatusFilter, setResStatusFilter] = useState<'all' | 'pending' | 'paid' | 'expired' | 'cancelled'>('all');
  const [resSearch, setResSearch] = useState('');
  const [resPage, setResPage] = useState(1);
  const RES_PER_PAGE = 10;

  // Selected reservation for receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState<Reservation | null>(null);

  // Profile Edit States
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || '');
      setEditPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // 1. Fetch user reservations directly filtered by user's UID
        const resList = await getUserReservations(currentUser.uid);
        setReservations(resList);

        // 2. Fetch all properties to filter favorites
        const allProps = allProperties.length > 0 ? allProperties : await getProperties();
        const favs = allProps.filter((p) => userProfile?.favorites?.includes(p.id));
        setFavoriteProperties(favs);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [currentUser, userProfile?.favorites, allProperties]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingProfile(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: editName.trim(),
        phone: editPhone.trim() || null,
        updatedAt: serverTimestamp(),
      });
      await refreshUserProfile();
      success('Đã cập nhật thông tin hồ sơ thành công.');
    } catch (err: any) {
      error('Không thể cập nhật hồ sơ lúc này.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã xác nhận giữ chỗ</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang chờ đối soát</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#77736B]/20 text-[#B8B3A7] border border-white/10">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hết hạn giữ chỗ</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
            <span>Đã hoàn tiền cọc</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered & Paginated Reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = resStatusFilter === 'all' || r.status === resStatusFilter;
      const q = resSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.reservationCode.toLowerCase().includes(q) ||
        r.propertyTitle.toLowerCase().includes(q) ||
        (r.propertyCode && r.propertyCode.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [reservations, resStatusFilter, resSearch]);

  const totalResPages = Math.max(1, Math.ceil(filteredReservations.length / RES_PER_PAGE));
  const currentReservations = useMemo(() => {
    const start = (resPage - 1) * RES_PER_PAGE;
    return filteredReservations.slice(start, start + RES_PER_PAGE);
  }, [filteredReservations, resPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner Card */}
      <div className="bg-[#111111] border border-[#D4AF37]/25 rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6A19] p-0.5 shadow-lg shadow-[#D4AF37]/10 shrink-0">
            <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center font-serif text-2xl font-bold text-[#F2D675]">
              {userProfile?.displayName?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EE] truncate">
                {userProfile?.displayName || 'Khách Hàng VIP'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D4AF37]/20 text-[#F2D675] uppercase border border-[#D4AF37]/30">
                {userProfile?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên VIP'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#B8B3A7] mt-0.5 truncate">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {userProfile?.role === 'admin' && (
            <button
              onClick={() => onNavigate('/admin')}
              className="flex-1 md:flex-initial min-h-[44px] px-4 py-2 rounded-xl bg-[#D4AF37]/15 text-[#F2D675] border border-[#D4AF37]/40 text-xs font-semibold hover:bg-[#D4AF37]/25 transition-colors cursor-pointer"
            >
              Vào Trang Admin
            </button>
          )}
          <button
            onClick={logout}
            className="flex-1 md:flex-initial min-h-[44px] px-4 py-2 rounded-xl bg-[#161616] text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
          >
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* Main Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] p-2 sm:p-3 shadow-lg flex lg:flex-col gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-[44px] flex-1 lg:w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center lg:justify-start gap-2.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-gold-gradient text-black shadow-md font-bold'
                : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Tổng quan hồ sơ</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`min-h-[44px] flex-1 lg:w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'reservations'
                ? 'bg-gold-gradient text-black shadow-md font-bold'
                : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Lịch sử giữ chỗ</span>
            </div>
            {reservations.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'reservations' ? 'bg-black text-[#F2D675]' : 'bg-[#161616] text-[#D4AF37]'
              }`}>
                {reservations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`min-h-[44px] flex-1 lg:w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-gold-gradient text-black shadow-md font-bold'
                : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>BĐS Đã lưu</span>
            </div>
            {favoriteProperties.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'favorites' ? 'bg-black text-[#F2D675]' : 'bg-[#161616] text-[#D4AF37]'
              }`}>
                {favoriteProperties.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW & PROFILE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#111111] p-5 rounded-2xl border border-[#D4AF37]/15 shadow-md">
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Giao Dịch Giữ Chỗ
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#F2D675] mt-1 block">
                    {loadingData ? '—' : reservations.length}
                  </span>
                </div>
                <div className="bg-[#111111] p-5 rounded-2xl border border-[#D4AF37]/15 shadow-md">
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Bất Động Sản Yêu Thích
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#F2D675] mt-1 block">
                    {loadingData ? '—' : favoriteProperties.length}
                  </span>
                </div>
                <div className="bg-[#111111] p-5 rounded-2xl border border-[#D4AF37]/15 shadow-md">
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Hạng Thành Viên
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#F2D675] mt-1 block">
                    Private VIP
                  </span>
                </div>
              </div>

              {/* Profile Information Form */}
              <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-6 shadow-xl">
                <h3 className="font-serif text-lg font-bold text-[#F8F5EE] border-b border-[#D4AF37]/15 pb-4">
                  Thông Tin Cá Nhân & Liên Hệ
                </h3>

                {loadingData ? (
                  <div className="space-y-4">
                    <FormFieldSkeleton />
                    <FormFieldSkeleton />
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="0988 888 888"
                          className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                        Địa chỉ Email (Định danh bảo mật)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || ''}
                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-[#77736B] cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs sm:text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RESERVATIONS / TRANSACTIONS */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-serif text-lg font-bold text-[#F8F5EE]">
                  Lịch Sử Giữ Chỗ & Đặt Cọc ({filteredReservations.length})
                </h3>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111111] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'pending', label: 'Chờ đối soát' },
                    { key: 'paid', label: 'Đã xác nhận' },
                    { key: 'expired', label: 'Hết hạn' },
                    { key: 'cancelled', label: 'Đã hủy' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setResStatusFilter(tab.key as any);
                        setResPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        resStatusFilter === tab.key
                          ? 'bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/40'
                          : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736B]" />
                  <input
                    type="text"
                    placeholder="Tìm mã hoặc BĐS..."
                    value={resSearch}
                    onChange={(e) => {
                      setResSearch(e.target.value);
                      setResPage(1);
                    }}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {loadingData ? (
                <div className="space-y-4">
                  <ReservationCardSkeleton />
                  <ReservationCardSkeleton />
                </div>
              ) : filteredReservations.length === 0 ? (
                <EmptyState
                  variant="reservations"
                  title="Không tìm thấy giao dịch nào"
                  description={
                    resSearch || resStatusFilter !== 'all'
                      ? 'Không có giao dịch nào khớp với bộ lọc tìm kiếm hiện tại.'
                      : 'Khi quý khách đặt giữ chỗ một bất động sản, mã giao dịch và trạng thái thanh toán sẽ được lưu tại đây.'
                  }
                  actionText={resSearch || resStatusFilter !== 'all' ? 'Xóa bộ lọc' : 'Khám phá bất động sản'}
                  onAction={() => {
                    if (resSearch || resStatusFilter !== 'all') {
                      setResSearch('');
                      setResStatusFilter('all');
                    } else {
                      onNavigate('/properties');
                    }
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {currentReservations.map((res) => (
                    <div
                      key={res.id}
                      className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] p-5 sm:p-6 space-y-4 shadow-xl hover:border-[#D4AF37]/35 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          {res.propertyThumbnail && (
                            <img
                              src={res.propertyThumbnail}
                              alt={res.propertyTitle}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          )}
                          <div>
                            <span className="text-[10px] font-mono text-[#77736B] block uppercase">
                              MÃ GIAO DỊCH
                            </span>
                            <span className="font-mono text-base font-bold text-[#F2D675]">
                              {res.reservationCode}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(res.status)}
                          <span className="text-xs text-[#77736B]">
                            {formatDate(res.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-serif text-sm sm:text-base font-semibold text-[#F8F5EE]">
                            {res.propertyTitle}
                          </h4>
                          {res.propertyCode && (
                            <span className="text-[11px] text-[#77736B] font-mono">
                              Mã BĐS: {res.propertyCode}
                            </span>
                          )}
                          <p className="text-xs text-[#B8B3A7] mt-1">
                            Cú pháp chuyển khoản:{' '}
                            <strong className="font-mono text-[#F8F5EE] bg-[#161616] px-2 py-0.5 rounded border border-white/5">
                              {res.transferContent}
                            </strong>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#77736B] uppercase block">
                            Số tiền giữ chỗ
                          </span>
                          <span className="font-serif text-lg font-bold text-[#F2D675]">
                            {formatFullVND(res.depositAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-white/5">
                        <button
                          onClick={() => setSelectedReceipt(res)}
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] text-xs font-semibold border border-white/10 hover:border-[#D4AF37]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Xem phiếu giao dịch</span>
                        </button>

                        {res.status === 'pending' && (
                          <button
                            onClick={() => onNavigate(`/checkout/${res.reservationCode}`)}
                            className="min-h-[40px] px-5 py-2 rounded-xl bg-gold-gradient text-[#050505] text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Thanh toán / Chuyển khoản</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls (10/page) */}
                  {totalResPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-[#77736B]">
                        Trang {resPage} / {totalResPages} (Tổng {filteredReservations.length} giao dịch)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={resPage === 1}
                          onClick={() => setResPage((p) => Math.max(1, p - 1))}
                          className="p-2 rounded-lg bg-[#161616] border border-white/10 text-[#B8B3A7] hover:text-[#F8F5EE] disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={resPage === totalResPages}
                          onClick={() => setResPage((p) => Math.min(totalResPages, p + 1))}
                          className="p-2 rounded-lg bg-[#161616] border border-white/10 text-[#B8B3A7] hover:text-[#F8F5EE] disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#F8F5EE]">
                Bất Động Sản Yêu Thích Của Quý Khách ({loadingData ? '...' : favoriteProperties.length})
              </h3>

              {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PropertyCardSkeleton />
                  <PropertyCardSkeleton />
                </div>
              ) : favoriteProperties.length === 0 ? (
                <EmptyState
                  variant="favorites"
                  title="Bạn chưa lưu bất động sản nào"
                  description="Khám phá bộ sưu tập bất động sản cao cấp dành cho bạn và nhấn vào biểu tượng trái tim để lưu lại."
                  actionText="Khám phá ngay"
                  onAction={() => onNavigate('/properties')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteProperties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT DETAIL MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-[24px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-bold text-[#F8F5EE]">Phiếu Giao Dịch Giữ Chỗ</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-[#77736B] hover:text-[#F8F5EE] p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between bg-[#161616] p-3 rounded-xl border border-white/5">
                <span className="text-[#B8B3A7]">Mã giao dịch:</span>
                <span className="font-mono font-bold text-[#F2D675] text-base">{selectedReceipt.reservationCode}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B3A7]">Trạng thái:</span>
                <div>{getStatusBadge(selectedReceipt.status)}</div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B3A7]">Bất động sản:</span>
                <span className="font-semibold text-[#F8F5EE] text-right">{selectedReceipt.propertyTitle}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B3A7]">Số tiền đặt cọc:</span>
                <span className="font-bold text-[#F2D675] text-base">{formatFullVND(selectedReceipt.depositAmount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B3A7]">Cú pháp đối soát:</span>
                <span className="font-mono text-[#F8F5EE] bg-[#161616] px-2 py-0.5 rounded">{selectedReceipt.transferContent}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#B8B3A7]">Ngày tạo yêu cầu:</span>
                <span className="text-[#F8F5EE]">{formatDate(selectedReceipt.createdAt)}</span>
              </div>

              {selectedReceipt.approvedAt && (
                <div className="flex items-center justify-between text-[#22C55E]">
                  <span>Ngày xác nhận:</span>
                  <span>{formatDate(selectedReceipt.approvedAt)}</span>
                </div>
              )}

              {selectedReceipt.adminNote && (
                <div className="bg-[#161616] p-3 rounded-xl border border-white/5 text-xs text-[#B8B3A7]">
                  <span className="block font-semibold text-[#F8F5EE] mb-1">Ghi chú hệ thống:</span>
                  {selectedReceipt.adminNote}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              {selectedReceipt.status === 'pending' && (
                <button
                  onClick={() => {
                    const code = selectedReceipt.reservationCode;
                    setSelectedReceipt(null);
                    onNavigate(`/checkout/${code}`);
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-gold-gradient text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Đến Trang Chuyển Khoản →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
