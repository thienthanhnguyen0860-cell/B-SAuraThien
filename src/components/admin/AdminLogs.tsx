import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, History, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate } from '../../lib/utils';

interface AdminLogItem {
  id: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  createdAt: any;
}

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      const list: AdminLogItem[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AdminLogItem);
      });
      setLogs(list);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      !search ||
      l.adminEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('APPROVE')) {
      return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
    }
    if (action.includes('DELETE') || action.includes('CANCEL') || action.includes('BLOCK')) {
      return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
    }
    return 'bg-[#D4AF37]/15 text-[#F2D675] border-[#D4AF37]/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Nhật Ký Hoạt Động Ban Quản Trị (Audit Logs)
          </h2>
          <p className="text-xs text-[#B8B3A7]">
            Ghi vết bất biến mọi thay đổi giá niêm yết, duyệt cọc giữ chỗ và phân quyền trên hệ thống.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs font-semibold text-[#B8B3A7] hover:text-[#F8F5EE]"
        >
          Làm Mới Nhật Ký
        </button>
      </div>

      <div className="bg-[#111111] p-4 rounded-2xl border border-[#D4AF37]/15">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email admin, hành động hoặc mô tả..."
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[20px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B8B3A7]">
            <thead className="bg-[#161616] uppercase text-[10px] font-bold text-[#77736B] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Thời Gian</th>
                <th className="p-4">Tài Khoản Admin</th>
                <th className="p-4">Hành Động</th>
                <th className="p-4">Mô Tả Chi Tiết</th>
                <th className="p-4">Thực Thể</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#77736B]">
                    Đang tải lịch sử kiểm toán...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#77736B]">
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616]/50">
                    <td className="p-4 text-[11px] font-mono text-[#77736B] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="p-4 font-semibold text-[#F8F5EE] whitespace-nowrap">
                      {log.adminEmail}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-[#F8F5EE] max-w-md">{log.description}</td>
                    <td className="p-4 font-mono text-[11px] text-[#D4AF37]">
                      {log.entity} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
