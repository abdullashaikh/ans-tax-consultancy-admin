import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  FolderLock,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { applicationsApi } from '../api/applications.api';
import { leadsApi } from '../api/leads.api';
import { clientsApi } from '../api/clients.api';
import { documentsApi } from '../api/documents.api';
import { paymentsApi } from '../api/payments.api';
import { Application, Lead } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<{
    applications: number;
    clients: number;
    pendingDocs: number;
    revenue: number;
  }>({
    applications: 0,
    clients: 0,
    pendingDocs: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [appRes, leadRes, clientRes, docRes, payRes] = await Promise.all([
          applicationsApi.list({ limit: 6 }),
          leadsApi.list({ limit: 5 }),
          clientsApi.list({ limit: 1 }).catch(() => ({ success: true, meta: { total: 0 } })),
          documentsApi.list({ status: 'UPLOADED', limit: 1 }).catch(() => ({ success: true, meta: { total: 0 } })),
          paymentsApi.list({ limit: 100 }).catch(() => ({ success: true, data: [] })),
        ]);

        if (appRes.success) setApplications(appRes.data || []);
        if (leadRes.success) setLeads(leadRes.data || []);

        const totalRevenue = (payRes.data || []).reduce(
          (sum: number, p: any) => sum + (p.status === 'SUCCESS' ? Number(p.amount) : 0),
          0
        );

        setCounts({
          applications: appRes.meta?.total || (appRes.data || []).length,
          clients: clientRes.meta?.total || 0,
          pendingDocs: docRes.meta?.total || 0,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c1833] to-[#172c57] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/5 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-500/30">
            Executive Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Overview of tax filing cases, client registrations, document verifications, and financial operations.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Manage Applications</span>
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs backdrop-blur-sm border border-white/10 transition-colors"
          >
            <FolderLock className="w-4 h-4 text-amber-400" />
            <span>Document Verification</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Filings"
          value={loading ? '...' : counts.applications}
          subtitle="Tax & GST Applications"
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Client Accounts"
          value={loading ? '...' : counts.clients}
          subtitle="Businesses & Individuals"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Documents"
          value={loading ? '...' : counts.pendingDocs}
          subtitle="Awaiting Verification"
          icon={FolderLock}
          color="rose"
        />
        <StatCard
          title="Settled Revenue"
          value={loading ? '...' : `₹ ${counts.revenue.toLocaleString('en-IN')}`}
          subtitle="Total Verified Payments"
          icon={CreditCard}
          color="emerald"
        />
      </div>

      {/* Main Grid: Recent Applications + Leads Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications Ledger (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Service Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live status of client submissions</p>
            </div>
            <Link
              to="/applications"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Loading recent applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {app.clientName || 'Direct Client'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {app.serviceName || app.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/applications/${app.publicId}`}
                          className="font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CRM Leads & Quick Actions (1 Column) */}
        <div className="space-y-6">
          {/* New Leads / Inquiries */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent CRM Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">Potential leads from website</p>
              </div>
              <Link to="/leads" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                All Leads
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {leads.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No new inquiries.</p>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{lead.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{lead.email || lead.phone}</p>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick SLA Status Indicator */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Compliance SLA</h4>
                <p className="text-xs text-slate-600 mt-0.5">99.4% Tax filing SLA adherence on time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
