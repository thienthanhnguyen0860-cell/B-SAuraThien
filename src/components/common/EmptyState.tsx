import React from 'react';
import { SearchX, ArrowRight, Heart, ReceiptText, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: 'search' | 'favorites' | 'reservations' | 'inquiries' | 'general';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy kết quả phù hợp',
  description = 'Hãy thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc để xem các bất động sản cao cấp khác.',
  actionText,
  onAction,
  icon,
  variant = 'general',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'favorites':
        return <Heart className="w-8 h-8 text-[#D4AF37]" />;
      case 'reservations':
        return <ReceiptText className="w-8 h-8 text-[#D4AF37]" />;
      case 'inquiries':
        return <MessageSquare className="w-8 h-8 text-[#D4AF37]" />;
      case 'search':
      default:
        return <SearchX className="w-8 h-8 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[#111111]/80 border border-[#D4AF37]/18 rounded-[24px] max-w-xl mx-auto my-8 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-[#1c1913] border border-[#D4AF37]/30 flex items-center justify-center mb-5 shadow-lg shadow-[#D4AF37]/5">
        {icon || getDefaultIcon()}
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EE] mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#B8B3A7] max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
