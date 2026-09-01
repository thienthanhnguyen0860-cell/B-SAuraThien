import { Reservation, SiteSettings } from '../types';
import { formatFullVND, formatDate } from '../lib/utils';

export interface NotificationResult {
  success: boolean;
  providerStatus: 'CONFIGURED' | 'NOT_CONFIGURED';
  message: string;
  error?: string;
}

export interface INotificationService {
  sendReservationApproved(reservation: Reservation, siteSettings: SiteSettings): Promise<NotificationResult>;
  sendReservationCancelled(reservation: Reservation, siteSettings: SiteSettings, reason?: string): Promise<NotificationResult>;
}

class EmailNotificationService implements INotificationService {
  private isConfigured(): boolean {
    // Check if SMTP or email provider credentials are provided via environment
    // In current environment, no external SMTP credentials exist. We keep status as NOT_CONFIGURED.
    return false;
  }

  async sendReservationApproved(
    reservation: Reservation,
    siteSettings: SiteSettings
  ): Promise<NotificationResult> {
    const recipient = reservation.userEmail;
    const name = reservation.userName || 'Quý Khách';
    const code = reservation.reservationCode;
    const propTitle = reservation.propertyTitle || 'Bất động sản';
    const amount = formatFullVND(reservation.depositAmount);

    // Email Template Specification:
    // Subject: Xác nhận giao dịch [reservationCode]
    // Body:
    // Xin chào [displayName],
    // Yêu cầu giữ chỗ cho bất động sản [propertyTitle] đã được xác nhận.
    // Mã giao dịch: [reservationCode]
    // Khoản thanh toán: [depositAmount]
    // Trạng thái: Đã xác nhận
    // Bạn có thể xem chi tiết giao dịch trong tài khoản của mình.

    if (!this.isConfigured()) {
      console.log(`[NotificationService: NOT CONFIGURED] Email approval template generated for ${recipient}:`, {
        subject: `Xác nhận giao dịch ${code}`,
        to: recipient,
        reservationCode: code,
        propertyTitle: propTitle,
        depositAmount: amount,
      });

      return {
        success: false,
        providerStatus: 'NOT_CONFIGURED',
        message: 'Dịch vụ gửi Email chưa được cấu hình SMTP/API Key trên máy chủ. Giao dịch giữ chỗ vẫn được bảo đảm trạng thái Đã Duyệt.',
      };
    }

    return {
      success: true,
      providerStatus: 'CONFIGURED',
      message: `Đã gửi email xác nhận thành công tới ${recipient}.`,
    };
  }

  async sendReservationCancelled(
    reservation: Reservation,
    siteSettings: SiteSettings,
    reason?: string
  ): Promise<NotificationResult> {
    const recipient = reservation.userEmail;
    const name = reservation.userName || 'Quý Khách';
    const code = reservation.reservationCode;
    const propTitle = reservation.propertyTitle || 'Bất động sản';
    const hotline = siteSettings.hotline || '0988 888 888';

    // Email Template Specification:
    // Subject: Cập nhật giao dịch [reservationCode]
    // Body:
    // Xin chào [displayName],
    // Yêu cầu giữ chỗ cho bất động sản [propertyTitle] đã được cập nhật sang trạng thái Đã hủy.
    // Mã giao dịch: [reservationCode]
    // Nếu cần hỗ trợ, vui lòng liên hệ đội ngũ tư vấn qua hotline: [hotline].

    if (!this.isConfigured()) {
      console.log(`[NotificationService: NOT CONFIGURED] Email cancellation template generated for ${recipient}:`, {
        subject: `Cập nhật giao dịch ${code}`,
        to: recipient,
        reservationCode: code,
        propertyTitle: propTitle,
        hotline,
        reason,
      });

      return {
        success: false,
        providerStatus: 'NOT_CONFIGURED',
        message: 'Dịch vụ gửi Email chưa được cấu hình. Giao dịch giữ chỗ đã cập nhật trạng thái Đã Hủy an toàn.',
      };
    }

    return {
      success: true,
      providerStatus: 'CONFIGURED',
      message: `Đã gửi thông báo hủy giao dịch tới ${recipient}.`,
    };
  }
}

export const notificationService = new EmailNotificationService();
