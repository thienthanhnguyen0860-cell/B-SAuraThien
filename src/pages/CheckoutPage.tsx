import React, { useState, useEffect } from 'react';
import { CheckoutView } from '../components/checkout/CheckoutView';
import { Reservation, Property } from '../types';
import { getReservationByCode } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface CheckoutPageProps {
  reservationCode: string;
  allProperties: Property[];
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  reservationCode,
  allProperties,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadReservation = async () => {
      if (!reservationCode) {
        setErrorMsg('Không tìm thấy mã giao dịch giữ chỗ.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getReservationByCode(reservationCode);
        if (!data) {
          setErrorMsg(`Không tìm thấy thông tin giao dịch với mã ${reservationCode}.`);
        } else {
          setReservation(data);
        }
      } catch (err: any) {
        setErrorMsg('Lỗi khi tải dữ liệu giao dịch giữ chỗ.');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [reservationCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#D4AF37]">
            Đang khởi tạo cổng thanh toán & mã QR...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !reservation) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <SEOHead title="Thanh Toán Giữ Chỗ | AURA LUXURY" noIndex />
        <div className="max-w-md w-full text-center space-y-6 bg-[#111111] p-8 rounded-[24px] border border-[#EF4444]/30 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 flex items-center justify-center mx-auto text-[#EF4444]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
              Giao Dịch Không Hợp Lệ
            </h2>
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              {errorMsg || 'Mã giữ chỗ không tồn tại hoặc đã hết hạn.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/properties')}
            className="w-full py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Danh Mục Bất Động Sản</span>
          </button>
        </div>
      </div>
    );
  }

  const linkedProperty = allProperties.find((p) => p.id === reservation.propertyId);

  return (
    <div className="min-h-screen bg-[#050505] py-10 sm:py-16">
      <SEOHead title={`Thanh Toán Giữ Chỗ #${reservation.reservationCode} | AURA LUXURY`} noIndex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutView
          reservation={reservation}
          property={linkedProperty}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
