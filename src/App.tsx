import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ConsultationModal } from './components/common/ConsultationModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotFound } from './components/common/NotFound';

// Pages
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AccountPage } from './pages/AccountPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';

// Data & Services
import { Property, Project, Agent, PropertyFilterParams } from './types';
import { getProperties, getProjects, getAgents, seedInitialDatabaseIfNeeded } from './services/propertyService';
import { initGoogleAnalytics, trackPageView } from './lib/analytics';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';

function AppContent() {
  const { authModalState, closeAuthModal, isSuperAdmin, userProfile } = useAuth();
  const { siteSettings } = useSite();

  // Initialize GA when ID is configured in siteSettings
  useEffect(() => {
    if (siteSettings?.analytics?.googleAnalyticsId) {
      initGoogleAnalytics(siteSettings.analytics.googleAnalyticsId);
    }
  }, [siteSettings?.analytics?.googleAnalyticsId]);

  // State Management
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState<string>(window.location.search || '');

  // Track page view on route transitions
  useEffect(() => {
    trackPageView(currentPath);
  }, [currentPath]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // VIP Consultation Modal
  const [consultationOpen, setConsultationOpen] = useState(false);

  // Active filter params passed to properties page
  const [filterParams, setFilterParams] = useState<PropertyFilterParams>({});

  // Show Back To Top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Initial Seed & Load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await seedInitialDatabaseIfNeeded();
        const [propList, projList, agentList] = await Promise.all([
          getProperties(),
          getProjects(),
          getAgents(),
        ]);
        setProperties(propList);
        setProjects(projList);
        setAgents(agentList);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Listen to popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll listener for back to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Helper
  const navigate = (pathWithQuery: string) => {
    const [path, search] = pathWithQuery.split('?');
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(path || '/');
    setCurrentSearch(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: PropertyFilterParams) => {
    setFilterParams(params);
    navigate('/properties');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Resolution
  const isAdminRoute = currentPath.startsWith('/admin');

  // Check if detail route: `/properties/:id`, `/properties/:slug`, `/property/:id`, or `/property/:slug`
  let propertyDetailId: string | null = null;
  if (currentPath.startsWith('/properties/') && currentPath !== '/properties') {
    propertyDetailId = currentPath.replace('/properties/', '');
  } else if (currentPath.startsWith('/property/') && currentPath !== '/property') {
    propertyDetailId = currentPath.replace('/property/', '');
  }

  // Check if checkout route: `/checkout` or `/checkout/:reservationCode`
  let checkoutCode = '';
  if (currentPath.startsWith('/checkout')) {
    const parts = currentPath.split('/');
    if (parts[2]) {
      checkoutCode = parts[2];
    } else {
      const urlParams = new URLSearchParams(currentSearch);
      checkoutCode = urlParams.get('code') || '';
    }
  }

  // Find Property for Detail
  const selectedProperty = propertyDetailId
    ? properties.find(
        (p) => p.id === propertyDetailId || p.slug === propertyDetailId
      )
    : null;

  // Render Routed Page Component
  const renderCurrentPage = () => {
    if (isAdminRoute) {
      return <AdminPage onNavigate={navigate} />;
    }

    if (propertyDetailId) {
      if (loading) {
        return (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        );
      }
      if (!selectedProperty) {
        return (
          <NotFound
            title="Không Tìm Thấy Bất Động Sản"
            message="Bất động sản quý khách tìm kiếm không tồn tại hoặc đã được gỡ khỏi danh mục niêm yết."
            onNavigate={navigate}
          />
        );
      }
      return (
        <PropertyDetailPage
          property={selectedProperty}
          allProperties={properties}
          agent={agents[0] || null}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/properties') {
      return (
        <PropertiesPage
          properties={properties}
          initialFilters={filterParams}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/projects') {
      return (
        <ProjectsPage
          projects={projects}
          properties={properties}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/checkout')) {
      return (
        <CheckoutPage
          reservationCode={checkoutCode}
          allProperties={properties}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/account') {
      return (
        <AccountPage
          allProperties={properties}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          properties={properties}
          projects={projects}
          loadingProperties={loading}
          onNavigate={navigate}
          onSearch={handleHeroSearch}
          onOpenConsultation={() => setConsultationOpen(true)}
        />
      );
    }

    return (
      <NotFound
        title="Trang Không Tồn Tại (404)"
        message="Địa chỉ đường dẫn quý khách vừa truy cập không tồn tại hoặc đã được di chuyển."
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8F5EE] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Hide Navbar & Footer on Admin for clean full-screen management UI */}
      {!isAdminRoute && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenConsultation={() => setConsultationOpen(true)}
        />
      )}

      {/* Main Page Content with Error Boundary */}
      <main className="flex-1">
        <ErrorBoundary onReset={() => navigate('/')}>
          {renderCurrentPage()}
        </ErrorBoundary>
      </main>

      {/* Footer on Client Pages */}
      {!isAdminRoute && (
        <Footer
          onNavigate={navigate}
          onOpenConsultation={() => setConsultationOpen(true)}
        />
      )}

      {/* Floating Action Buttons (Zalo, Phone & Back to Top) with safe area */}
      {!isAdminRoute && (
        <div className="fixed bottom-6 right-5 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto pb-safe">
          {/* Zalo Direct Chat */}
          <a
            href={`https://zalo.me/${(siteSettings.hotline || '0988888888').replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold-gradient text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 min-h-[44px] min-w-[44px]"
            title="Chat Zalo với Chuyên Viên Concierge"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>

          {/* Hotline Call */}
          <a
            href={`tel:${siteSettings.hotline || '0988888888'}`}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#161616] border border-[#D4AF37]/50 text-[#F2D675] flex items-center justify-center shadow-2xl hover:bg-[#D4AF37] hover:text-black hover:scale-110 transition-all duration-300 min-h-[44px] min-w-[44px]"
            title={`Hotline VIP: ${siteSettings.hotline}`}
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {/* Scroll to Top */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#111111]/90 border border-white/20 text-[#B8B3A7] hover:text-[#F8F5EE] flex items-center justify-center shadow-lg hover:bg-[#222] transition-all cursor-pointer min-h-[40px] min-w-[40px]"
              title="Về đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalState?.isOpen}
        initialMode={authModalState?.mode}
        onClose={closeAuthModal}
      />

      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SiteProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SiteProvider>
    </ToastProvider>
  );
}
