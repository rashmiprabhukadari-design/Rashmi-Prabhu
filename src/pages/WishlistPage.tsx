import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, TrendingDown } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatINR } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SafeImage } from '../components/common/SafeImage';
import { PriceBlock } from '../components/common/PriceBlock';
import { EmptyState } from '../components/common/EmptyState';

export default function WishlistPage() {
  useDocumentTitle('My Wishlist');
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const products = useCatalogStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const resolved = wishlistItems
    .map((w) => ({ wishlist: w, product: productMap.get(w.productId) }))
    .filter(
      (entry): entry is { wishlist: typeof wishlistItems[number]; product: NonNullable<typeof entry.product> } =>
        Boolean(entry.product)
    );

  const handleMoveToBag = (productId: string) => {
    const product = productMap.get(productId);
    if (!product) return;
    const size =
      product.sizes.find((s) => s.stock > 0)?.size ??
      product.sizes[0]?.size ??
      'M';
    addItem(product.id, size, product.colors[0]?.name ?? 'Standard', 1);
    removeItem(product.id);
    showToast(`Moved "${product.title}" (${size}) to Bag`);
  };

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-16 space-y-6">
      <div className="flex items-baseline gap-2 border-b border-[#EAEAEC] pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#282C3F]">
          My Wishlist
        </h1>
        <span className="text-sm text-[#535766] tabular-nums">
          {resolved.length} {resolved.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {resolved.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love here so you can track price drops and move them to your bag anytime."
          ctaLabel="Explore Trending Styles"
          ctaTo="/women/all"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {resolved.map(({ wishlist, product }) => {
            const dropAmount =
              product.priceDropFrom && product.priceDropFrom > product.price
                ? product.priceDropFrom - product.price
                : wishlist.addedPrice > product.price
                  ? wishlist.addedPrice - product.price
                  : 0;

            return (
              <article
                key={product.id}
                className="relative flex flex-col border border-[#EAEAEC] rounded bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    removeItem(product.id);
                    showToast('Removed from Wishlist', 'info');
                  }}
                  aria-label={`Remove ${product.title} from wishlist`}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 border border-[#EAEAEC] flex items-center justify-center text-[#535766] hover:text-[#ba1a1a] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {dropAmount > 0 && (
                  <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded bg-[#14958F] px-2 py-0.5 text-[10px] font-bold text-white">
                    <TrendingDown className="w-3 h-3" />
                    Price Dropped {formatINR(dropAmount)}
                  </div>
                )}

                <Link
                  to={`/product/${product.id}`}
                  className="aspect-[3/4] w-full bg-[#F5F5F6] overflow-hidden"
                >
                  <SafeImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#282C3F] truncate">
                      {product.brand}
                    </p>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-xs text-[#535766] truncate block mb-1.5 hover:text-[#FF3F6C]"
                    >
                      {product.title}
                    </Link>
                    <PriceBlock
                      price={product.price}
                      mrp={product.mrp}
                      discountPercent={product.discountPercent}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoveToBag(product.id)}
                    className="w-full h-10 mt-2 rounded border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white hover:border-[#FF3F6C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Bag
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
