import React, { useEffect, useState, useCallback } from 'react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { paymentsApi, PaymentFilters } from '../../api/payments.api';
import { Payment } from '../../types';

export const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters] = useState<PaymentFilters>({
    status: '',
    page: 1,
    limit: 10,
  });

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.list(filters);
      if (res.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Financial Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete log of client payments, invoice references, and gateway settlement records.
        </p>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway / Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading payments ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payment transactions recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {p.clientName || 'Direct Client'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹ {Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{p.paymentGateway}</span>{' '}
                      {p.paymentMethod && <span className="text-[10px] text-slate-400">({p.paymentMethod})</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
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
