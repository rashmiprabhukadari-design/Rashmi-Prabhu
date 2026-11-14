import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { SafeImage } from './SafeImage';
import { RatingBadge } from './RatingBadge';
import { PriceBlock } from './PriceBlock';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  showQuickAdd = true,
}: ProductCardProps) {
  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  const firstAvailableSize =
    product.sizes.find((s) => s.stock > 0)?.size ?? product.sizes[0]?.size ?? 'M';
  const defaultColor = product.colors[0]?.name ?? 'Standard';

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id, product.price);
    showToast(
      added ? `Saved "${product.title}" to Wishlist` : `Removed from Wishlist`,
      'info'
    );
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, firstAvailableSize, defaultColor, 1);
    showToast(`Added ${product.title} (${firstAvailableSize}) to Bag`);
  };

  return (
    <article className="group relative flex flex-col bg-white border border-[#EAEAEC] rounded overflow-hidden sk-card-hover">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-[3/4] w-full bg-[#F5F5F6] overflow-hidden"
      >
        <SafeImage
          src={product.images[0]}
          alt={`${product.brand} ${product.title}`}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Floating bottom-left frosted rating badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <RatingBadge rating={product.rating} count={product.ratingCount} />
        </div>

        {/* Price drop indicator if applicable */}
        {product.priceDropFrom && product.priceDropFrom > product.price && (
          <div className="absolute top-2.5 left-2.5 z-10 rounded bg-[#14958F] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Price Drop
          </div>
        )}

        {/* Quick add on desktop hover */}
        {showQuickAdd && (
          <div className="hidden md:flex absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${product.title} to bag`}
              className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#282C3F] shadow-sm hover:bg-[#FF3F6C] hover:text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              Add ({firstAvailableSize})
            </button>
          </div>
        )}
      </Link>

      {/* Floating top-right circular wishlist button */}
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={
          isWishlisted
            ? `Remove ${product.title} from wishlist`
            : `Add ${product.title} to wishlist`
        }
        aria-pressed={isWishlisted}
        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(40,44,63,0.12)] hover:scale-105 transition-transform cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-[#FF3F6C] text-[#FF3F6C]' : 'text-[#282C3F]'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Card content area */}
      <Link
        to={`/product/${product.id}`}
        className="flex flex-col px-3 pt-2.5 pb-3 bg-white"
      >
        <h3 className="text-sm font-bold uppercase tracking-[0.04em] text-[#282C3F] truncate leading-5">
          {product.brand}
        </h3>
        <p className="text-xs text-[#535766] truncate mb-1.5 leading-4">
          {product.title}
        </p>
        <PriceBlock
          price={product.price}
          mrp={product.mrp}
          discountPercent={product.discountPercent}
        />
      </Link>
    </article>
  );
});
