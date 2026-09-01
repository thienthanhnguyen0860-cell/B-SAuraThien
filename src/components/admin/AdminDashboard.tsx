import React, { useState, useMemo } from 'react';
import {
  Building,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Property, Reservation, Inquiry } from '../../types';
import { formatCurrency, formatFullVND, formatNumber } from '../../lib/utils';

interface AdminDashboardProps {
  properties: Property[];
  reservations: Reservation[];
  inquiries: Inquiry[];
  onNavigateMenu: (menu: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  properties,
  reservations,
  inquiries,
  onNavigateMenu,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');

  // Metrics
  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === 'available').length;
  const reservedProperties = properties.filter((p) => p.status === 'reserved').length;
  const pendingReservations = reservations.filter((r) => r.status === 'pending').length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  const totalTransactionValue = reservations
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + (r.depositAmount || 0), 0);

  // Generate chart data based on real inquiries & reservations
  const chartData = useMemo(() => {
    const daysCount = Number(timeRange);
    const data = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      const leadCount = inquiries.filter((inq) => {
        const itemDate = new Date(inq.createdAt?.toDate ? inq.createdAt.toDate() : inq.createdAt || 0);
        return itemDate >= dayStart && itemDate <= dayEnd;
      }).length;

      const resCount = reservations.filter((res) => {
        const itemDate = new Date(res.createdAt?.toDate ? res.createdAt.toDate() : res.createdAt || 0);
        return itemDate >= dayStart && itemDate <= dayEnd;
      }).length;

      data.push({
        name: dayLabel,
        leads: leadCount,
        reservations: resCount,
      });
    }

    return data;
  }, [inquiries, reservations, timeRange]);

  const cards = [
    {
      title: 'Tổng Bất Động Sản',
      value: totalProperties,
      subtitle: `${availableProperties} đang mở bán`,
      icon: <Building className="w-5 h-5 text-[#D4AF37]" />,
      actionMenu: 'properties',
    },
    {
      title: 'BĐS Đang Bán',
      value: availableProperties,
      subtitle: 'Khả dụng trên sàn',
      icon: <TrendingUp className="w-5 h-5 text-[#22C55E]" />,
      actionMenu: 'properties',
    },
    {
      title: 'BĐS Đã Giữ Chỗ',
      value: reservedProperties,
      subtitle: 'Đang khóa giao dịch',
      icon: <CheckCircle className="w-5 h-5 text-[#F59E0B]" />,
      actionMenu: 'properties',
    },
    {
      title: 'Giao Dịch Chờ Duyệt',
      value: pendingReservations,
      subtitle: 'Cần đối soát tiền cọc',
      icon: <Clock className="w-5 h-5 text-[#EF4444]" />,
      highlight: pendingReservations > 0,
      actionMenu: 'reservations',
    },
    {
      title: 'Lead Tư Vấn Mới',
      value: newInquiries,
      subtitle: 'Khách hàng VIP cần gọi',
      icon: <MessageSquare className="w-5 h-5 text-[#3B82F6]" />,
      actionMenu: 'inquiries',
    },
    {
      title: 'Tổng Tiền Đã Cọc',
      value: formatCurrency(totalTransactionValue),
      subtitle: 'Từ các giao dịch đã duyệt',
      icon: <DollarSign className="w-5 h-5 text-[#F2D675]" />,
      actionMenu: 'reservations',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Bảng Điều Khiển Tổng Quan
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B3A7] mt-0.5">
            Theo dõi tình trạng niêm yết, dòng tiền đặt cọc và danh sách khách hàng thượng lưu.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center bg-[#111111] p-1 rounded-xl border border-[#D4AF37]/20">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-gold-gradient text-black font-bold shadow-md'
                  : 'text-[#B8B3A7] hover:text-[#F8F5EE]'
              }`}
            >
              {range} Ngày
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => onNavigateMenu(card.actionMenu)}
            className={`p-6 rounded-[20px] bg-[#111111] border transition-all cursor-pointer hover:-translate-y-1 shadow-lg ${
              card.highlight
                ? 'border-[#EF4444]/50 shadow-[#EF4444]/10'
                : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/45'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#77736B]">
                {card.title}
              </span>
              <div className="p-2.5 rounded-xl bg-[#161616] border border-white/5">
                {card.icon}
              </div>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EE] mt-3">
              {card.value}
            </div>
            <p className="text-xs text-[#B8B3A7] mt-1 flex items-center justify-between">
              <span>{card.subtitle}</span>
              <span className="text-[#D4AF37] font-semibold text-[11px]">Chi tiết →</span>
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F8F5EE]">
              Xu Hướng Tiếp Nhận Lead & Giao Dịch Giữ Chỗ
            </h3>
            <p className="text-xs text-[#B8B3A7]">
              Biểu đồ phân tích tương tác người dùng theo khung thời gian {timeRange} ngày gần nhất.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <span className="text-[#F8F5EE]">Yêu Cầu Tư Vấn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              <span className="text-[#F8F5EE]">Giữ Chỗ Mới</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="greenGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#26231c" />
              <XAxis dataKey="name" stroke="#77736B" fontSize={11} tickLine={false} />
              <YAxis stroke="#77736B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#D4AF37',
                  borderRadius: '12px',
                  color: '#F8F5EE',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                name="Yêu cầu tư vấn"
                stroke="#D4AF37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#goldGradientArea)"
              />
              <Area
                type="monotone"
                dataKey="reservations"
                name="Giữ chỗ"
                stroke="#22C55E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#greenGradientArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
