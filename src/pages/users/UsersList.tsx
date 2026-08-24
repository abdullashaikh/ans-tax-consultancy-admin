import React, { useEffect, useState, useCallback } from 'react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { usersApi, UserFilters } from '../../api/users.api';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters] = useState<UserFilters>({
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
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & User Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage consultant permissions, admin roles, and internal system access.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
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
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400">ID: {u.publicId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase"
                          >
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(u.publicId, 'SUSPENDED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(u.publicId, 'ACTIVE')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          Activate
                        </button>
                      )}
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
