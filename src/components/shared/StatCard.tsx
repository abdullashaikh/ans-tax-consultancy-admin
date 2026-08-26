import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
  subtitle?: string;
  action?: ReactNode;
  to?: string;
  onClick?: () => void;
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
  to,
  onClick,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100/70';
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100/70';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100/70';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-100/70';
      case 'amber':
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100/70';
    }
  };

  const cardContent = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {to && (
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          )}
          <div className={`p-3 rounded-xl border transition-colors ${getColorStyles()}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
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
    </>
  );

  const containerClasses =
    'block bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group text-left w-full';

  if (to) {
    return (
      <Link to={to} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${containerClasses} cursor-pointer`}>
        {cardContent}
      </button>
    );
  }

  return <div className={containerClasses}>{cardContent}</div>;
};
