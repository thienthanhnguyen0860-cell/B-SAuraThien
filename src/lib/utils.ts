import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, unit: string = 'VND'): string {
  if (!amount || amount === 0) return 'Thoả thuận';
  
  if (unit === 'negotiable') return 'Thương lượng';

  if (unit === 'VND/month') {
    if (amount >= 1_000_000_000) {
      const billions = (amount / 1_000_000_000).toFixed(1).replace('.0', '');
      return `${billions} Tỷ / tháng`;
    }
    const millions = (amount / 1_000_000).toFixed(0);
    return `${millions} Triệu / tháng`;
  }

  if (amount >= 1_000_000_000) {
    const billions = (amount / 1_000_000_000).toFixed(1).replace('.0', '');
    return `${billions} Tỷ`;
  }

  if (amount >= 1_000_000) {
    const millions = (amount / 1_000_000).toFixed(0);
    return `${millions} Triệu`;
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatFullVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  let date: Date;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date();
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateReservationCode(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RS${year}${month}${day}${random}`;
}

export function generatePropertyCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `LUX-${randomNum}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const PROPERTY_TYPES = [
  { value: 'villa', label: 'Biệt Thự Đơn Lập / Song Lập' },
  { value: 'penthouse', label: 'Penthouse & Sky Villa' },
  { value: 'apartment', label: 'Căn Hộ Hạng Sang' },
  { value: 'townhouse', label: 'Nhà Phố Cao Cấp' },
  { value: 'shophouse', label: 'Shophouse Thương Mại' },
  { value: 'resort', label: 'BĐS Nghỉ Dưỡng' },
  { value: 'land', label: 'Đất Nền Dinh Thự' },
];

export const PROVINCES = [
  {
    name: 'TP. Hồ Chí Minh',
    districts: ['Quận 1', 'Quận 2 (TP. Thủ Đức)', 'Quận 7', 'Bình Thạnh', 'TP. Thủ Đức', 'Quận 3'],
  },
  {
    name: 'Hà Nội',
    districts: ['Tây Hồ', 'Hoàn Kiếm', 'Ba Đình', 'Cầu Giấy', 'Nam Từ Liêm', 'Long Biên'],
  },
  {
    name: 'Đà Nẵng',
    districts: ['Sơn Trà', 'Ngũ Hành Sơn', 'Hải Châu'],
  },
  {
    name: 'Khánh Hòa (Nha Trang)',
    districts: ['TP. Nha Trang', 'Cam Lâm', 'Vĩnh Nguyên'],
  },
  {
    name: 'Kiên Giang (Phú Quốc)',
    districts: ['TP. Phú Quốc', 'An Thới', 'Dương Đông'],
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    districts: ['TP. Vũng Tàu', 'Xuyên Mộc', 'Hồ Tràm'],
  },
];

export const AMENITIES_LIST = [
  'Hồ bơi vô cực riêng',
  'Sân vườn nhiệt đới',
  'Bến du thuyền riêng',
  'Thang máy kính riêng biệt',
  'Phòng xông hơi & Spa',
  'Phòng chiếu phim 4K gia đình',
  'Hầm rượu vang nhiệt độ chuẩn',
  'Hệ thống Smart Home chuẩn quốc tế',
  'Garage đỗ 4 siêu xe',
  'An ninh đa lớp 24/7 & Concierge VIP',
  'Sân golf mini trên sân thượng',
  'Phòng tập Gym riêng hiện đại',
  'Khu BBQ ngoài trời ven sông',
  'View panorama 360 độ ngắm hoàng hôn',
];

export const AMENITY_PRESETS = AMENITIES_LIST;

