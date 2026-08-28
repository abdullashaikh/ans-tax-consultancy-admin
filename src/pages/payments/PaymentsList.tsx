import React, { useEffect, useState, useCallback } from 'react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { paymentsApi, PaymentFilters } from '../../api/payments.api';
import { Payment } from '../../types';
import { Eye, RefreshCw } from 'lucide-react';
import { TaxInvoiceModal } from '../../components/shared/TaxInvoiceModal';

export const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters] = useState<PaymentFilters>({
    status: '',
    page: 1,
    limit: 50,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments &amp; Financial Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete log of client payments, invoice references, and gateway settlement records.
          </p>
        </div>
        <button
          onClick={loadPayments}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm cursor-pointer"
          title="Reload Payments"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
                <th className="py-3 px-4 text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading payments ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment transactions recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-semibold">#</span>
                        <span>
                          {p.paymentReference ||
                            (p as any).payment_reference ||
                            (p as any).invoiceNumber ||
                            (p as any).invoice_number ||
                            `ANS-INV-${p.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{p.clientName || (p as any).client_name || 'Direct Client'}</div>
                      {(p.applicationNumber || (p as any).application_number) && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {p.applicationNumber || (p as any).application_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹ {Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {p.paymentGateway || (p as any).payment_gateway || 'RAZORPAY'}
                      </span>{' '}
                      {(p.paymentMethod || (p as any).payment_method) && (
                        <span className="text-[10px] text-slate-400">
                          ({p.paymentMethod || (p as any).payment_method})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(
                        p.paidAt ||
                          (p as any).paid_at ||
                          p.createdAt ||
                          (p as any).created_at ||
                          Date.now()
                      ).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                        title="View official Tax Invoice and Payment Receipt"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentsList;
