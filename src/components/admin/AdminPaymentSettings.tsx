import React, { useState } from 'react';
import { Save, CreditCard, ShieldCheck, QrCode, AlertCircle } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentSettings } from '../../types';
import { formatFullVND } from '../../lib/utils';
import { updatePaymentSettingsAdmin } from '../../services/adminService';

export const AdminPaymentSettings: React.FC = () => {
  const { paymentSettings, refreshSettings } = useSite();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [bankName, setBankName] = useState(paymentSettings.bankName);
  const [bankCode, setBankCode] = useState(paymentSettings.bankCode || 'TCB');
  const [accountName, setAccountName] = useState(paymentSettings.accountName);
  const [accountNumber, setAccountNumber] = useState(paymentSettings.accountNumber);
  const [branch, setBranch] = useState(paymentSettings.branch);
  const [qrTemplate, setQrTemplate] = useState(paymentSettings.qrTemplate);
  const [reservationDepositDefault, setReservationDepositDefault] = useState(
    paymentSettings.reservationDepositDefault
  );
  const [reservationExpiryMinutes, setReservationExpiryMinutes] = useState(
    paymentSettings.reservationExpiryMinutes
  );
  const [paymentInstructions, setPaymentInstructions] = useState(
    paymentSettings.paymentInstructions
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const payload: PaymentSettings = {
        bankName: bankName.trim(),
        bankCode: bankCode.trim().toUpperCase(),
        accountName: accountName.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        branch: branch.trim(),
        qrTemplate,
        reservationDepositDefault: Number(reservationDepositDefault),
        reservationExpiryMinutes: Number(reservationExpiryMinutes),
        paymentInstructions: paymentInstructions.trim(),
      };

      await updatePaymentSettingsAdmin(payload, currentUser.email || 'admin');
      await refreshSettings();
      success('Đã lưu cấu hình tài khoản ngân hàng và chính sách giữ chỗ thành công.');
    } catch (err: any) {
      error('Lỗi khi lưu cấu hình thanh toán.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Cấu Hình Ngân Hàng & Chuyển Khoản Giữ Chỗ
          </h2>
          <p className="text-xs text-[#B8B3A7] mt-0.5">
            Thông tin này được hiển thị tự động trên trang /checkout và mã QR VietQR khi khách hàng giữ chỗ.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
        </button>
      </div>

      {/* Bank Account Info Card */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>1. Tài Khoản Ngân Hàng Thụ Hưởng</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tên Ngân Hàng *
            </label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="VD: Techcombank - Ngân Hàng Kỹ Thương Việt Nam"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mã Ngân Hàng VietQR (Bank Code) *
            </label>
            <input
              type="text"
              required
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="TCB, VCB, MB, ACB, VPB, ICB..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#F2D675] focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Số Tài Khoản *
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="19038899888888"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-[#F2D675] focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tên Chủ Tài Khoản (Không dấu) *
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="CONG TY CP BAT DONG SAN AURA LUXURY"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm uppercase text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Chi Nhánh Mở Tài Khoản
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Chi nhánh Hội Sở - TP. Hồ Chí Minh"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* Deposit Policy & Expiration */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>2. Chính Sách Đặt Cọc & Thời Hạn Giữ Chỗ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Số Tiền Đặt Cọc Mặc Định (VND) *
            </label>
            <input
              type="number"
              required
              value={reservationDepositDefault}
              onChange={(e) => setReservationDepositDefault(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#F2D675] focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-[#77736B] mt-1">
              Quy đổi: {formatFullVND(reservationDepositDefault)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Thời Gian Hết Hạn Giữ Quyền Ưu Tiên (Phút) *
            </label>
            <input
              type="number"
              required
              value={reservationExpiryMinutes}
              onChange={(e) => setReservationExpiryMinutes(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-[#77736B] mt-1">
              Tương đương: {Math.round(reservationExpiryMinutes / 60)} Giờ sau khi tạo yêu cầu
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Lời Dặn Dò / Hướng Dẫn Chuyển Khoản
            </label>
            <textarea
              rows={3}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
