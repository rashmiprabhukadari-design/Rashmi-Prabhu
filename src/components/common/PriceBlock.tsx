import { formatINR } from '../../utils/commerce';

interface PriceBlockProps {
  price: number;
  mrp: number;
  discountPercent: number;
  size?: 'sm' | 'lg';
}

export function PriceBlock({ price, mrp, discountPercent, size = 'sm' }: PriceBlockProps) {
  const isLarge = size === 'lg';

  return (
    <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 tabular-nums">
      <span
        className={`font-bold text-[#282C3F] ${
          isLarge ? 'text-2xl leading-7' : 'text-sm leading-[18px]'
        }`}
      >
        {formatINR(price)}
      </span>
      {mrp > price && (
        <span
          className={`line-through text-[#94969F] ${
            isLarge ? 'text-base' : 'text-xs'
          }`}
        >
          {formatINR(mrp)}
        </span>
      )}
      {discountPercent > 0 && (
        <span
          className={`font-bold text-[#FF905A] tracking-[0.02em] ${
            isLarge ? 'text-base' : 'text-xs'
          }`}
        >
          ({discountPercent}% OFF)
        </span>
      )}
    </div>
  );
}
