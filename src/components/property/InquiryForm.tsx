import React, { useState } from 'react';
import { Send, Shield, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Property } from '../../types';
import { submitInquiry } from '../../services/propertyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { trackInquirySubmit } from '../../lib/analytics';

interface InquiryFormProps {
  property: Property;
  onSuccess?: () => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ property, onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState(
    `Kính gửi AURA Luxury, tôi quan tâm đến bất động sản "${property.title}" (Mã: ${property.propertyCode}). Vui lòng sắp xếp chuyên viên tư vấn chi tiết và lịch tham quan thực tế giúp tôi.`
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      error('Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).');
      return;
    }
    if (!phone || phone.trim().length < 8) {
      error('Vui lòng nhập số điện thoại liên hệ hợp lệ.');
      return;
    }
    if (!email || !email.includes('@')) {
      error('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (message.length > 1000) {
      error('Lời nhắn không được vượt quá 1000 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        userId: currentUser?.uid || null,
        propertyId: property.id,
        propertyTitle: property.title,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        source: 'property_detail',
      });

      success('Cảm ơn bạn. Chuyên viên tư vấn sẽ liên hệ trong thời gian sớm nhất.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      error(err.message || 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#111111] p-6 rounded-[20px] border border-[#D4AF37]/20 shadow-xl">
      <div className="border-b border-[#D4AF37]/15 pb-4 mb-4">
        <h4 className="font-serif text-lg font-bold text-[#F8F5EE] tracking-wide">
          Yêu Cầu Tư Vấn Đặc Quyền
        </h4>
        <p className="text-xs text-[#B8B3A7] mt-1">
          Nhận báo giá chi tiết, sơ đồ mặt bằng và hồ sơ pháp lý bảo mật.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
          Họ và tên quý khách *
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Hoàng Long"
            className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
            Số điện thoại *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0988 888 999"
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1">
          Nội dung cần hỗ trợ
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl p-3 text-xs sm:text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-50 cursor-pointer"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Gửi Yêu Cầu Tư Vấn Ngay</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-[#77736B] pt-1">
        <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Thông tin của quý khách được cam kết bảo mật 100%</span>
      </div>
    </form>
  );
};
