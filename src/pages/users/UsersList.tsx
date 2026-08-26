import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { usersApi, UserFilters } from '../../api/users.api';
import { useToast } from '../../context/ToastContext';
import { User, PaginationMeta } from '../../types';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<UserFilters>({
    status: '',
    search: '',
    page: 1,
    limit: 20,
  });

  const { showSuccess, showError } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersApi.list(filters);
      if (res.success) {
        setUsers(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      showError(err.response?.data?.message || 'Failed to load user directory from server');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUpdateStatus = async (publicId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const res = await usersApi.adminUpdate(publicId, { status });
      if (res.success) {
        showSuccess(`User account status updated to ${status}`);
        loadUsers();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage consultant permissions, admin roles, and internal system access.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email address, or phone..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
        >
          <option value="">All Account Statuses</option>
          <option value="ACTIVE">Active Accounts</option>
          <option value="INACTIVE">Inactive Accounts</option>
          <option value="SUSPENDED">Suspended Accounts</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User / Staff</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Roles</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No users found matching the query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const userPubId = u.publicId || (u as any).public_id || String(u.id);
                  const firstName = u.firstName || (u as any).first_name || 'User';
                  const lastName = u.lastName || (u as any).last_name || '';
                  const initial = firstName.charAt(0).toUpperCase() || 'U';
                  const roles = Array.isArray(u.roles) ? u.roles : [];

                  return (
                    <tr key={u.id || userPubId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">
                              {firstName} {lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {userPubId ? String(userPubId).slice(0, 8) : '—'}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.length === 0 ? (
                            <span className="text-slate-400 italic">No roles</span>
                          ) : (
                            roles.map((role) => (
                              <span
                                key={role}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase"
                              >
                                {String(role).replace('_', ' ')}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(userPubId, 'SUSPENDED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(userPubId, 'ACTIVE')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} total users)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
