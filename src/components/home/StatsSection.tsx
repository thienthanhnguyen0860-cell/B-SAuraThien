import React from 'react';
import { useSite } from '../../context/SiteContext';
import { formatNumber } from '../../lib/utils';

export const StatsSection: React.FC = () => {
  const { siteSettings } = useSite();
  const stats = siteSettings.stats || {
    properties: 180,
    customers: 2450,
    projects: 35,
    yearsExperience: 15,
  };

  const statItems = [
    { value: `${formatNumber(stats.properties)}+`, label: 'Bất Động Sản Tuyển Chọn' },
    { value: `${formatNumber(stats.customers)}+`, label: 'Khách Hàng Thượng Lưu' },
    { value: `${formatNumber(stats.projects)}+`, label: 'Dự Án Đẳng Cấp' },
    { value: `${stats.yearsExperience} Năm`, label: 'Kinh Nghiệm Phục Vụ' },
  ];

  return (
    <section className="py-16 bg-[#0B0B0B] border-t border-[#D4AF37]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statItems.map((item, i) => (
            <div key={i} className="space-y-2 p-4 rounded-2xl bg-[#111111]/50 border border-white/5">
              <div className="font-serif text-3xl sm:text-5xl font-bold text-gold-gradient tracking-tight">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-[#B8B3A7] uppercase tracking-wider font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
