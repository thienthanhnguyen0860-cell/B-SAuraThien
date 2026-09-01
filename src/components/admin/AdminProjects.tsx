import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';
import { Project } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PROVINCES, slugify, formatCurrency } from '../../lib/utils';
import { doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAdminAction } from '../../services/adminService';

interface AdminProjectsProps {
  projects: Project[];
  onRefresh: () => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ projects, onRefresh }) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [developer, setDeveloper] = useState('');
  const [province, setProvince] = useState('Hồ Chí Minh');
  const [district, setDistrict] = useState('Thủ Đức');
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('Khu Đô Thị Sinh Thái');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [minPrice, setMinPrice] = useState(30000000000);
  const [status, setStatus] = useState<Project['status']>('selling');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.developer?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProject(null);
    setName('');
    setSlug('');
    setDeveloper('');
    setProvince('Hồ Chí Minh');
    setDistrict('Thủ Đức');
    setAddress('');
    setProjectType('Khu Đô Thị Sinh Thái');
    setDescription('');
    setThumbnail('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=85');
    setMinPrice(30000000000);
    setStatus('selling');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setSlug(p.slug || '');
    setDeveloper(p.developer || '');
    setProvince(p.province || 'Hồ Chí Minh');
    setDistrict(p.district || 'Thủ Đức');
    setAddress(p.address || '');
    setProjectType(p.projectType || 'Khu Đô Thị Sinh Thái');
    setDescription(p.description || '');
    setThumbnail(p.thumbnail || '');
    setMinPrice(p.minPrice || 30000000000);
    setStatus(p.status || 'selling');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const projectData: any = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        developer: developer.trim(),
        province,
        district,
        address: address.trim(),
        projectType,
        description: description.trim(),
        thumbnail,
        minPrice: Number(minPrice),
        status,
        updatedAt: serverTimestamp(),
      };

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        await logAdminAction({
          adminEmail: currentUser?.email || 'admin',
          action: 'UPDATE_PROJECT',
          entity: 'projects',
          entityId: editingProject.id,
          description: `Cập nhật dự án ${name}`,
        });
        success(`Đã cập nhật dự án ${name}.`);
      } else {
        const newRef = doc(db, 'projects', `proj_${Date.now()}`);
        projectData.id = newRef.id;
        projectData.createdAt = serverTimestamp();
        await setDoc(newRef, projectData);
        await logAdminAction({
          adminEmail: currentUser?.email || 'admin',
          action: 'CREATE_PROJECT',
          entity: 'projects',
          entityId: newRef.id,
          description: `Tạo dự án mới ${name}`,
        });
        success(`Đã thêm dự án ${name}.`);
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      error('Lỗi khi lưu dự án.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Bạn có chắc muốn xóa dự án ${p.name}?`)) return;
    try {
      await deleteDoc(doc(db, 'projects', p.id));
      await logAdminAction({
        adminEmail: currentUser?.email || 'admin',
        action: 'DELETE_PROJECT',
        entity: 'projects',
        entityId: p.id,
        description: `Xóa dự án ${p.name}`,
      });
      success(`Đã xóa dự án ${p.name}.`);
      onRefresh();
    } catch (err) {
      error('Lỗi khi xóa dự án.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Dự Án ({projects.length})
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Danh sách các quần thể đô thị, khu nghỉ dưỡng và dự án biểu tượng.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Dự Án Mới</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Dự án</th>
                <th className="p-4">Chủ đầu tư</th>
                <th className="p-4">Vị trí</th>
                <th className="p-4">Loại hình</th>
                <th className="p-4">Giá từ</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-[#161616]/50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-12 h-10 object-cover rounded-lg border border-white/10"
                    />
                    <div>
                      <span className="font-semibold text-[#F8F5EE] block">{p.name}</span>
                      <span className="text-[10px] text-[#77736B] font-mono">{p.slug}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#F8F5EE]">{p.developer || 'Chưa cập nhật'}</td>
                  <td className="p-4">{p.district}, {p.province}</td>
                  <td className="p-4">{p.projectType}</td>
                  <td className="p-4 font-serif font-bold text-[#F2D675]">
                    {p.minPrice ? formatCurrency(p.minPrice) : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 uppercase">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-[#161616] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-[#161616] text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Project */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProject ? `Sửa Dự Án: ${name}` : 'Thêm Dự Án Mới'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Tên Dự Án *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingProject) setSlug(slugify(e.target.value));
                }}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Chủ đầu tư</label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Loại hình</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Tỉnh / Thành</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Quận / Huyện</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">URL Ảnh Thumbnail</label>
              <input
                type="url"
                required
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8B3A7] mb-1">Mô tả dự án</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-sm text-[#F8F5EE]"
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
                {saving ? 'Đang lưu...' : 'Lưu Dự Án'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
