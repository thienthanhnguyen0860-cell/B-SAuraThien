import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, MessageSquare, Edit3, UserCheck, Calendar, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Inquiry, Agent } from '../../types';
import { formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { updateInquiryStatusAdmin } from '../../services/adminService';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  agents: Agent[];
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 20;

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  inquiries,
  agents,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail / Update Modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newStatus, setNewStatus] = useState<Inquiry['status']>('new');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inq.fullName.toLowerCase().includes(q) ||
        inq.phone.includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.propertyTitle && inq.propertyTitle.toLowerCase().includes(q));

      const matchStatus = filterStatus === 'all' || inq.status === filterStatus;
      const matchAgent =
        filterAgent === 'all' ||
        (filterAgent === 'unassigned' && !inq.assignedTo && !inq.assignedAgentId) ||
        inq.assignedTo === filterAgent ||
        inq.assignedAgentId === filterAgent;

      return matchSearch && matchStatus && matchAgent;
    });
  }, [inquiries, search, filterStatus, filterAgent]);

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInquiries, currentPage]);

  const handleOpenDetail = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setNewStatus(inq.status);
    setAssignedAgentId(inq.assignedAgentId || inq.assignedTo || '');
    setAdminNote(inq.adminNote || inq.notes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !currentUser || saving) return;

    setSaving(true);
    try {
      await updateInquiryStatusAdmin(
        selectedInquiry.id,
        newStatus,
        assignedAgentId || undefined,
        adminNote || undefined,
        currentUser.email || 'admin'
      );
      success('Đã cập nhật trạng thái yêu cầu tư vấn thành công.');
      setSelectedInquiry(null);
      onRefresh();
    } catch (err: any) {
      error('Lỗi khi cập nhật yêu cầu tư vấn.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      new: { label: 'Mới nhận', bg: 'bg-[#EF4444]/15 border-[#EF4444]/30', text: 'text-[#EF4444]' },
      contacted: { label: 'Đã liên hệ', bg: 'bg-[#3B82F6]/15 border-[#3B82F6]/30', text: 'text-[#3B82F6]' },
      qualified: { label: 'Tiềm năng', bg: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30', text: 'text-[#8B5CF6]' },
      viewing_scheduled: { label: 'Hẹn xem nhà', bg: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30', text: 'text-[#8B5CF6]' },
      negotiating: { label: 'Đang thương lượng', bg: 'bg-[#F59E0B]/15 border-[#F59E0B]/30', text: 'text-[#F59E0B]' },
      closed: { label: 'Đã chốt cọc', bg: 'bg-[#22C55E]/15 border-[#22C55E]/30', text: 'text-[#22C55E]' },
      cancelled: { label: 'Hủy bỏ', bg: 'bg-[#77736B]/20 border-white/10', text: 'text-[#B8B3A7]' },
      spam: { label: 'Spam / Rác', bg: 'bg-[#77736B]/20 border-white/10', text: 'text-[#77736B]' },
    };
    const s = map[status] || map.new;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${s.bg} ${s.text} whitespace-nowrap`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Lead & Yêu Cầu Tư Vấn ({inquiries.length})
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Theo dõi khách hàng tiềm năng, điều phối chuyên viên chăm sóc và ghi chú tiến độ giao dịch.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111111] p-4 rounded-2xl border border-[#D4AF37]/15 space-y-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, SĐT, Email hoặc Bất động sản..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">Tất cả trạng thái lead</option>
              <option value="new">Mới nhận (New)</option>
              <option value="contacted">Đã liên hệ (Contacted)</option>
              <option value="qualified">Tiềm năng (Qualified)</option>
              <option value="closed">Đã chốt (Closed)</option>
              <option value="spam">Spam / Rác (Spam)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterAgent}
              onChange={(e) => {
                setFilterAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">Tất cả chuyên viên</option>
              <option value="unassigned">Chưa phân công</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">BĐS Quan Tâm</th>
                <th className="p-4">Lời Nhắn & Nhu Cầu</th>
                <th className="p-4">Trạng Thái Lead</th>
                <th className="p-4">Chuyên Viên Phụ Trách</th>
                <th className="p-4">Thời Gian</th>
                <th className="p-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#77736B]">
                    Không tìm thấy yêu cầu tư vấn nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedList.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#161616]/50">
                    <td className="p-4">
                      <div className="font-semibold text-[#F8F5EE]">{inq.fullName}</div>
                      <div className="text-[11px] text-[#D4AF37] font-mono">{inq.phone}</div>
                      <div className="text-[10px] text-[#77736B]">{inq.email}</div>
                    </td>
                    <td className="p-4 max-w-[200px]">
                      <div className="font-semibold text-[#F8F5EE] truncate">{inq.propertyTitle || 'Tư vấn tổng quan'}</div>
                      <span className="text-[10px] text-[#77736B] capitalize">
                        Nguồn: {inq.source || 'Website'}
                      </span>
                    </td>
                    <td className="p-4 max-w-[220px]">
                      <p className="text-[#B8B3A7] line-clamp-2 italic text-[11px]">
                        "{inq.message || 'Khách quan tâm cần tư vấn chi tiết'}"
                      </p>
                      {inq.adminNote && (
                        <div className="text-[10px] text-[#F2D675] mt-1 truncate">
                          Ghi chú: {inq.adminNote}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(inq.status)}</td>
                    <td className="p-4">
                      <span className="text-xs text-[#F8F5EE] font-medium">
                        {agents.find((a) => a.id === inq.assignedAgentId || a.id === inq.assignedTo)?.name || (
                          <span className="text-[#77736B] italic">Chưa phân công</span>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] text-[#77736B]">{formatDate(inq.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(inq)}
                        className="px-3 py-1.5 rounded-lg bg-[#26231c] text-[#F2D675] hover:bg-[#D4AF37] hover:text-black font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Xử lý</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (20/page) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-[#161616]/70 border-t border-white/10 text-xs text-[#B8B3A7]">
            <span>
              Trang {currentPage} / {totalPages} (Tổng {filteredInquiries.length} leads)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-[#111111] border border-white/10 text-[#B8B3A7] hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title="Xử Lý Lead & Điều Phối Chuyên Viên"
          subtitle={`Khách hàng: ${selectedInquiry.fullName} - ${selectedInquiry.phone}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2">
            <div className="bg-[#161616] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <p className="text-[#B8B3A7]">
                <strong>Bất động sản:</strong>{' '}
                <span className="text-[#F8F5EE]">{selectedInquiry.propertyTitle || 'Tư vấn tổng quan'}</span>
              </p>
              <p className="text-[#B8B3A7]">
                <strong>Email:</strong> {selectedInquiry.email} | <strong>SĐT:</strong>{' '}
                <a href={`tel:${selectedInquiry.phone}`} className="text-[#D4AF37] underline font-mono">
                  {selectedInquiry.phone}
                </a>
              </p>
              <p className="text-[#B8B3A7]">
                <strong>Lời nhắn từ khách:</strong>
                <br />
                <span className="text-[#F8F5EE] italic">"{selectedInquiry.message || 'Không có ghi chú'}"</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                  Trạng thái chăm sóc *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
                >
                  <option value="new">Mới nhận (New)</option>
                  <option value="contacted">Đã liên hệ tư vấn (Contacted)</option>
                  <option value="qualified">Khách tiềm năng (Qualified)</option>
                  <option value="viewing_scheduled">Đã hẹn xem nhà thực tế (Scheduled)</option>
                  <option value="negotiating">Đang thương lượng hợp đồng (Negotiating)</option>
                  <option value="closed">Đã chốt giao dịch thành công (Closed)</option>
                  <option value="cancelled">Khách hủy / không còn nhu cầu (Cancelled)</option>
                  <option value="spam">Spam / Dữ liệu rác (Spam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                  Phân công chuyên viên (Agent)
                </label>
                <select
                  value={assignedAgentId}
                  onChange={(e) => setAssignedAgentId(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
                >
                  <option value="">Chưa chỉ định chuyên viên</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.position || a.title || 'Chuyên viên'}) - {a.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                Ghi chú nội bộ của Ban Quản Trị
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ghi chú phản hồi của khách, ngày hẹn xem nhà, mức giá thương lượng mong muốn..."
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-[#F8F5EE] focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-[#161616] text-xs font-semibold text-[#B8B3A7] cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
