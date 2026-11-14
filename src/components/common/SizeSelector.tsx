import type { SizeStock } from '../../types';

interface SizeSelectorProps {
  sizes: SizeStock[];
  selectedSize: string;
  onSelect: (size: string) => void;
  showLowStockHint?: boolean;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  showLowStockHint = true,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select size">
      {sizes.map((item) => {
        const isOutOfStock = item.stock <= 0;
        const isSelected = selectedSize === item.size;
        const isLow = item.stock > 0 && item.stock <= 4;

        return (
          <div key={item.size} className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={isOutOfStock}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Size ${item.size}${isOutOfStock ? ' (Out of stock)' : ''}`}
              onClick={() => onSelect(item.size)}
              className={`relative min-w-[46px] h-11 px-3 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed ${
                isOutOfStock
                  ? 'bg-[#F5F5F6] text-[#94969F] border border-[#EAEAEC]'
                  : isSelected
                    ? 'bg-[#FFF0F4] text-[#FF3F6C] border-[1.5px] border-[#FF3F6C]'
                    : 'bg-white text-[#282C3F] border border-[#EAEAEC] hover:border-[#282C3F]'
              }`}
            >
              <span>{item.size}</span>
              {isOutOfStock && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-1.5 top-1/2 h-[1.5px] -rotate-12 bg-[#94969F]/60"
                />
              )}
            </button>
            {showLowStockHint && isLow && !isOutOfStock && (
              <span className="text-[10px] font-semibold text-[#FF905A] leading-none">
                {item.stock} left
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
