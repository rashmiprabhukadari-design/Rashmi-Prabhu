import { Star } from 'lucide-react';
import { formatRatingCount } from '../../utils/commerce';

interface RatingBadgeProps {
  rating: number;
  count: number;
  variant?: 'overlay' | 'inline';
}

export function RatingBadge({ rating, count, variant = 'overlay' }: RatingBadgeProps) {
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#EAEAEC] rounded bg-white text-xs font-semibold text-[#282C3F] tabular-nums">
        <span>{rating.toFixed(1)}</span>
        <Star className="w-3.5 h-3.5 fill-[#14958F] text-[#14958F]" aria-hidden="true" />
        <span className="text-[#EAEAEC]">|</span>
        <span className="text-[#535766] font-medium">{formatRatingCount(count)} Ratings</span>
      </div>
    );
  }

  return (
    <div className="sk-glass-rating inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#282C3F] tabular-nums leading-none">
      <span>{rating.toFixed(1)}</span>
      <Star className="w-2.5 h-2.5 fill-[#14958F] text-[#14958F]" aria-hidden="true" />
      <span className="text-[#94969F] font-normal">|</span>
      <span className="text-[#535766]">{formatRatingCount(count)}</span>
    </div>
  );
}
