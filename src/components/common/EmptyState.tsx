import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-[#EAEAEC] rounded bg-white">
      <div className="w-16 h-16 rounded-full bg-[#FFF0F4] flex items-center justify-center text-[#FF3F6C] mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-[#282C3F] mb-1.5">{title}</h2>
      <p className="text-sm text-[#535766] max-w-md mb-6">{description}</p>
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="inline-flex items-center justify-center h-11 px-7 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6325D] transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && !ctaTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center h-11 px-7 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6325D] transition-colors cursor-pointer"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
