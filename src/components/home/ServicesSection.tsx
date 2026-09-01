import React from 'react';
import { Gem, ShieldCheck, Scale } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Gem className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Tuyển Chọn Bất Động Sản',
      description: 'Mỗi danh mục được thẩm định nghiêm ngặt về vị trí độc tôn, pháp lý minh bạch và giá trị gia tăng bền vững qua nhiều thế hệ.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Tư Vấn Riêng Tư & Bảo Mật',
      description: 'Quy trình tiếp cận thông tin khép kín theo tiêu chuẩn Private Client, bảo đảm quyền riêng tư tuyệt đối cho các giao dịch quy mô lớn.',
    },
    {
      icon: <Scale className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Hỗ Trợ Giao Dịch Toàn Diện',
      description: 'Đội ngũ chuyên gia pháp lý và cố vấn tài chính đồng hành xuyên suốt từ bước đặt cọc giữ chỗ đến khi hoàn tất thủ tục sang tên sở hữu.',
    },
  ];

  return (
    <section className="py-20 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            CHUẨN MỰC PHỤC VỤ TINH HOA
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#F8F5EE]">
            Đặc Quyền Dịch Vụ AURA Luxury
          </h2>
          <p className="text-sm text-[#B8B3A7] leading-relaxed">
            Chúng tôi không chỉ môi giới bất động sản, chúng tôi tạo lập giải pháp đầu tư và kiến tạo không gian sống xứng tầm vị thế.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-8 space-y-5 hover:border-[#D4AF37]/45 hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#D4AF37]/25 flex items-center justify-center shadow-lg shadow-[#D4AF37]/5">
                {s.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F8F5EE]">
                {s.title}
              </h3>
              <p className="text-sm text-[#B8B3A7] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
