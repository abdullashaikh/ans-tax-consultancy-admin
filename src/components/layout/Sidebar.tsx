import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderLock,
  Target,
  Calendar,
  CreditCard,
  UserCog,
  ShieldCheck,
  Settings,
  LogOut,
  Building2,
  Tags,
  Layers,
  Globe,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();

  // Operations Navigation (Accountants & Operations Admins)
  const operationsNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
    { name: 'Applications', href: '/applications', icon: FileText },
    { name: 'Clients Directory', href: '/clients', icon: Users },
    { name: 'Document Verification', href: '/documents', icon: FolderLock },
    { name: 'Leads & CRM', href: '/leads', icon: Target },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Payments & Revenue', href: '/payments', icon: CreditCard },
  ];

  // Super Admin Management Suite (Exclusive to SUPER_ADMIN)
  const superAdminNavigation = [
    { name: 'Overview & KPIs', href: '/super-admin', icon: BarChart3, exact: true },
    { name: 'Service Categories', href: '/super-admin/categories', icon: Layers },
    { name: 'Services Catalogue', href: '/super-admin/services', icon: Sparkles },
    { name: 'Pricing Governance', href: '/super-admin/pricing', icon: Tags },
    { name: 'Website Content (CMS)', href: '/super-admin/website-content', icon: Globe },
    { name: 'Staff & Roles', href: '/super-admin/users', icon: UserCog },
    { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: ShieldCheck },
    { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
  ];

  // Governance for normal Admin/Consultant (if not Super Admin)
  const normalAdminNavigation = [
    { name: 'Team & Accounts', href: '/users', icon: UserCog },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
    { name: 'System Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0c1833] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-[#081124]">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
            isSuperAdmin
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/20'
              : 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-amber-500/20'
          }`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">ANS Platform</span>
            <span className={`block text-[10px] font-semibold uppercase tracking-wider ${
              isSuperAdmin ? 'text-purple-400 font-bold' : 'text-amber-400'
            }`}>
              {isSuperAdmin ? '👑 Super Admin Suite' : 'Operations & Accounts'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {/* 1. Super Admin Business Suite */}
          {isSuperAdmin && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                <span>Business & Website</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">EXEC</span>
              </div>
              <nav className="space-y-1">
                {superAdminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.exact}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-purple-500/20 text-purple-300 font-semibold border-l-2 border-purple-400'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0 text-purple-400" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* 2. Operations & Client Workspace */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Client Operations</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">OPS</span>
            </div>
            <nav className="space-y-1">
              {operationsNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.exact}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-400'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* 3. Non-Super Admin Governance */}
          {isAdmin && !isSuperAdmin && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Administration
              </div>
              <nav className="space-y-1">
                {normalAdminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800 bg-[#081124]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                isSuperAdmin ? 'bg-purple-900/80 text-purple-300 border border-purple-600/40' : 'bg-slate-700 text-amber-400'
              }`}>
                {user?.firstName?.[0] || 'A'}
                {user?.lastName?.[0] || 'N'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={`text-[10px] font-semibold truncate ${
                  isSuperAdmin ? 'text-purple-400' : 'text-amber-400'
                }`}>
                  {user?.roles?.[0]?.replace('_', ' ')}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
