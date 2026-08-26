import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, User, AlertCircle, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { clientsApi } from '../../api/clients.api';
import { useToast } from '../../context/ToastContext';
import { Client } from '../../types';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const loadClient = useCallback(async () => {
    if (!id || id === 'undefined') {
      setError('Invalid client identifier provided in route.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await clientsApi.getById(id);
      if (res.success && res.data) {
        setClient(res.data);
      } else {
        setError('Client record could not be found.');
      }
    } catch (err: any) {
      console.error('Failed to load client dossier:', err);
      const msg = err.response?.data?.message || 'Failed to retrieve client profile from server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-600" />
        <p className="text-xs font-bold text-slate-700">Loading client dossier from database...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Client Profile Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {error || 'The requested client account could not be found or has been removed.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clients Directory</span>
          </Link>
          <button
            onClick={loadClient}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const clientType = (client.clientType || (client as any).client_type || 'INDIVIDUAL').toUpperCase();
  const displayName =
    client.businessName ||
    (client as any).legal_name ||
    client.contactPersonName ||
    (client as any).display_name ||
    'Client Profile';
  const email = client.contactEmail || (client as any).email || 'No email registered';
  const phone = client.contactPhone || (client as any).phone || 'No phone registered';
  const pan = client.panNumber || (client as any).pan_reference || (client as any).pan;
  const gstin = client.gstin;
  const createdAt = client.createdAt || (client as any).created_at;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          title="Back to clients directory"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
            <StatusBadge status={client.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Account Public ID: {client.publicId || (client as any).public_id || '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Legal & Tax Identifiers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Tax & Legal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400">Account Classification</span>
                <p className="font-semibold text-slate-900 mt-0.5 capitalize flex items-center gap-1.5">
                  {clientType === 'BUSINESS' ? (
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{clientType.toLowerCase()}</span>
                </p>
              </div>
              <div>
                <span className="text-slate-400">PAN Card Number</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {pan || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">GSTIN Registration</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {gstin || 'Unregistered / Exempt'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Client Since</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Registered Addresses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Operating & Billing Addresses
            </h3>
            {!client.addresses || client.addresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No physical address registered.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {client.addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px]">
                      {addr.addressType} {addr.isPrimary && '(Primary)'}
                    </span>
                    <p className="font-semibold text-slate-900 mt-1">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                    <p className="text-slate-500 mt-1">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Contact Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Primary Contact Details
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium">{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
