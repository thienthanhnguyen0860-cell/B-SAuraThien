import React, { useState } from 'react';
import { Modal } from './Modal';
import { useToast } from '../../context/ToastContext';
import { useSite } from '../../context/SiteContext';
import { createInquiry } from '../../services/propertyService';
import { Send, Shield, PhoneCall } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error } = useToast();
  const { siteSettings } = useSite();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestType, setInterestType] = useState('Biệt Thự Đơn Lập / Ven Sông');
  const [budget, setBudget] = useState('50 - 100 Tỷ VND');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setSubmitting(true);
    try {
      await createInquiry({
        propertyId: 'general-consultation',
        propertyTitle: `Tư Vấn VIP: ${interestType} (Ngân sách: ${budget})`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || 'consultation@customer.vn',
        message: message.trim() || `Quan tâm phân khúc: ${interestType}. Ngân sách: ${budget}.`,
        source: 'Website - VIP Concierge Popup',
      });

      success('Yêu cầu tư vấn VIP của Quý Khách đã được tiếp nhận. Chuyên viên Concierge sẽ liên hệ trong ít phút.');
      onClose();
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      error('Không thể gửi yêu cầu lúc này. Quý khách vui lòng gọi trực tiếp hotline.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đặc Quyền Tư Vấn Private Client"
      subtitle="Dành riêng cho quý khách hàng tìm kiếm kiệt tác bất động sản thượng hạng"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="bg-[#161616] p-3.5 rounded-xl border border-[#D4AF37]/20 flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <p className="text-[11px] text-[#B8B3A7] leading-relaxed">
            Cam kết bảo mật danh tính tuyệt đối theo tiêu chuẩn ngân hàng Thụy Sĩ và giới thượng lưu.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
            Họ & Tên Quý Khách *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Hoàng Nam"
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
              Số Điện Thoại VIP *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0988 888 888"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
              Email (Không bắt buộc)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@luxury.vn"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F8F5EE] focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
              Dòng Sản Phẩm Quan Tâm
            </label>
            <select
              value={interestType}
              onChange={(e) => setInterestType(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
            >
              <option value="Biệt Thự Đơn Lập / Ven Sông">Biệt Thự Đơn Lập / Ven Sông</option>
              <option value="Penthouse / Duplex Thượng Đỉnh">Penthouse / Duplex Thượng Đỉnh</option>
              <option value="Dinh Thự Sinh Thái Nghỉ Dưỡng">Dinh Thự Sinh Thái Nghỉ Dưỡng</option>
              <option value="Shophouse Thương Mại Trung Tâm">Shophouse Thương Mại Trung Tâm</option>
              <option value="Tư Vấn Toàn Bộ Danh Mục VIP">Tư Vấn Toàn Bộ Danh Mục VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
              Khoản Đầu Tư Dự Kiến
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
            >
              <option value="30 - 50 Tỷ VND">30 - 50 Tỷ VND</option>
              <option value="50 - 100 Tỷ VND">50 - 100 Tỷ VND</option>
              <option value="100 - 200 Tỷ VND">100 - 200 Tỷ VND</option>
              <option value="Trên 200 Tỷ VND">Trên 200 Tỷ VND</option>
              <option value="Chưa xác định">Thương lượng theo bất động sản</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
            Yêu Cầu Đặc Biệt Hoặc Khung Giờ Tiện Liên Hệ
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="VD: Cần xem nhà vào cuối tuần, gửi thông tin qua Zalo trước..."
            className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Đang Gửi Yêu Cầu...' : 'Gửi Yêu Cầu Tư Vấn Ngay'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
