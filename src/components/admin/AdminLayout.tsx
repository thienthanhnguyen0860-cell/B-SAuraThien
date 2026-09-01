import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  Building2,
  MessageSquare,
  CreditCard,
  Users,
  UserCheck,
  Settings,
  Globe,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Property, Reservation, Inquiry, Project, Agent, UserProfile } from '../../types';
import { getProperties, getProjects, getAgents, getAllUsersAdmin, getInquiriesAdmin, getReservationsAdmin } from '../../services/adminService';
import { AdminDashboard } from './AdminDashboard';
import { AdminProperties } from './AdminProperties';
import { AdminPropertyForm } from './AdminPropertyForm';
import { AdminProjects } from './AdminProjects';
import { AdminInquiries } from './AdminInquiries';
import { AdminReservations } from './AdminReservations';
import { AdminUsers } from './AdminUsers';
import { AdminAgents } from './AdminAgents';
import { AdminPaymentSettings } from './AdminPaymentSettings';
import { AdminSiteSettings } from './AdminSiteSettings';
import { AdminLogs } from './AdminLogs';

interface AdminLayoutProps {
  onNavigate: (path: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, logout } = useAuth();

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Admin Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pList, projList, inqList, resList, uList, aList] = await Promise.all([
        getProperties(),
        getProjects(),
        getInquiriesAdmin(),
        getReservationsAdmin(),
        getAllUsersAdmin(),
        getAgents(),
      ]);
      setProperties(pList);
      setProjects(projList);
      setInquiries(inqList);
      setReservations(resList);
      setUsers(uList);
      setAgents(aList);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddNewProperty = () => {
    setEditingProperty(null);
    setActiveMenu('property_form');
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setActiveMenu('property_form');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'properties',
      label: 'Bất động sản',
      icon: <Building className="w-4 h-4" />,
      badge: properties.length,
    },
    {
      id: 'reservations',
      label: 'Giao dịch giữ chỗ',
      icon: <CreditCard className="w-4 h-4" />,
      badge: reservations.filter((r) => r.status === 'pending').length,
      badgeColor: 'bg-[#EF4444] text-white',
    },
    {
      id: 'inquiries',
      label: 'Lead & Yêu cầu',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: inquiries.filter((i) => i.status === 'new').length,
      badgeColor: 'bg-[#3B82F6] text-white',
    },
    { id: 'projects', label: 'Dự án đẳng cấp', icon: <Building2 className="w-4 h-4" /> },
    { id: 'users', label: 'Người dùng & Quyền', icon: <Users className="w-4 h-4" /> },
    { id: 'agents', label: 'Chuyên viên tư vấn', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'payment_settings', label: 'Cấu hình ngân hàng', icon: <Settings className="w-4 h-4" /> },
    { id: 'site_settings', label: 'Cấu hình Website', icon: <Globe className="w-4 h-4" /> },
    { id: 'logs', label: 'Nhật ký kiểm toán', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8F5EE] flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111111] border-b border-[#D4AF37]/20 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-gold-gradient">AURA ADMIN</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#161616] text-[#D4AF37]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-50 bg-[#0B0B0B] p-6' : 'hidden md:flex'
        } md:w-64 lg:w-72 bg-[#0B0B0B] border-r border-[#D4AF37]/20 flex-col justify-between p-5 shrink-0 min-h-screen sticky top-0`}
      >
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h1 className="font-serif text-lg font-bold tracking-wider text-gold-gradient">
                  AURA PORTAL
                </h1>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#77736B] mt-0.5">
                Private Admin Center
              </p>
            </div>

            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-2 rounded-lg bg-[#161616] text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Quick Box */}
          <div className="bg-[#111111] p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-gradient text-black flex items-center justify-center font-serif font-bold text-sm">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F8F5EE] truncate">{userProfile?.displayName || 'Administrator'}</p>
              <p className="text-[10px] text-[#77736B] truncate">{currentUser?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeMenu === item.id || (activeMenu === 'property_form' && item.id === 'properties')
                    ? 'bg-gold-gradient text-black font-bold shadow-md shadow-[#D4AF37]/15'
                    : 'text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || (activeMenu === item.id ? 'bg-black text-[#F2D675]' : 'bg-[#161616] text-[#D4AF37]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Links */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#B8B3A7] hover:text-[#F2D675] hover:bg-[#161616] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Về Website Chính</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {activeMenu === 'dashboard' && (
          <AdminDashboard
            properties={properties}
            reservations={reservations}
            inquiries={inquiries}
            onNavigateMenu={(menu) => setActiveMenu(menu)}
          />
        )}

        {activeMenu === 'properties' && (
          <AdminProperties
            properties={properties}
            onAddNew={handleAddNewProperty}
            onEdit={handleEditProperty}
            onRefresh={fetchAdminData}
            onNavigate={onNavigate}
          />
        )}

        {activeMenu === 'property_form' && (
          <AdminPropertyForm
            initialProperty={editingProperty}
            projects={projects}
            onBack={() => setActiveMenu('properties')}
            onSaved={() => {
              fetchAdminData();
              setActiveMenu('properties');
            }}
          />
        )}

        {activeMenu === 'reservations' && (
          <AdminReservations
            reservations={reservations}
            properties={properties}
            onRefresh={fetchAdminData}
          />
        )}

        {activeMenu === 'inquiries' && (
          <AdminInquiries
            inquiries={inquiries}
            agents={agents}
            onRefresh={fetchAdminData}
          />
        )}

        {activeMenu === 'projects' && (
          <AdminProjects
            projects={projects}
            onRefresh={fetchAdminData}
          />
        )}

        {activeMenu === 'users' && (
          <AdminUsers
            users={users}
            onRefresh={fetchAdminData}
          />
        )}

        {activeMenu === 'agents' && (
          <AdminAgents
            agents={agents}
            onRefresh={fetchAdminData}
          />
        )}

        {activeMenu === 'payment_settings' && <AdminPaymentSettings />}

        {activeMenu === 'site_settings' && <AdminSiteSettings />}

        {activeMenu === 'logs' && <AdminLogs />}
      </main>
    </div>
  );
};
