import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  CreditCard,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Calendar,
  Filter,
} from 'lucide-react';
import { Reservation, Property } from '../../types';
import { formatFullVND, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  approveReservationAdmin,
  cancelReservationAdmin,
} from '../../services/adminService';

interface AdminReservationsProps {
  reservations: Reservation[];
  properties: Property[];
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 20;

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  reservations,
  properties,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Details
  const [approveTarget, setApproveTarget] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [viewDetailTarget, setViewDetailTarget] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.reservationCode.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.userPhone.includes(q) ||
        r.propertyTitle.toLowerCase().includes(q) ||
        r.transferContent.toLowerCase().includes(q);

      const matchStatus = activeStatusTab === 'all' || r.status === activeStatusTab;

      // Date range filtering
      let matchDate = true;
      if (fromDate || toDate) {
        const itemDate = new Date(r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt || 0);
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          if (itemDate < from) matchDate = false;
        }
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (itemDate > to) matchDate = false;
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [reservations, search, activeStatusTab, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservations, currentPage]);

  const handleApproveConfirm = async () => {
    if (!approveTarget || !currentUser || processing) return;

    setProcessing(true);
    try {
      const res = await approveReservationAdmin(
        approveTarget.id,
        approveTarget.propertyId,
        currentUser.email || 'admin'
      );
      if (res && res.success === false) {
        error(res.message || 'Lỗi khi duyệt giữ chỗ.');
      } else {
        success(res?.message || `Đã xác nhận thanh toán giữ chỗ mã ${approveTarget.reservationCode}. BĐS đã chuyển sang trạng thái ĐÃ GIỮ CHỖ.`);
      }
      setApproveTarget(null);
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Lỗi khi duyệt giữ chỗ.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget || !currentUser || processing) return;

    if (!cancelReason.trim() || cancelReason.trim().length < 3) {
      error('Vui lòng nhập lý do hủy tối thiểu 3 ký tự.');
      return;
    }

    setProcessing(true);
    try {
      const res = await cancelReservationAdmin(
        cancelTarget.id,
        cancelTarget.propertyId,
        cancelReason.trim(),
        currentUser.email || 'admin'
      );
      if (res && res.success === false) {
        error(res.message || 'Lỗi khi hủy giữ chỗ.');
      } else {
        success(res?.message || `Đã hủy giữ chỗ mã ${cancelTarget.reservationCode}. BĐS đã mở khả dụng trở lại.`);
      }
      setCancelTarget(null);
      setCancelReason('');
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Lỗi khi hủy giữ chỗ.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 uppercase inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã xác nhận</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Chờ đối soát</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 uppercase inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Đã hủy</span>
          </span>
        );
      case 'expired':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#77736B]/20 text-[#B8B3A7] border border-white/10 uppercase inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Hết hạn</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 uppercase">
            Đã hoàn cọc
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Giữ Chỗ & Đặt Cọc ({reservations.length})
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Đối soát sao kê ngân hàng, phê duyệt giữ chỗ an toàn và kích hoạt khóa bất động sản.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#111111] p-4 rounded-2xl border border-[#D4AF37]/15 space-y-4 shadow-xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Tất Cả' },
            { key: 'pending', label: 'Chờ Đối Soát' },
            { key: 'paid', label: 'Đã Xác Nhận' },
            { key: 'cancelled', label: 'Đã Hủy' },
            { key: 'expired', label: 'Hết Hạn' },
            { key: 'refunded', label: 'Đã Hoàn Tiền' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveStatusTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeStatusTab === tab.key
                  ? 'bg-gold-gradient text-black font-bold shadow-md'
                  : 'bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã GD, tên khách, email, SĐT, cú pháp CK..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-[11px] text-[#77736B] whitespace-nowrap">Từ ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-[11px] text-[#77736B] whitespace-nowrap">Đến ngày:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Mã Giao Dịch</th>
                <th className="p-4">Bất Động Sản</th>
                <th className="p-4">Người Đặt Chỗ</th>
                <th className="p-4">Tiền Cọc</th>
                <th className="p-4">Cú Pháp CK</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#77736B]">
                    Không có dữ liệu giao dịch giữ chỗ phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedList.map((res) => (
                  <tr key={res.id} className="hover:bg-[#161616]/50">
                    <td className="p-4 font-mono font-bold text-[#F2D675]">
                      <button
                        onClick={() => setViewDetailTarget(res)}
                        className="hover:underline cursor-pointer"
                      >
                        {res.reservationCode}
                      </button>
                    </td>
                    <td className="p-4 max-w-[180px]">
                      <div className="font-semibold text-[#F8F5EE] truncate">{res.propertyTitle}</div>
                      {res.propertyCode && (
                        <span className="text-[10px] text-[#77736B] font-mono">Mã: {res.propertyCode}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#F8F5EE]">{res.userName}</div>
                      <div className="text-[11px] text-[#D4AF37]">{res.userPhone}</div>
                      <div className="text-[10px] text-[#77736B]">{res.userEmail}</div>
                    </td>
                    <td className="p-4 font-serif font-bold text-[#F2D675]">
                      {formatFullVND(res.depositAmount)}
                    </td>
                    <td className="p-4">
                      <code className="px-2 py-0.5 rounded bg-[#161616] text-[#F8F5EE] border border-white/10 font-mono text-[11px]">
                        {res.transferContent}
                      </code>
                    </td>
                    <td className="p-4">{getStatusBadge(res.status)}</td>
                    <td className="p-4 text-[11px] text-[#77736B]">{formatDate(res.createdAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === 'pending' && (
                          <>
                            <button
                              disabled={processing}
                              onClick={() => setApproveTarget(res)}
                              className="px-3 py-1.5 rounded-lg bg-[#22C55E]/20 hover:bg-[#22C55E] text-[#22C55E] hover:text-black font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Xác nhận đã nhận tiền"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt Tiền</span>
                            </button>
                            <button
                              disabled={processing}
                              onClick={() => setCancelTarget(res)}
                              className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Hủy giao dịch"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Hủy</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setViewDetailTarget(res)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] border border-white/10 text-xs font-semibold cursor-pointer"
                          title="Xem chi tiết"
                        >
                          Chi Tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (20/page) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-[#161616]/70 border-t border-white/10 text-xs text-[#B8B3A7]">
            <span>
              Trang {currentPage} / {totalPages} (Tổng {filteredReservations.length} bản ghi)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewDetailTarget && (
        <Modal
          isOpen={!!viewDetailTarget}
          onClose={() => setViewDetailTarget(null)}
          title="Chi Tiết Giao Dịch Giữ Chỗ"
          subtitle={`Mã giao dịch: ${viewDetailTarget.reservationCode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#161616] p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#77736B] block">Thông Tin Khách Hàng</span>
                <p className="text-[#F8F5EE] font-semibold">{viewDetailTarget.userName}</p>
                <p className="text-[#D4AF37] font-mono">{viewDetailTarget.userPhone}</p>
                <p className="text-[#B8B3A7]">{viewDetailTarget.userEmail}</p>
              </div>

              <div className="bg-[#161616] p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#77736B] block">Thông Tin Thanh Toán</span>
                <p className="text-[#F2D675] font-serif font-bold text-base">{formatFullVND(viewDetailTarget.depositAmount)}</p>
                <p className="text-[#B8B3A7]">Cú pháp: <code className="text-[#F8F5EE]">{viewDetailTarget.transferContent}</code></p>
                <div>{getStatusBadge(viewDetailTarget.status)}</div>
              </div>
            </div>

            <div className="bg-[#161616] p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#77736B] block">Bất Động Sản Liên Kết</span>
              <p className="text-[#F8F5EE] font-semibold">{viewDetailTarget.propertyTitle}</p>
              <p className="text-[#77736B]">Property ID: {viewDetailTarget.propertyId}</p>
              {viewDetailTarget.expiresAt && (
                <p className="text-[#B8B3A7]">Thời hạn thanh toán: <span className="text-[#F8F5EE]">{new Date(viewDetailTarget.expiresAt).toLocaleString('vi-VN')}</span></p>
              )}
            </div>

            {viewDetailTarget.adminNote && (
              <div className="bg-[#161616] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#77736B] block">Ghi Chú Admin</span>
                <p className="text-[#B8B3A7]">{viewDetailTarget.adminNote}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setViewDetailTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      {approveTarget && (
        <Modal
          isOpen={!!approveTarget}
          onClose={() => setApproveTarget(null)}
          title="Xác Nhận Đã Nhận Tiền Đặt Cọc"
          subtitle={`Mã giao dịch: ${approveTarget.reservationCode}`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#22C55E]/30 space-y-2 text-xs">
              <p className="text-[#B8B3A7]">
                Khách hàng: <strong className="text-[#F8F5EE]">{approveTarget.userName}</strong>
              </p>
              <p className="text-[#B8B3A7]">
                Số tiền: <strong className="text-[#F2D675] font-serif text-sm">{formatFullVND(approveTarget.depositAmount)}</strong>
              </p>
              <p className="text-[#B8B3A7]">
                Nội dung chuyển khoản: <code className="text-[#F8F5EE]">{approveTarget.transferContent}</code>
              </p>
            </div>

            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Hành động này sẽ xác nhận trạng thái <strong>ĐÃ THANH TOÁN</strong> và tự động cập nhật bất động sản{' '}
              <strong className="text-[#F8F5EE]">"{approveTarget.propertyTitle}"</strong> sang trạng thái <strong>ĐÃ GIỮ CHỖ</strong> trên toàn bộ hệ thống.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#161616] text-xs font-semibold text-[#B8B3A7] cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleApproveConfirm}
                className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {processing ? 'Đang duyệt...' : 'Xác Nhận & Khóa BĐS'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <Modal
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          title="Hủy Yêu Cầu Giữ Chỗ"
          subtitle={`Mã giao dịch: ${cancelTarget.reservationCode}`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1.5">
                Lý do hủy yêu cầu *
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Quá hạn thanh toán, khách hàng yêu cầu hủy, sai nội dung chuyển khoản..."
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <p className="text-xs text-[#EF4444] leading-relaxed">
              Lưu ý: Bất động sản liên kết sẽ được mở khả dụng (available) trở lại nếu đang ở trạng thái giữ chỗ.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#161616] text-xs font-semibold text-[#B8B3A7] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleCancelConfirm}
                className="px-6 py-2.5 rounded-xl bg-[#EF4444] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#DC2626] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {processing ? 'Đang hủy...' : 'Xác Nhận Hủy Giao Dịch'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
