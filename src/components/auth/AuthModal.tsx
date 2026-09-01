import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen?: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  initialMode,
  onClose: propOnClose,
}) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
  } = useAuth();

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const handleClose = propOnClose || closeAuthModal;
  const currentMode = initialMode || authModalMode;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentMode === 'login') {
        await loginWithEmail(email, password);
      } else if (currentMode === 'register') {
        await registerWithEmail(fullName, email, password, phoneNumber);
      } else if (currentMode === 'forgot') {
        await resetPassword(email);
      }
    } catch (err) {
      // Handled in auth context toast
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Đăng Nhập Thành Viên VIP',
    register: 'Gia Nhập AURA Luxury',
    forgot: 'Khôi Phục Mật Khẩu',
  };

  const subtitles = {
    login: 'Truy cập danh mục BĐS riêng tư, quản lý giao dịch và lưu tin yêu thích.',
    register: 'Tạo tài khoản để nhận thông tin độc quyền về các dự án triệu đô sắp ra mắt.',
    forgot: 'Nhập địa chỉ email đăng ký để nhận liên kết đặt lại mật khẩu bảo mật.',
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={titles[currentMode]}
      subtitle={subtitles[currentMode]}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Google Sign-in Button */}
        {currentMode !== 'forgot' && (
          <div>
            <button
              id="google-signin-btn"
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#161616] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 hover:bg-[#1a1a1a] text-[#F8F5EE] text-sm font-medium transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-[#D4AF37]/15 w-full" />
              <span className="bg-[#111111] px-3 text-xs text-[#77736B] uppercase tracking-wider">
                hoặc email
              </span>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          )}

          {currentMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0988 888 888"
                  className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Địa chỉ Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          {currentMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7]">
                  Mật khẩu *
                </label>
                {currentMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#77736B]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161616] border border-[#D4AF37]/20 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F8F5EE] placeholder-[#77736B] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gold-gradient text-[#050505] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {currentMode === 'login'
                    ? 'Đăng Nhập Ngay'
                    : currentMode === 'register'
                    ? 'Hoàn Tất Đăng Ký'
                    : 'Gửi Email Khôi Phục'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="pt-2 text-center text-xs text-[#B8B3A7]">
          {currentMode === 'login' && (
            <p>
              Chưa có tài khoản thành viên?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-[#F2D675] font-semibold hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          )}

          {currentMode === 'register' && (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-[#F2D675] font-semibold hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          )}

          {currentMode === 'forgot' && (
            <p>
              Nhớ mật khẩu?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-[#F2D675] font-semibold hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
