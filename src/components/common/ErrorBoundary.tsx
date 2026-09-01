import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorReporter } from '../../lib/errorReporting';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorReporter.captureException(error, {
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 bg-[#111111] p-8 sm:p-10 rounded-[28px] border border-[#EF4444]/30 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] mx-auto shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF4444]">
                HỆ THỐNG GẶP SỰ CỐ
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
                Đã Có Lỗi Bất Ngờ Xảy Ra
              </h2>
              <p className="text-xs text-[#B8B3A7] leading-relaxed">
                Đã xảy ra lỗi trong quá trình kết xuất giao diện. Xin vui lòng làm mới trang hoặc quay trở lại trang chủ.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử Lại</span>
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#161616] text-[#B8B3A7] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
