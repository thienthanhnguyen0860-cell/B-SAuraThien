import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Property } from '../../types';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { deletePropertyAdmin, duplicatePropertyAdmin, updatePropertyAdmin } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

interface AdminPropertiesProps {
  properties: Property[];
  onAddNew: () => void;
  onEdit: (property: Property) => void;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

const ITEMS_PER_PAGE = 20;

export const AdminProperties: React.FC<AdminPropertiesProps> = ({
  properties,
  onAddNew,
  onEdit,
  onRefresh,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.propertyCode && p.propertyCode.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q));
      const matchType = filterType === 'all' || p.propertyType === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [properties, search, filterType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !currentUser || deleting) return;
    setDeleting(true);
    try {
      await deletePropertyAdmin(deleteTarget.id, currentUser.email || 'admin');
      success(`Đã xóa bất động sản ${deleteTarget.propertyCode || deleteTarget.title}.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      error('Lỗi khi xóa bất động sản.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (property: Property) => {
    if (!currentUser) return;
    try {
      await duplicatePropertyAdmin(property, currentUser.email || 'admin');
      success(`Đã nhân bản bất động sản ${property.propertyCode || property.title}.`);
      onRefresh();
    } catch (err: any) {
      error('Lỗi khi nhân bản bất động sản.');
    }
  };

  const handleToggleHide = async (property: Property) => {
    if (!currentUser) return;
    const newStatus = property.status === 'hidden' ? 'available' : 'hidden';
    try {
      await updatePropertyAdmin(
        property.id,
        { status: newStatus },
        currentUser.email || 'admin'
      );
      success(
        newStatus === 'hidden'
          ? `Đã ẩn BĐS ${property.propertyCode || property.title} khỏi trang chủ.`
          : `Đã mở hiển thị BĐS ${property.propertyCode || property.title}.`
      );
      onRefresh();
    } catch (err: any) {
      error('Không thể cập nhật trạng thái.');
    }
  };

  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            Đang bán
          </span>
        );
      case 'reserved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            Đã giữ chỗ
          </span>
        );
      case 'sold':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            Đã bán
          </span>
        );
      case 'rented':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
            Đã cho thuê
          </span>
        );
      case 'hidden':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#77736B]/20 text-[#B8B3A7] border border-white/10">
            Đang ẩn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Bất Động Sản ({properties.length})
          </h2>
          <p className="text-xs text-[#B8B3A7] mt-0.5">
            Thêm mới, cập nhật giá niêm yết, nhân bản hoặc ẩn tin trên website.
          </p>
        </div>

        <button
          onClick={onAddNew}
          id="btn-add-property"
          className="px-5 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Bất Động Sản Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] p-4 rounded-2xl border border-[#D4AF37]/15 flex flex-col md:flex-row gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tiêu đề, mã BĐS, địa chỉ..."
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Tất cả loại BĐS</option>
          <option value="villa">Biệt Thự</option>
          <option value="penthouse">Penthouse</option>
          <option value="apartment">Căn Hộ Hạng Sang</option>
          <option value="shophouse">Shophouse</option>
          <option value="land">Đất Nền Dinh Thự</option>
          <option value="resort">BĐS Nghỉ Dưỡng</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Đang bán</option>
          <option value="reserved">Đã giữ chỗ</option>
          <option value="sold">Đã bán</option>
          <option value="rented">Đã cho thuê</option>
          <option value="hidden">Đang ẩn</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Hình ảnh / Mã</th>
                <th className="p-4">Tên Bất Động Sản</th>
                <th className="p-4">Loại / Hình thức</th>
                <th className="p-4">Giá niêm yết</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Lượt xem</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#77736B]">
                    Không tìm thấy bất động sản phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedList.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#161616]/50 transition-colors">
                    {/* Thumbnail & Code */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.thumbnail}
                          alt={prop.title}
                          className="w-14 h-11 object-cover rounded-lg border border-white/10"
                        />
                        <span className="font-mono text-[11px] font-bold text-[#D4AF37]">
                          {prop.propertyCode}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-[#F8F5EE] truncate">{prop.title}</div>
                      <div className="text-[11px] text-[#77736B] truncate">{prop.address}</div>
                    </td>

                    {/* Type / Listing */}
                    <td className="p-4">
                      <div className="text-[#F8F5EE] capitalize">{prop.propertyType}</div>
                      <div className="text-[10px] text-[#77736B]">
                        {prop.listingType === 'rent' ? 'Cho Thuê' : 'Bán'}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-serif font-bold text-[#F2D675]">
                      {formatCurrency(prop.price, prop.priceUnit)}
                    </td>

                    {/* Status */}
                    <td className="p-4">{getStatusBadge(prop.status)}</td>

                    {/* Views */}
                    <td className="p-4 text-center font-mono text-[#F8F5EE]">
                      {formatNumber(prop.viewCount || 0)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate(`/property/${prop.slug || prop.id}`)}
                          title="Xem trên web"
                          className="p-1.5 rounded-lg bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] hover:bg-[#26231c] cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(prop)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg bg-[#161616] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(prop)}
                          title="Nhân bản"
                          className="p-1.5 rounded-lg bg-[#161616] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleHide(prop)}
                          title={prop.status === 'hidden' ? 'Hiển thị' : 'Ẩn BĐS'}
                          className="p-1.5 rounded-lg bg-[#161616] text-[#B8B3A7] hover:text-[#F8F5EE] cursor-pointer"
                        >
                          {prop.status === 'hidden' ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(prop)}
                          title="Xóa vĩnh viễn"
                          className="p-1.5 rounded-lg bg-[#161616] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (20/page) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-[#161616]/70 border-t border-white/10 text-xs text-[#B8B3A7]">
            <span>
              Trang {currentPage} / {totalPages} (Tổng {filteredProperties.length} bất động sản)
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xác Nhận Xóa Bất Động Sản"
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#B8B3A7] leading-relaxed">
              Bạn có chắc chắn muốn xóa bất động sản{' '}
              <strong className="text-[#F8F5EE] font-serif">{deleteTarget.title}</strong> (Mã:{' '}
              <span className="font-mono text-[#D4AF37]">{deleteTarget.propertyCode}</span>)?
              Hành động này sẽ được ghi vào nhật ký kiểm toán hệ thống.
            </p>
            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#161616] text-xs font-semibold text-[#B8B3A7] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-[#EF4444] text-xs font-bold text-white uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
