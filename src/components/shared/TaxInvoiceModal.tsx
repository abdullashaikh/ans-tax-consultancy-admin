import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Building2,
  ShieldCheck,
  CreditCard,
  FileText,
  User,
} from 'lucide-react';
import { Payment } from '../../types';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !payment) return null;

  const totalAmount = Number(payment.amount || 0);
  const taxableAmount = Math.round((totalAmount / 1.18) * 100) / 100;
  const gstAmount = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  const invoiceNumber =
    payment.paymentReference ||
    payment.publicId?.slice(0, 8).toUpperCase() ||
    `ANS-INV-${payment.id}`;

  const transactionId =
    payment.gatewayTransactionId ||
    payment.gatewayPaymentId ||
    'rzp_tx_' + payment.id;

  const clientName = payment.clientName || 'Valued Client';
  const clientEmail = (payment as any).clientEmail || (payment as any).client_email;
  const clientPhone = (payment as any).clientPhone || (payment as any).client_phone;
  const serviceName =
    (payment as any).applicationTitle ||
    (payment as any).application_title ||
    'Professional Tax Consultancy & Compliance Fee';

  const applicationRef = payment.applicationNumber || (payment as any).application_number;
  const invoiceDate = payment.paidAt || payment.createdAt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none">
        {/* Sticky Top Header Bar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wider uppercase">Official Tax Invoice &amp; Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              title="Close popup"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="p-6 sm:p-8 space-y-5 text-slate-800 text-xs bg-white overflow-y-auto print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0c1833] text-amber-400 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-950 tracking-tight">ANS Tax Consultancy</h1>
                  <p className="text-[10px] text-slate-500 font-semibold">Chartered Accountants &amp; Corporate Advisors</p>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-600 space-y-0.5">
                <p>8/131, Khichri Pur, East Delhi, Delhi – 110091, India</p>
                <p>GSTIN: <strong className="text-slate-900">07AAAAA0000A1Z5</strong> | PAN: <strong className="text-slate-900">AAETA1234F</strong></p>
                <p>Helpline: +91-7041512939 | billing@anstaxconsultancy.com</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-full uppercase tracking-wider mb-1.5">
                ✓ TAX INVOICE — {payment.status}
              </span>
              <div className="text-[10px] text-slate-600 space-y-0.5">
                <p><span className="text-slate-400">Invoice No:</span> <strong className="font-mono text-slate-950">{invoiceNumber}</strong></p>
                <p><span className="text-slate-400">Date:</span> <strong className="text-slate-900">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</strong></p>
                {applicationRef && (
                  <p><span className="text-slate-400">Application:</span> <strong className="font-mono text-amber-700">{applicationRef}</strong></p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-500" />
                <span>Client (Billed To)</span>
              </p>
              <p className="font-bold text-xs text-slate-950">{clientName}</p>
              {clientEmail && <p className="text-[10px] text-slate-600 mt-0.5">{clientEmail}</p>}
              {clientPhone && <p className="text-[10px] text-slate-600">{clientPhone}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 text-slate-500" />
                <span>Payment Settlement</span>
              </p>
              <div className="text-[10px] space-y-0.5">
                <p><span className="text-slate-500">Gateway:</span> <strong className="text-slate-900">{payment.paymentGateway || 'Razorpay Standard'}</strong></p>
                <p><span className="text-slate-500">Transaction ID:</span> <strong className="font-mono text-slate-900">{transactionId}</strong></p>
                <p><span className="text-slate-500">Status:</span> <strong className="text-emerald-700">{payment.status}</strong></p>
                <p><span className="text-slate-500">Method:</span> <strong className="text-slate-900">{payment.paymentMethod || 'UPI / Cards / NetBanking'}</strong></p>
              </div>
            </div>
          </div>

          {/* Itemized Services Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-center">SAC</th>
                  <th className="py-2 px-3 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-mono text-slate-400">1</td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-950">{serviceName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Professional engagement and statutory compliance fee.</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">998231</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    ₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-1">
            <div className="w-full sm:w-64 space-y-1.5 text-[10px]">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono font-semibold text-slate-900">₹ {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono text-slate-900">₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono text-slate-900">₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-950">
                <span>Total Paid:</span>
                <span className="font-mono text-sm text-amber-600">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Verification Stamp & Signatory Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] font-semibold">Digitally Signed under IT Act, 2000</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-900">ANS Tax Consultancy</p>
              <p className="text-[9px] text-slate-400 italic">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
