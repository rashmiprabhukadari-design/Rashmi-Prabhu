import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import {
  calculatePriceBreakup,
  formatINR,
  validateCoupon,
} from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SafeImage } from '../components/common/SafeImage';
import { EmptyState } from '../components/common/EmptyState';

export default function BagPage() {
  useDocumentTitle('Shopping Bag');
  const navigate = useNavigate();

  const {
    items,
    appliedCouponCode,
    updateQuantity,
    updateSize,
    removeItem,
    applyCoupon,
  } = useCartStore();
  const products = useCatalogStore((s) => s.products);
  const coupons = useCatalogStore((s) => s.coupons);
  const orders = useCatalogStore((s) => s.orders);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const showToast = useToastStore((s) => s.showToast);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const isFirstOrder = orders.length === 0;
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const activeCoupon = appliedCouponCode
    ? coupons.find((c) => c.code === appliedCouponCode) ?? null
    : null;

  const breakup = useMemo(
    () => calculatePriceBreakup(items, products, activeCoupon, isFirstOrder),
    [items, products, activeCoupon, isFirstOrder]
  );

  const resolvedItems = items
    .map((item) => ({ item, product: productMap.get(item.productId) }))
    .filter(
      (x): x is { item: typeof items[number]; product: NonNullable<typeof x.product> } =>
        Boolean(x.product)
    );

  const handleApplyCoupon = (codeToTry: string) => {
    const clean = codeToTry.trim().toUpperCase();
    if (!clean) {
      setCouponError('Enter a coupon code.');
      return;
    }
    const found = coupons.find((c) => c.code === clean);
    const check = validateCoupon(found, breakup.subtotal, isFirstOrder);
    if (!check.valid) {
      setCouponError(check.reason || 'Invalid coupon.');
      return;
    }
    setCouponError('');
    applyCoupon(clean);
    setCouponInput('');
    showToast(`Coupon ${clean} applied!`);
  };

  if (resolvedItems.length === 0) {
    return (
      <div className="sk-container px-4 md:px-10 py-10 pb-16">
        <EmptyState
          icon={ShoppingBag}
          title="Hey, it feels so light!"
          description="There is nothing in your bag. Let's add some runway essentials or move items from your wishlist."
          ctaLabel="Add Items From Wishlist"
          ctaTo="/wishlist"
        />
      </div>
    );
  }

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-20">
      <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#282C3F]">
          Shopping Bag{' '}
          <span className="text-sm font-normal text-[#535766] tabular-nums">
            ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
        </h1>
        <p className="text-xs font-semibold text-[#14958F]">
          Free shipping above ₹999
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Bag Items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free shipping threshold bar */}
          <div className="p-3.5 rounded border border-[#EAEAEC] bg-[#FAF8FF] flex items-center gap-3 text-xs">
            <Truck className="w-4 h-4 text-[#14958F] shrink-0" />
            {breakup.shippingFee === 0 ? (
              <p className="font-semibold text-[#14958F]">
                Yay! You unlocked FREE Express Shipping on this order.
              </p>
            ) : (
              <p className="text-[#282C3F]">
                Add{' '}
                <strong className="text-[#FF3F6C] tabular-nums">
                  {formatINR(breakup.amountToFreeShipping)}
                </strong>{' '}
                more to get FREE Express Shipping (or apply{' '}
                <span className="font-mono-tabular font-bold">FREESHIP</span>).
              </p>
            )}
          </div>

          {resolvedItems.map(({ item, product }) => {
            const availableSizes = product.sizes.filter((s) => s.stock > 0);
            return (
              <article
                key={item.id}
                className="flex gap-4 p-4 border border-[#EAEAEC] rounded bg-white"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="w-24 sm:w-28 aspect-[3/4] bg-[#F5F5F6] rounded overflow-hidden shrink-0"
                >
                  <SafeImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[#282C3F]">
                        {product.brand}
                      </p>
                      <Link
                        to={`/product/${product.id}`}
                        className="text-sm font-medium text-[#535766] hover:text-[#FF3F6C] truncate block"
                      >
                        {product.title}
                      </Link>
                      <p className="text-[11px] text-[#94969F] mt-0.5">
                        Color: {item.selectedColor}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id);
                        showToast(`Removed "${product.title}" from Bag`, 'info');
                      }}
                      aria-label={`Remove ${product.title} from bag`}
                      className="text-[#94969F] hover:text-[#ba1a1a] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size & Qty Selectors */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#282C3F] bg-[#F5F5F6] px-2.5 py-1 rounded">
                      <span>Size:</span>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => updateSize(item.id, e.target.value)}
                        aria-label={`Size for ${product.title}`}
                        className="bg-transparent font-bold outline-none cursor-pointer"
                      >
                        {(availableSizes.length ? availableSizes : product.sizes).map(
                          (sz) => (
                            <option key={sz.size} value={sz.size}>
                              {sz.size}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <div className="inline-flex items-center border border-[#EAEAEC] rounded">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${product.title}`}
                        className="w-7 h-7 flex items-center justify-center text-[#282C3F] hover:bg-[#F5F5F6] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity for ${product.title}`}
                        className="w-7 h-7 flex items-center justify-center text-[#282C3F] hover:bg-[#F5F5F6] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row Price + Move to Wishlist */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F5F5F6]">
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="text-sm font-bold text-[#282C3F]">
                        {formatINR(product.price * item.quantity)}
                      </span>
                      <span className="text-xs line-through text-[#94969F]">
                        {formatINR(product.mrp * item.quantity)}
                      </span>
                      <span className="text-xs font-bold text-[#FF905A]">
                        ({product.discountPercent}% OFF)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!wishlistItems.some((w) => w.productId === product.id)) {
                          toggleWishlist(product.id, product.price);
                        }
                        removeItem(item.id);
                        showToast(`Moved "${product.title}" to Wishlist`, 'info');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#535766] hover:text-[#FF3F6C] cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      Move to Wishlist
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Right: Coupons & Price Breakup */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-[88px]">
          {/* Coupon Box */}
          <div className="p-4 border border-[#EAEAEC] rounded bg-white space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF3F6C]" />
              Apply Coupon
            </h2>

            {breakup.couponCode ? (
              <div className="flex items-center justify-between px-3 py-2 rounded border border-dashed border-[#14958F] bg-[#14958F]/5 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#14958F]" />
                  <div>
                    <p className="font-bold text-[#282C3F] font-mono-tabular">
                      {breakup.couponCode} applied
                    </p>
                    <p className="text-[11px] text-[#14958F]">
                      You save {formatINR(breakup.couponDiscount || 99)}!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => applyCoupon(null)}
                  aria-label="Remove coupon"
                  className="text-[#535766] hover:text-[#ba1a1a] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyCoupon(couponInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder="Enter code (e.g. STYLE200)"
                  aria-label="Coupon code"
                  className="flex-1 h-10 px-3 rounded border border-[#EAEAEC] text-xs font-mono-tabular uppercase outline-none focus:border-[#282C3F]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded border border-[#FF3F6C] text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p role="alert" className="text-xs text-[#ba1a1a] font-medium">
                {couponError}
              </p>
            )}

            {/* Quick Available Coupons */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#94969F]">
                Available Vouchers
              </p>
              {coupons
                .filter((c) => c.active)
                .map((c) => {
                  const check = validateCoupon(c, breakup.subtotal, isFirstOrder);
                  return (
                    <div
                      key={c.code}
                      className="flex items-center justify-between gap-2 p-2 rounded bg-[#F5F5F6] text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-mono-tabular font-bold text-[#282C3F]">
                          {c.code}
                        </span>
                        <p className="text-[11px] text-[#535766] truncate">
                          {c.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!check.valid || breakup.couponCode === c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        className="text-[11px] font-bold uppercase text-[#FF3F6C] disabled:text-[#94969F] shrink-0 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {breakup.couponCode === c.code ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Price Details Breakup */}
          <div className="p-4 border border-[#EAEAEC] rounded bg-white space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#535766]">
              Price Details ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            <div className="space-y-2.5 tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#535766]">Total MRP</span>
                <span className="font-medium text-[#282C3F]">
                  {formatINR(breakup.totalMrp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#535766]">Discount on MRP</span>
                <span className="font-semibold text-[#14958F]">
                  -{formatINR(breakup.productDiscount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#535766]">Coupon Discount</span>
                {breakup.couponDiscount > 0 ? (
                  <span className="font-semibold text-[#14958F]">
                    -{formatINR(breakup.couponDiscount)}
                  </span>
                ) : (
                  <span className="text-[#FF3F6C] font-semibold">
                    {breakup.couponCode === 'FREESHIP' ? 'Free Shipping' : 'None'}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-[#535766]">Shipping Fee</span>
                {breakup.shippingFee === 0 ? (
                  <span className="font-semibold text-[#14958F]">FREE</span>
                ) : (
                  <span className="font-medium text-[#282C3F]">
                    {formatINR(breakup.shippingFee)}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-[#EAEAEC] flex justify-between text-sm font-extrabold text-[#282C3F]">
                <span>Total Amount</span>
                <span>{formatINR(breakup.totalPayable)}</span>
              </div>
            </div>

            {breakup.totalSavings > 0 && (
              <div className="px-3 py-2 rounded bg-[#14958F]/10 text-[#14958F] text-xs font-bold text-center">
                You are saving {formatINR(breakup.totalSavings)} on this order!
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full h-12 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-[0.06em] transition-colors cursor-pointer"
            >
              Place Order
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
