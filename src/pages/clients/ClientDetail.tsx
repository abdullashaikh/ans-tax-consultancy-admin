import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { clientsApi } from '../../api/clients.api';
import { useToast } from '../../context/ToastContext';
import { Client } from '../../types';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  const loadClient = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await clientsApi.getById(id);
      if (res.success && res.data) {
        setClient(res.data);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to load client');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  if (loading || !client) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Loading client dossier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {client.businessName || client.contactPersonName || 'Client Profile'}
            </h1>
            <StatusBadge status={client.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Account ID: {client.publicId}</p>
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
                <p className="font-semibold text-slate-900 mt-0.5 capitalize">
                  {client.clientType.toLowerCase()}
                </p>
              </div>
              <div>
                <span className="text-slate-400">PAN Card Number</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {client.panNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">GSTIN Registration</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {client.gstin || 'Unregistered / Exempt'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Client Since</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {new Date(client.createdAt).toLocaleDateString()}
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
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-800 font-medium">{client.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-800 font-medium">{client.contactPhone || 'No phone'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
