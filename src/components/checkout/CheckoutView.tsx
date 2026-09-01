import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle2, QrCode, AlertCircle, ArrowLeft, Clock, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Reservation, Property } from '../../types';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatFullVND, formatDate } from '../../lib/utils';
import { getPropertyByIdOrSlug } from '../../services/propertyService';

interface CheckoutViewProps {
  reservation: Reservation;
  property?: Property | null;
  onNavigate: (path: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ reservation, property: initialProperty, onNavigate }) => {
  const { paymentSettings } = useSite();
  const { success, info } = useToast();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferredSubmitted, setTransferredSubmitted] = useState(false);
  const [property, setProperty] = useState<Property | null>(initialProperty || null);

  useEffect(() => {
    if (initialProperty) {
      setProperty(initialProperty);
    } else if (reservation.propertyId) {
      getPropertyByIdOrSlug(reservation.propertyId).then((p) => {
        if (p) setProperty(p);
      });
    }
  }, [reservation.propertyId, initialProperty]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    success(`Đã sao chép ${label}.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmTransfer = () => {
    setTransferredSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#F2D675', '#8C6A19', '#ffffff'],
    });
    info('Yêu cầu giữ chỗ đang được Ban Quản Trị đối soát. Bạn có thể theo dõi trạng thái trong Lịch sử giao dịch.');
  };

  // Build VietQR Image URL dynamically using paymentSettings
  const vietQrUrl = `https://api.vietqr.io/image/${paymentSettings.bankCode || 'TCB'}-${paymentSettings.accountNumber || '19038899888888'}-compact2.jpg?amount=${reservation.depositAmount}&addInfo=${encodeURIComponent(reservation.transferContent)}&accountName=${encodeURIComponent(paymentSettings.accountName || 'AURA LUXURY')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top back button */}
      <button
        onClick={() => onNavigate('/properties')}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] hover:text-[#F2D675] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay Lại Danh Mục BĐS</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
          CỔNG THANH TOÁN CHUYỂN KHOẢN GIỮ CHỖ
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F8F5EE]">
          Hướng Dẫn Chuyển Khoản Đặt Cọc
        </h1>
        <p className="text-sm text-[#B8B3A7] max-w-xl mx-auto">
          Mã giao dịch của quý khách:{' '}
          <strong className="font-mono text-[#F2D675] tracking-wider font-bold">
            {reservation.reservationCode}
          </strong>
        </p>
      </div>

      {transferredSubmitted ? (
        <div className="bg-[#111111] border border-[#22C55E]/40 rounded-[24px] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
              Đã Ghi Nhận Yêu Cầu Chuyển Khoản
            </h2>
            <p className="text-sm text-[#B8B3A7] max-w-lg mx-auto leading-relaxed">
              Hệ thống và bộ phận kế toán của AURA Luxury đang tiến hành đối soát giao dịch cho mã{' '}
              <strong className="text-[#F2D675] font-mono">{reservation.reservationCode}</strong>.
              Ngay khi tiền về tài khoản, bất động sản sẽ chính thức chuyển sang trạng thái <strong>ĐÃ GIỮ CHỖ</strong>.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/account?tab=reservations')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              Xem Lịch Sử Giao Dịch Của Tôi
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#161616] border border-white/10 text-sm font-semibold text-[#B8B3A7] hover:text-[#F8F5EE] transition-colors"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bank Details & Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#111111] border border-[#D4AF37]/25 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="font-serif text-lg font-bold text-[#F8F5EE] border-b border-[#D4AF37]/15 pb-4">
                Thông Tin Tài Khoản Thụ Hưởng
              </h3>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Ngân hàng
                  </span>
                  <span className="text-sm font-semibold text-[#F8F5EE]">
                    {paymentSettings.bankName}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentSettings.bankName, 'Tên ngân hàng')}
                  className="px-3 py-1.5 rounded-lg bg-[#26231c] hover:bg-[#D4AF37] text-xs font-semibold text-[#F2D675] hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-[#D4AF37]/30">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Số tài khoản thụ hưởng
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-[#F2D675] tracking-wider">
                    {paymentSettings.accountNumber}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentSettings.accountNumber, 'Số tài khoản')}
                  className="px-3 py-1.5 rounded-lg bg-gold-gradient text-xs font-bold text-black hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy STK</span>
                </button>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Chủ tài khoản
                  </span>
                  <span className="text-sm font-semibold text-[#F8F5EE] uppercase">
                    {paymentSettings.accountName}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentSettings.accountName, 'Tên chủ tài khoản')}
                  className="px-3 py-1.5 rounded-lg bg-[#26231c] hover:bg-[#D4AF37] text-xs font-semibold text-[#F2D675] hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#77736B] block">
                    Số tiền cần chuyển
                  </span>
                  <span className="font-serif text-lg font-bold text-[#F2D675]">
                    {formatFullVND(reservation.depositAmount)}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(reservation.depositAmount.toString(), 'Số tiền')}
                  className="px-3 py-1.5 rounded-lg bg-[#26231c] hover:bg-[#D4AF37] text-xs font-semibold text-[#F2D675] hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="p-4 rounded-xl bg-[#1f1a10] border border-[#D4AF37]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#F2D675]">
                    Nội dung chuyển khoản (Bắt buộc chính xác):
                  </span>
                  <button
                    onClick={() => copyToClipboard(reservation.transferContent, 'Nội dung chuyển khoản')}
                    className="px-3 py-1.5 rounded-lg bg-gold-gradient text-xs font-bold text-black hover:shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Nội Dung</span>
                  </button>
                </div>
                <div className="p-2.5 bg-black/60 rounded-lg text-center font-mono font-bold text-sm sm:text-base text-[#F8F5EE] tracking-widest border border-white/10 select-all">
                  {reservation.transferContent}
                </div>
              </div>

              {/* Warning Notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#161616] border border-white/5 text-xs text-[#B8B3A7]">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {paymentSettings.paymentInstructions ||
                    'Vui lòng chuyển đúng số tiền và nội dung để việc xác nhận được nhanh chóng.'}
                </span>
              </div>
            </div>

            {/* I have transferred button */}
            <button
              id="confirm-transferred-btn"
              onClick={handleConfirmTransfer}
              className="w-full py-4 rounded-2xl bg-gold-gradient text-[#050505] font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-[#D4AF37]/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Tôi Đã Chuyển Khoản Xong</span>
            </button>
          </div>

          {/* Right Column: QR Code & Property Recap */}
          <div className="lg:col-span-5 space-y-6">
            {/* VietQR Box */}
            <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-[24px] p-6 text-center space-y-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F2D675]">
                <QrCode className="w-4 h-4" />
                <span>Quét Mã QR Chuyển Nhanh 24/7</span>
              </div>

              <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mx-auto max-w-[240px]">
                <img
                  src={vietQrUrl}
                  alt="Mã QR Chuyển khoản"
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to direct placeholder if external API fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <p className="text-xs text-[#77736B]">
                Mở ứng dụng Ngân hàng (App Banking) bất kỳ và quét mã để tự động điền STK, Số tiền và Nội dung.
              </p>
            </div>

            {/* Property Summary */}
            {property && (
              <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 space-y-4">
                <h4 className="font-serif text-sm font-semibold text-[#F8F5EE]">
                  Bất Động Sản Đang Giữ Chỗ
                </h4>
                <div className="flex gap-3 items-center">
                  <img
                    src={property.thumbnail}
                    alt={property.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-xs font-semibold text-[#F8F5EE] line-clamp-2">
                      {property.title}
                    </p>
                    <p className="text-[11px] text-[#D4AF37] font-mono mt-1">
                      {property.propertyCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
