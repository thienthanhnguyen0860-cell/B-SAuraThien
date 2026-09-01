import React, { useState } from 'react';
import { Search, Shield, ShieldCheck, UserX, UserCheck, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../../types';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { updateUserRoleAdmin, toggleUserBlockAdmin } from '../../services/adminService';

interface AdminUsersProps {
  users: UserProfile[];
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onRefresh }) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (targetUser: UserProfile, newRole: 'admin' | 'user') => {
    if (!currentUser) return;
    try {
      await updateUserRoleAdmin(
        targetUser.uid,
        newRole,
        targetUser.email,
        currentUser.email || 'admin'
      );
      success(`Đã cập nhật vai trò ${newRole.toUpperCase()} cho ${targetUser.email}.`);
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Không thể đổi vai trò.');
    }
  };

  const handleToggleBlock = async (targetUser: UserProfile) => {
    if (!currentUser) return;
    const isBlocking = !targetUser.isBlocked;
    try {
      await toggleUserBlockAdmin(
        targetUser.uid,
        isBlocking,
        targetUser.email,
        currentUser.email || 'admin'
      );
      success(
        isBlocking
          ? `Đã khóa tài khoản ${targetUser.email}.`
          : `Đã mở khóa tài khoản ${targetUser.email}.`
      );
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Không thể thực hiện.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Quản Lý Người Dùng & Phân Quyền ({users.length})
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Danh sách thành viên đăng ký, cấp quyền Quản trị viên (Admin) hoặc khóa tài khoản vi phạm.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#111111] p-4 rounded-2xl border border-[#D4AF37]/15 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="user">Khách hàng / Thành viên (User)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Người Dùng</th>
                <th className="p-4">Số Điện Thoại</th>
                <th className="p-4">Vai Trò</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Ngày Tham Gia</th>
                <th className="p-4 text-right">Phân Quyền / Khóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isSuper = u.email === 'thienthanhnguyen0860@gmail.com';
                const isSelf = u.uid === currentUser?.uid;

                return (
                  <tr key={u.uid} className="hover:bg-[#161616]/50">
                    <td className="p-4">
                      <div className="font-semibold text-[#F8F5EE] flex items-center gap-2">
                        <span>{u.displayName || 'Chưa đặt tên'}</span>
                        {isSuper && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/40">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#77736B]">{u.email}</div>
                    </td>

                    <td className="p-4 text-[#F8F5EE]">{u.phone || 'Chưa cập nhật'}</td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          u.role === 'admin'
                            ? 'bg-[#D4AF37]/20 text-[#F2D675] border-[#D4AF37]/40'
                            : 'bg-white/5 text-[#B8B3A7] border-white/10'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 uppercase">
                          Đã bị khóa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 uppercase">
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-[11px] text-[#77736B]">{formatDate(u.createdAt)}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Change Role Button */}
                        {!isSuper && !isSelf && (
                          <button
                            onClick={() =>
                              handleRoleChange(u, u.role === 'admin' ? 'user' : 'admin')
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#26231c] text-[#F2D675] hover:bg-[#D4AF37] hover:text-black font-semibold text-[11px] transition-colors"
                          >
                            {u.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin'}
                          </button>
                        )}

                        {/* Block/Unblock Button */}
                        {!isSuper && !isSelf && (
                          <button
                            onClick={() => handleToggleBlock(u)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              u.isBlocked
                                ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E] hover:text-black'
                                : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white'
                            }`}
                            title={u.isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {u.isBlocked ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
