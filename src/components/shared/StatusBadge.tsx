import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const getColors = () => {
    switch (normalized) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'SUCCESS':
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';

      case 'IN_PROGRESS':
      case 'QUALIFIED':
      case 'UNDER_REVIEW':
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';

      case 'SUBMITTED':
      case 'REQUESTED':
      case 'NEW':
      case 'UPLOADED':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';

      case 'PAYMENT_PENDING':
      case 'ACTION_REQUIRED':
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20';

      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
      case 'SUSPENDED':
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';

      case 'DRAFT':
      case 'INACTIVE':
      case 'ARCHIVED':
      case 'CLOSED':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
    }
  };

  const formattedLabel = status.replace(/_/g, ' ');

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset capitalize ${getColors()} ${sizeClasses}`}
    >
      {formattedLabel.toLowerCase()}
    </span>
  );
};
