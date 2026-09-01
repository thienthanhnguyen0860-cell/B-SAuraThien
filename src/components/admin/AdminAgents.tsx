import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Award } from 'lucide-react';
import { Agent } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAdminAction } from '../../services/adminService';

interface AdminAgentsProps {
  agents: Agent[];
  onRefresh: () => void;
}

export const AdminAgents: React.FC<AdminAgentsProps> = ({ agents, onRefresh }) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Giám Đốc Khối Private Client');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('Biệt thự Thảo Điền, Penthouse');

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingAgent(null);
    setName('');
    setTitle('Giám Đốc Khối Private Client');
    setPhone('0988 888 999');
    setEmail('advisor@aura-luxury.vn');
    setAvatar('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80');
    setBio('Chuyên gia cố vấn tài sản cao cấp với hơn 10 năm kinh nghiệm trong thị trường bất động sản hạng sang.');
    setSpecialties('Biệt thự ven sông, Penthouse biểu tượng');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Agent) => {
    setEditingAgent(a);
    setName(a.name);
    setTitle(a.title);
    setPhone(a.phone);
    setEmail(a.email);
    setAvatar(a.avatar || '');
    setBio(a.bio || '');
    setSpecialties(a.specialties?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSaving(true);
    try {
      const agentData: any = {
        name: name.trim(),
        title: title.trim(),
        phone: phone.trim(),
        email: email.trim(),
        avatar,
        bio: bio.trim(),
        specialties: specialties.split(',').map((s) => s.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      };

      if (editingAgent) {
        await updateDoc(doc(db, 'agents', editingAgent.id), agentData);
        await logAdminAction({
          adminEmail: currentUser?.email || 'admin',
          action: 'UPDATE_AGENT',
          entity: 'agents',
          entityId: editingAgent.id,
          description: `Cập nhật chuyên viên ${name}`,
        });
        success(`Đã cập nhật chuyên viên ${name}.`);
      } else {
        const newRef = doc(db, 'agents', `agent_${Date.now()}`);
        agentData.id = newRef.id;
        agentData.createdAt = serverTimestamp();
        await setDoc(newRef, agentData);
        await logAdminAction({
          adminEmail: currentUser?.email || 'admin',
          action: 'CREATE_AGENT',
          entity: 'agents',
          entityId: newRef.id,
          description: `Thêm chuyên viên mới ${name}`,
        });
        success(`Đã thêm chuyên viên ${name}.`);
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      error('Lỗi khi lưu chuyên viên.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: Agent) => {
    if (!confirm(`Bạn có chắc muốn xóa chuyên viên ${a.name}?`)) return;
    try {
      await deleteDoc(doc(db, 'agents', a.id));
      await logAdminAction({
        adminEmail: currentUser?.email || 'admin',
        action: 'DELETE_AGENT',
        entity: 'agents',
        entityId: a.id,
        description: `Xóa chuyên viên ${a.name}`,
      });
      success(`Đã xóa chuyên viên ${a.name}.`);
      onRefresh();
    } catch (err) {
      error('Lỗi khi xóa chuyên viên.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Chuyên Viên Tư Vấn VIP ({agents.length})
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Danh sách chuyên gia phụ trách điều phối và chăm sóc khách hàng Private Client.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chuyên Viên Mới</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((a) => (
          <div
            key={a.id}
            className="bg-[#111111] border border-[#D4AF37]/20 rounded-[20px] p-6 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={a.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'}
                  alt={a.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#D4AF37]/30 shrink-0"
                />
                <div>
                  <h3 className="font-serif text-base font-bold text-[#F8F5EE]">{a.name}</h3>
                  <p className="text-xs text-[#D4AF37] font-semibold">{a.title}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#B8B3A7]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{a.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="truncate">{a.email}</span>
                </div>
              </div>

              {a.specialties && a.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {a.specialties.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#161616] border border-white/10 text-[#F8F5EE]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(a)}
                className="p-2 rounded-lg bg-[#161616] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(a)}
                className="p-2 rounded-lg bg-[#161616] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAgent ? `Sửa Chuyên Viên: ${name}` : 'Thêm Chuyên Viên Mới'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Chức danh / Vị trí *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Email liên hệ *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">URL Ảnh Đại Diện (Avatar)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Lĩnh vực chuyên sâu (Cách nhau dấu phẩy)</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#161616] text-xs font-semibold text-[#B8B3A7]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase"
              >
                {saving ? 'Đang lưu...' : 'Lưu Chuyên Viên'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
