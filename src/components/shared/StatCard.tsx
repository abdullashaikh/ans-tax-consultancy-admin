import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
  subtitle?: string;
  action?: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'amber',
  subtitle,
  action,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'amber':
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-3 rounded-xl border ${getColorStyles()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trendUp ? '+' : ''}
            {trend}
          </span>
        )}
      </div>

      {action && <div className="mt-4 pt-3 border-t border-slate-100">{action}</div>}
    </div>
  );
};
