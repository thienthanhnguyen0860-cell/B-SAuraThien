import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatFullVND } from '../../lib/utils';
import { createReservation } from '../../services/propertyService';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onNavigate: (path: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  property,
  onNavigate,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { paymentSettings } = useSite();
  const { success, error } = useToast();

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const depositAmount = paymentSettings.reservationDepositDefault || 100000000;

  const handleCreateReservation = async () => {
    if (!currentUser || !userProfile) {
      error('Vui lòng đăng nhập để tiếp tục giữ chỗ.');
      return;
    }

    if (property.status !== 'available') {
      error('Bất động sản này hiện không còn khả dụng để giữ chỗ.');
      return;
    }

    if (!confirmed) {
      error('Vui lòng tích chọn xác nhận thông tin.');
      return;
    }

    setSubmitting(true);
    try {
      const reservation = await createReservation({
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userName: userProfile.displayName || 'Khách Hàng',
        userPhone: userProfile.phone || '',
        property,
        depositAmount,
      });

      success(`Đã tạo yêu cầu giữ chỗ mã ${reservation.reservationCode}. Đang chuyển đến trang thanh toán...`);
      onClose();
      onNavigate(`/checkout/${reservation.reservationCode}`);
    } catch (err: any) {
      error(err.message || 'Lỗi khi tạo yêu cầu giữ chỗ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác Nhận Giữ Chỗ Độc Quyền"
      subtitle="Khóa giữ vị trí bất động sản ưu tiên trong 24 giờ trước khi mở bán công khai."
      maxWidth="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Property Summary Card */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#D4AF37]/20 flex gap-4 items-center">
          <img
            src={property.thumbnail || property.images?.[0]}
            alt={property.title}
            className="w-20 h-16 object-cover rounded-lg shrink-0 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-[#D4AF37] block">
              {property.propertyCode}
            </span>
            <h4 className="font-serif text-sm font-semibold text-[#F8F5EE] truncate">
              {property.title}
            </h4>
            <p className="text-xs text-[#B8B3A7] mt-0.5">
              Giá niêm yết: <strong className="text-[#F2D675]">{formatCurrency(property.price, property.priceUnit)}</strong>
            </p>
          </div>
        </div>

        {/* Deposit Calculation */}
        <div className="bg-[#0e0e0e] p-4 rounded-xl border border-[#D4AF37]/15 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#B8B3A7]">
            <span>Số tiền đặt cọc giữ chỗ (Tạm ứng):</span>
            <span className="text-sm sm:text-base font-serif font-bold text-[#F2D675]">
              {formatFullVND(depositAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-[#B8B3A7]">
            <span>Thời hạn giữ quyền ưu tiên:</span>
            <span className="text-xs font-semibold text-[#F8F5EE]">
              {Math.round(paymentSettings.reservationExpiryMinutes / 60)} Giờ
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-[#B8B3A7]">
            <span>Hình thức thanh toán:</span>
            <span className="text-xs font-semibold text-[#F8F5EE]">
              Chuyển khoản Ngân hàng (Thủ công / QR)
            </span>
          </div>
        </div>

        {/* Buyer info */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#D4AF37]/10 text-xs text-[#B8B3A7] space-y-1.5">
          <p className="font-semibold text-[#F8F5EE]">Thông tin người đặt chỗ:</p>
          <p>Họ tên: {userProfile?.displayName || 'Chưa cập nhật'}</p>
          <p>Email: {currentUser?.email}</p>
          <p>Số điện thoại: {userProfile?.phone || 'Chưa cập nhật'}</p>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 text-xs text-[#B8B3A7] cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37] focus:ring-0 focus:ring-offset-0 bg-[#161616]"
          />
          <span className="leading-relaxed group-hover:text-[#F8F5EE] transition-colors">
            Tôi xác nhận đã kiểm tra thông tin bất động sản và đồng ý gửi yêu cầu giữ chỗ. Tôi hiểu rằng bất động sản sẽ được khoá chính thức sau khi Ban Quản Trị đối soát thanh toán chuyển khoản.
          </span>
        </label>

        {/* Action Button */}
        <button
          onClick={handleCreateReservation}
          disabled={submitting || !confirmed}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-40 cursor-pointer"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Tiếp Tục Thanh Toán Chuyển Khoản</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
