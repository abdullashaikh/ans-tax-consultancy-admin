import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Tags,
  Globe,
  Users,
  ShieldCheck,
  ArrowUpRight,
  FileText,
  Clock,
} from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { superAdminApi } from '../../api/superAdmin.api';
import { SuperAdminSummary } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SuperAdminSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await superAdminApi.getSummary();
        if (res.success && res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        console.error('Failed to load Super Admin summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1833] via-[#162750] to-[#1e1b4b] p-6 sm:p-8 text-white border border-purple-500/20 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Executive Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Business & Website Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Control authoritative service pricing, public website catalogues, CMS content, staff permissions, and review real-time security audit trails.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/super-admin/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 transition-colors"
            >
              <Tags className="w-4 h-4" />
              <span>Manage Pricing</span>
            </Link>
            <Link
              to="/super-admin/services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>New Service</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Services"
          value={loading ? '...' : `${summary?.activeServices ?? 0} / ${summary?.totalServices ?? 0}`}
          subtitle="Catalogues live on website"
          icon={Sparkles}
          color="indigo"
        />
        <StatCard
          title="Service Categories"
          value={loading ? '...' : `${summary?.activeCategories ?? 0} Active`}
          subtitle={`${summary?.totalCategories ?? 0} total categories`}
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Total User Accounts"
          value={loading ? '...' : String(summary?.totalUsers ?? 0)}
          subtitle="Staff, consultants & clients"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Total Applications"
          value={loading ? '...' : String(summary?.totalApplications ?? 0)}
          subtitle="Processed platform-wide"
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Two Column Layout: Recent Price Changes & Recent Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Price Revisions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Tags className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Price Updates</h2>
                <p className="text-[11px] text-slate-500">Authoritative pricing revisions & audits</p>
              </div>
            </div>
            <Link
              to="/super-admin/pricing"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading price history...</div>
            ) : !summary?.recentPriceChanges || summary.recentPriceChanges.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent price revisions recorded.
              </div>
            ) : (
              summary.recentPriceChanges.map((change) => (
                <div key={change.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {change.service_name || `Service #${change.service_id}`}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {change.reason || 'Routine price update'} • by {change.changed_by_name || 'Super Admin'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{Number(change.new_base_price).toLocaleString('en-IN')}
                    </div>
                    {change.previous_base_price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        ₹{Number(change.previous_base_price).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Administrative Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Administrative Audit Trail</h2>
                <p className="text-[11px] text-slate-500">Security & governance event stream</p>
              </div>
            </div>
            <Link
              to="/super-admin/audit-logs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading audit trail...</div>
            ) : !summary?.recentLogs || summary.recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No administrative audit logs available.
              </div>
            ) : (
              summary.recentLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {log.userEmail || (log.userName ? `${log.userName}` : 'System / Admin')} • {log.entityType || 'SYSTEM'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Super Admin Quick Navigation Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider text-[11px]">
          Management Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/super-admin/categories"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Service Categories
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add, organize, reorder, and activate public categories.
            </p>
          </Link>

          <Link
            to="/super-admin/services"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Services Catalogue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage offerings, descriptions, required documents, and features.
            </p>
          </Link>

          <Link
            to="/super-admin/pricing"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Tags className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Pricing Governance
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Change base & discount prices with mandatory audit logging.
            </p>
          </Link>

          <Link
            to="/super-admin/website-content"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Website CMS
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Live edit Hero, About, Contact info, SEO metadata, and Footer.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
