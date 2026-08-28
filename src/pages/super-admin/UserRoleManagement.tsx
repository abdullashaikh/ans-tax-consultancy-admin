import React, { useEffect, useState } from 'react';
import {
  UserCog,
  Plus,
  Edit2,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin.api';
import { usersApi } from '../../api/users.api';
import { User, RoleName } from '../../types';
import { useToast } from '../../context/ToastContext';

export const UserRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Create Staff Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newFirstName, setNewFirstName] = useState<string>('');
  const [newLastName, setNewLastName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRoles, setNewRoles] = useState<RoleName[]>(['STAFF']);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editRoles, setEditRoles] = useState<RoleName[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.list({ limit: 100 });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewRoles(['STAFF']);
    setIsCreateModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setIsCreating(true);
      await superAdminApi.createStaffUser({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone || undefined,
        password: newPassword,
        roles: newRoles,
      });
      showSuccess(`Account created for ${newFirstName} ${newLastName}`);
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to create staff account');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (target: User) => {
    setEditingUser(target);
    setEditStatus(target.status);
    setEditRoles(target.roles || []);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSavingEdit(true);
      await superAdminApi.updateUserRolesAndStatus(editingUser.publicId, {
        status: editStatus,
        roles: editRoles,
      });
      showSuccess(`User ${editingUser.firstName} ${editingUser.lastName} updated successfully`);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update user');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toggleRoleInEdit = (role: RoleName) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleRoleInCreate = (role: RoleName) => {
    setNewRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const availableRoles: RoleName[] = ['SUPER_ADMIN', 'ADMIN', 'CONSULTANT', 'STAFF', 'CLIENT'];

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.roles?.includes(roleFilter as RoleName);
    const matchSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <UserCog className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              User & Staff Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision staff accounts, assign granular role boundaries, and control platform access permissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-white">Privilege Escalation Protection Enabled</p>
          <p className="text-slate-400 mt-0.5">
            Only authenticated Super Admins can assign or revoke the <code className="text-purple-300">SUPER_ADMIN</code> role. Normal Admins/Accountants are strictly prohibited by backend middleware from self-elevating.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin (Accountant)</option>
            <option value="CONSULTANT">Consultant</option>
            <option value="STAFF">Staff</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shrink-0"
          title="Reload users"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {userItem.firstName} {userItem.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {userItem.publicId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900">{userItem.email}</div>
                      {userItem.phone && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{userItem.phone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {userItem.roles?.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : r === 'ADMIN'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : r === 'CONSULTANT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          userItem.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : userItem.status === 'SUSPENDED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {userItem.status === 'ACTIVE' && <UserCheck className="w-3 h-3" />}
                        {userItem.status === 'SUSPENDED' && <UserX className="w-3 h-3" />}
                        <span>{userItem.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(userItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-[11px] font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Provision Staff Account</h2>
            <p className="text-xs text-slate-500 mb-5">
              Create an administrative or consultant staff login for ANS Platform.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91-7041512939"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 upper, 1 num"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Roles *
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableRoles.map((role) => {
                    const isChecked = newRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRoleInCreate(role)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-colors ${
                          isChecked
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Roles & Status Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Manage Roles & Status</h2>
            <p className="text-xs text-slate-500 mb-5">
              Account: <span className="font-bold text-slate-800">{editingUser.firstName} {editingUser.lastName}</span> ({editingUser.email})
            </p>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role Allocations
                </label>
                <div className="space-y-2 pt-1">
                  {availableRoles.map((role) => {
                    const isChecked = editRoles.includes(role);
                    return (
                      <label
                        key={role}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-purple-50/50 border-purple-200 text-purple-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{role.replace('_', ' ')}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRoleInEdit(role)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
