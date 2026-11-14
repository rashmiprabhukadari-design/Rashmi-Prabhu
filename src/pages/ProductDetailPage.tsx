import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Heart,
  Loader2,
  MapPin,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  ZoomIn,
} from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { catalogService } from '../services/catalogService';
import { aiService } from '../services/aiService';
import { checkPincodeServiceability, formatINR } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type {
  ReviewSummaryResult,
  SizeRecommendationResult,
} from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { SafeImage } from '../components/common/SafeImage';
import { RatingBadge } from '../components/common/RatingBadge';
import { PriceBlock } from '../components/common/PriceBlock';
import { SizeSelector } from '../components/common/SizeSelector';
import { ProductCard } from '../components/common/ProductCard';
import { Carousel } from '../components/common/Carousel';
import { Modal } from '../components/common/Modal';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const products = useCatalogStore((s) => s.products);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const allCoupons = useCatalogStore((s) => s.coupons);
  const coupons = useMemo(
    () => allCoupons.filter((c) => c.active),
    [allCoupons]
  );
  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) =>
    id ? s.items.some((i) => i.productId === id) : false
  );
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const { savedPincode, setSavedPincode, addRecentlyViewed, recentlyViewedIds, user } =
    useAuthStore();
  const showToast = useToastStore((s) => s.showToast);

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  useDocumentTitle(product ? `${product.brand} ${product.title}` : 'Product Details');

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Pincode check
  const [pincode, setPincode] = useState(savedPincode || '560001');
  const [pincodeResult, setPincodeResult] = useState(() =>
    checkPincodeServiceability(savedPincode || '560001')
  );

  // Modals
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [aiSizeOpen, setAiSizeOpen] = useState(false);

  // AI Complete the Look
  const [lookLoading, setLookLoading] = useState(false);
  const [lookError, setLookError] = useState<string | null>(null);
  const [lookData, setLookData] = useState<{
    lookTitle: string;
    stylistNote: string;
    complementaryProductIds: string[];
  } | null>(null);

  // AI Review Summary
  const [reviewSummaryLoading, setReviewSummaryLoading] = useState(false);
  const [reviewSummaryError, setReviewSummaryError] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummaryResult | null>(null);

  // AI Size Recommendation
  const [heightCm, setHeightCm] = useState(172);
  const [weightKg, setWeightKg] = useState(68);
  const [usualSize, setUsualSize] = useState('M');
  const [preferredFit, setPreferredFit] = useState('Regular');
  const [sizeRecLoading, setSizeRecLoading] = useState(false);
  const [sizeRecError, setSizeRecError] = useState<string | null>(null);
  const [sizeRec, setSizeRec] = useState<SizeRecommendationResult | null>(null);

  // Review filter & new review
  const [reviewSort, setReviewSort] = useState<'recent' | 'helpful'>('helpful');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number>(0);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors[0]?.name ?? 'Standard');
    setSelectedSize('');
    setSizeError('');
    setActiveImageIdx(0);
    setZoomed(false);
    setLookData(null);
    setReviewSummary(null);
    setSizeRec(null);
    addRecentlyViewed(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  if (!product) {
    return (
      <div className="sk-container px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#282C3F] mb-2">
          Product Not Found
        </h1>
        <p className="text-sm text-[#535766] mb-6">
          This item may have been moved or removed from the catalog.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const activeVariant =
    product.colors.find((c) => c.name === selectedColor) || product.colors[0];
  const galleryImages =
    activeVariant?.images?.length ? activeVariant.images : product.images;
  const displayedImage = galleryImages[activeImageIdx] || product.images[0];

  const handleAddToBag = () => {
    const autoSize =
      product.sizes.length === 1 ? product.sizes[0].size : selectedSize;
    if (!autoSize) {
      setSizeError('Please select a size to continue.');
      return;
    }
    const sizeObj = product.sizes.find((s) => s.size === autoSize);
    if (sizeObj && sizeObj.stock <= 0) {
      setSizeError(`Size ${autoSize} is currently out of stock.`);
      return;
    }
    setSizeError('');
    addItem(product.id, autoSize, selectedColor || 'Standard', 1);
    showToast(`Added ${product.title} (${autoSize}) to Bag`);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pincode);
    setPincodeResult(res);
    if (res.serviceable) {
      setSavedPincode(pincode.trim());
    }
  };

  const handleCompleteTheLook = async () => {
    setLookLoading(true);
    setLookError(null);
    try {
      const res = await aiService.completeTheLook({
        targetProduct: product,
        products,
      });
      setLookData(res);
    } catch (err: unknown) {
      setLookError(
        err instanceof Error ? err.message : 'Unable to generate outfit pairing.'
      );
    } finally {
      setLookLoading(false);
    }
  };

  const handleReviewSummary = async () => {
    setReviewSummaryLoading(true);
    setReviewSummaryError(null);
    try {
      const res = await aiService.summarizeReviews({
        productTitle: product.title,
        reviews: product.reviews,
      });
      setReviewSummary(res);
    } catch (err: unknown) {
      setReviewSummaryError(
        err instanceof Error ? err.message : 'Unable to summarize reviews.'
      );
    } finally {
      setReviewSummaryLoading(false);
    }
  };

  const handleSizeRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSizeRecLoading(true);
    setSizeRecError(null);
    try {
      const res = await aiService.recommendSize({
        heightCm,
        weightKg,
        usualSize,
        preferredFit,
        product,
      });
      setSizeRec(res);
      if (
        product.sizes.some(
          (s) => s.size === res.recommendedSize && s.stock > 0
        )
      ) {
        setSelectedSize(res.recommendedSize);
        setSizeError('');
      }
    } catch (err: unknown) {
      setSizeRecError(
        err instanceof Error ? err.message : 'Size recommendation failed.'
      );
    } finally {
      setSizeRecLoading(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle.trim() || !newReviewComment.trim()) return;
    const nextReview = {
      id: `rev-${Date.now()}`,
      author: user?.name || 'Verified Shopper',
      rating: newReviewRating,
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verifiedPurchase: true,
      sizePurchased: selectedSize || product.sizes[0]?.size,
      helpfulCount: 0,
    };
    const nextReviews = [nextReview, ...product.reviews];
    const avg =
      nextReviews.reduce((acc, r) => acc + r.rating, 0) / nextReviews.length;
    updateProduct({
      ...product,
      reviews: nextReviews,
      rating: Number(avg.toFixed(1)),
      ratingCount: product.ratingCount + 1,
    });
    setNewReviewTitle('');
    setNewReviewComment('');
    showToast('Thank you! Your review has been posted.');
  };

  const similarProducts = catalogService.getSimilarProducts(product, 8);
  const recentlyViewedProducts = recentlyViewedIds
    .filter((rid) => rid !== product.id)
    .map((rid) => products.find((p) => p.id === rid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 6);

  const lookProducts = (lookData?.complementaryProductIds || [])
    .map((pid) => products.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sortedReviews = [...product.reviews]
    .filter((r) => (reviewRatingFilter > 0 ? r.rating === reviewRatingFilter : true))
    .sort((a, b) =>
      reviewSort === 'helpful'
        ? b.helpfulCount - a.helpfulCount
        : b.date.localeCompare(a.date)
    );

  return (
    <div className="sk-container px-4 md:px-10 py-6 pb-24 md:pb-16 space-y-12">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: product.gender.toUpperCase(), to: `/${product.gender}/all` },
          {
            label: product.category.replace(/-/g, ' ').toUpperCase(),
            to: `/${product.gender}/${product.category}`,
          },
          { label: product.brand },
        ]}
      />

      {/* Primary Two-Column Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery with thumbnails & zoom */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 lg:sticky lg:top-[88px]">
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto no-scrollbar sm:w-20 shrink-0">
            {galleryImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`w-16 sm:w-20 aspect-[3/4] rounded border overflow-hidden shrink-0 cursor-pointer transition-all ${
                  activeImageIdx === idx
                    ? 'border-[#FF3F6C] ring-1 ring-[#FF3F6C]'
                    : 'border-[#EAEAEC] opacity-80 hover:opacity-100'
                }`}
              >
                <SafeImage
                  src={img}
                  alt={`${product.title} view ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>

          <div
            onClick={() => setZoomed((z) => !z)}
            className="relative flex-1 aspect-[3/4] max-h-[680px] rounded border border-[#EAEAEC] bg-[#F5F5F6] overflow-hidden cursor-zoom-in"
          >
            <SafeImage
              src={displayedImage}
              alt={`${product.brand} ${product.title}`}
              eager
              className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                zoomed ? 'scale-125 cursor-zoom-out' : 'scale-100'
              }`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              aria-label={zoomed ? 'Zoom out image' : 'Zoom in image'}
              className="absolute bottom-3 right-3 h-9 px-3 rounded-full bg-white/90 text-[#282C3F] text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{zoomed ? 'Reset' : 'Zoom'}</span>
            </button>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="pb-4 border-b border-[#EAEAEC]">
            <p className="text-sm font-extrabold uppercase tracking-[0.06em] text-[#282C3F]">
              {product.brand}
            </p>
            <h1 className="text-xl md:text-2xl font-medium text-[#535766] mt-0.5 leading-snug">
              {product.title}
            </h1>
            <div className="mt-3">
              <RatingBadge
                rating={product.rating}
                count={product.ratingCount}
                variant="inline"
              />
            </div>
          </div>

          {/* Price Block */}
          <div>
            <PriceBlock
              price={product.price}
              mrp={product.mrp}
              discountPercent={product.discountPercent}
              size="lg"
            />
            <p className="text-xs font-semibold text-[#14958F] mt-1">
              inclusive of all taxes
            </p>
          </div>

          {/* Color Variants */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
                Color:{' '}
                <span className="font-semibold text-[#535766] normal-case">
                  {selectedColor}
                </span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const active = c.name === selectedColor;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setActiveImageIdx(0);
                      }}
                      aria-label={`Select color ${c.name}`}
                      aria-pressed={active}
                      className={`h-9 px-3 rounded-full border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        active
                          ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                          : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#282C3F]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector + Size Chart + AI Size Recommender */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                Select Size
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAiSizeOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#14958F] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  AI Size Finder
                </button>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
                  Size Chart
                </button>
              </div>
            </div>

            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelect={(sz) => {
                setSelectedSize(sz);
                setSizeError('');
              }}
            />

            {sizeError && (
              <p role="alert" className="text-xs font-semibold text-[#ba1a1a] mt-2">
                {sizeError}
              </p>
            )}
          </div>

          {/* Primary Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddToBag}
              className="flex-1 h-12 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Add to Bag</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const added = toggleWishlist(product.id, product.price);
                showToast(
                  added
                    ? `Saved "${product.title}" to Wishlist`
                    : `Removed from Wishlist`,
                  'info'
                );
              }}
              aria-pressed={isWishlisted}
              className={`h-12 px-5 rounded-lg border text-xs font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isWishlisted
                  ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                  : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#282C3F]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-[#FF3F6C]' : ''}`}
                aria-hidden="true"
              />
              <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/bag')}
            className="w-full h-10 rounded-lg bg-[#F5F5F6] hover:bg-[#EAEAEF] text-xs font-bold uppercase tracking-wider text-[#282C3F] transition-colors cursor-pointer"
          >
            Go to Bag &amp; Checkout
          </button>

          {/* Delivery Pincode Checker */}
          <div className="pt-4 border-t border-[#EAEAEC] space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#535766]" aria-hidden="true" />
              Delivery Options
            </h2>
            <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-xs">
              <div className="relative flex-1">
                <MapPin
                  className="w-3.5 h-3.5 text-[#94969F] absolute left-3 top-3.5"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter pincode"
                  aria-label="Delivery pincode"
                  className="w-full h-10 pl-8 pr-3 rounded border border-[#EAEAEC] text-xs font-medium text-[#282C3F] focus:border-[#282C3F] outline-none tabular-nums"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:border-[#FF3F6C] cursor-pointer"
              >
                Check
              </button>
            </form>
            {pincodeResult.serviceable ? (
              <div className="text-xs space-y-1">
                <p className="font-semibold text-[#14958F] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  {pincodeResult.message}
                </p>
                <p className="text-[#535766]">
                  {pincodeResult.codAvailable
                    ? 'Pay on delivery (COD) available'
                    : 'Prepaid only for this pincode'}
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium text-[#ba1a1a]">
                {pincodeResult.message}
              </p>
            )}
          </div>

          {/* Best Offers & Coupons */}
          <div className="pt-4 border-t border-[#EAEAEC] space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Best Offers &amp; Coupons
            </h2>
            <div className="space-y-2">
              {coupons.slice(0, 3).map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded border border-dashed border-[#FF3F6C] bg-[#FFF0F4]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#282C3F]">
                      {coupon.title} ·{' '}
                      <span className="font-mono-tabular text-[#FF3F6C]">
                        {coupon.code}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#535766] truncate">
                      {coupon.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(coupon.code);
                      showToast(`Copied coupon ${coupon.code}`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#FF3F6C]/30 text-[11px] font-bold text-[#FF3F6C] shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details & Fabric Highlights */}
          <div className="pt-4 border-t border-[#EAEAEC] space-y-3 text-xs text-[#535766]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
              Product Details
            </h2>
            <p className="leading-relaxed text-sm text-[#282C3F]">
              {product.description}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-[#F5F5F6]">
                <span className="block text-[10px] uppercase tracking-wider text-[#94969F] font-bold">
                  Fabric
                </span>
                <span className="font-semibold text-[#282C3F]">{product.fabric}</span>
              </div>
              <div className="p-2.5 rounded bg-[#F5F5F6]">
                <span className="block text-[10px] uppercase tracking-wider text-[#94969F] font-bold">
                  Fit
                </span>
                <span className="font-semibold text-[#282C3F]">{product.fit} Fit</span>
              </div>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {product.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
              <li>Care: {product.careInstructions}</li>
            </ul>
            <p className="flex items-center gap-1.5 text-[11px] text-[#14958F] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% Authentic StyleKart Verified Quality
            </p>
          </div>
        </div>
      </div>

      {/* AI Feature: Complete the Look */}
      <section className="border border-[#EAEAEC] rounded-lg p-5 md:p-7 bg-[#FAF8FF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF3F6C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Outfit Pairing
            </p>
            <h2 className="text-lg md:text-xl font-bold text-[#282C3F] mt-0.5">
              {lookData ? lookData.lookTitle : 'Complete the Look'}
            </h2>
            <p className="text-xs text-[#535766] mt-0.5">
              {lookData
                ? lookData.stylistNote
                : 'Let Gemini curate 3–4 complementary items from the StyleKart catalog to pair with this piece.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCompleteTheLook}
            disabled={lookLoading}
            className="h-10 px-5 rounded-lg bg-[#282C3F] hover:bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors cursor-pointer disabled:opacity-60"
          >
            {lookLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Curating Look...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FF905A]" />
                <span>{lookData ? 'Refresh Pairing' : 'Style This Piece'}</span>
              </>
            )}
          </button>
        </div>

        {lookError && (
          <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded">
            {lookError}
          </p>
        )}

        {lookProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {lookProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Ratings, Smart Review Summary & Reviews */}
      <section className="border-t border-[#EAEAEC] pt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#282C3F]">
              Customer Ratings &amp; Reviews
            </h2>
            <p className="text-xs text-[#535766]">
              Verified shopper feedback &amp; AI review synthesis
            </p>
          </div>

          <button
            type="button"
            onClick={handleReviewSummary}
            disabled={reviewSummaryLoading}
            className="h-10 px-4 rounded-lg border border-[#282C3F] bg-white hover:bg-[#282C3F] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit transition-colors cursor-pointer"
          >
            {reviewSummaryLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FF3F6C]" />
                <span>AI Smart Review Summary</span>
              </>
            )}
          </button>
        </div>

        {reviewSummaryError && (
          <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded">
            {reviewSummaryError}
          </p>
        )}

        {reviewSummary && (
          <div className="p-5 rounded-lg border border-[#EAEAEC] bg-[#FFF0F4]/50 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C]">
                AI Review Synthesis
              </span>
              <span className="text-xs font-semibold text-[#14958F]">
                Fit Verdict: {reviewSummary.fitVerdict}
              </span>
            </div>
            <p className="text-sm text-[#282C3F]">{reviewSummary.overallSentiment}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-white p-3.5 rounded border border-[#EAEAEC]">
                <p className="text-xs font-bold text-[#14958F] uppercase tracking-wider mb-1.5">
                  What Shoppers Love
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#282C3F]">
                  {reviewSummary.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-3.5 rounded border border-[#EAEAEC]">
                <p className="text-xs font-bold text-[#FF905A] uppercase tracking-wider mb-1.5">
                  Things to Note
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#282C3F]">
                  {reviewSummary.cons.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Rating Breakdown + Add Review */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-4 rounded border border-[#EAEAEC] bg-white space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#282C3F] tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
                <Star className="w-5 h-5 fill-[#14958F] text-[#14958F]" />
                <span className="text-xs text-[#535766]">
                  based on {product.ratingCount.toLocaleString('en-IN')} ratings
                </span>
              </div>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = product.reviews.filter((r) => r.rating === star).length;
                const pct = product.reviews.length
                  ? Math.round((count / product.reviews.length) * 100)
                  : 0;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewRatingFilter((prev) => (prev === star ? 0 : star))
                    }
                    className="w-full flex items-center gap-2 text-xs cursor-pointer group"
                  >
                    <span className="w-6 text-left font-semibold text-[#282C3F] tabular-nums">
                      {star}★
                    </span>
                    <div className="flex-1 h-2 bg-[#F5F5F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14958F] rounded-full"
                        style={{ width: `${pct || (star === 5 ? 62 : star === 4 ? 26 : 12)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#94969F] tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={handleSubmitReview}
              className="p-4 rounded border border-[#EAEAEC] bg-white space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#282C3F]">
                Write a Review
              </h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewReviewRating(n)}
                    aria-label={`Rate ${n} stars`}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        n <= newReviewRating
                          ? 'fill-[#FF905A] text-[#FF905A]'
                          : 'text-[#EAEAEC]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                placeholder="Review headline"
                className="w-full h-10 px-3 rounded border border-[#EAEAEC] text-xs outline-none focus:border-[#282C3F]"
              />
              <textarea
                required
                rows={3}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Share fit, fabric & quality impressions..."
                className="w-full p-3 rounded border border-[#EAEAEC] text-xs outline-none focus:border-[#282C3F]"
              />
              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-[#282C3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#FF3F6C] transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#535766]">
                Showing {sortedReviews.length} reviews
                {reviewRatingFilter > 0 && ` (${reviewRatingFilter}★ only)`}
              </p>
              <select
                aria-label="Sort reviews"
                value={reviewSort}
                onChange={(e) =>
                  setReviewSort(e.target.value as 'recent' | 'helpful')
                }
                className="h-8 px-2.5 rounded border border-[#EAEAEC] text-xs font-semibold text-[#282C3F]"
              >
                <option value="helpful">Most Helpful</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>

            <div className="divide-y divide-[#EAEAEC] border border-[#EAEAEC] rounded bg-white">
              {sortedReviews.map((rev) => (
                <article key={rev.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#14958F] text-white text-[10px] font-bold">
                        {rev.rating} ★
                      </span>
                      <h4 className="text-xs font-bold text-[#282C3F]">
                        {rev.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#94969F]">{rev.date}</span>
                  </div>
                  <p className="text-xs text-[#535766] leading-relaxed">
                    {rev.comment}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#94969F]">
                    <span className="font-semibold text-[#282C3F]">
                      {rev.author}
                    </span>
                    {rev.verifiedPurchase && (
                      <span>· Verified Buyer</span>
                    )}
                    {rev.sizePurchased && (
                      <span>· Size {rev.sizePurchased}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Similar Products */}
      <section>
        <Carousel title="Similar Styles You May Like">
          {similarProducts.map((p) => (
            <div key={p.id} className="w-[175px] sm:w-[220px] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <section>
          <Carousel title="Recently Viewed">
            {recentlyViewedProducts.map((p) => (
              <div key={p.id} className="w-[175px] sm:w-[220px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {/* Size Chart Modal */}
      <Modal
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        title="StyleKart Size Guide"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#535766]">
            Garment measurements in inches. Choose your size according to chest/bust &amp; waist fit.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[#EAEAEC] bg-[#F5F5F6] text-[#282C3F]">
                  <th className="p-2.5 font-bold">Size</th>
                  <th className="p-2.5 font-bold">Chest / Bust</th>
                  <th className="p-2.5 font-bold">Waist</th>
                  <th className="p-2.5 font-bold">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEC]">
                {[
                  ['XS', '34-36', '26-28', '16.0'],
                  ['S', '36-38', '28-30', '16.5'],
                  ['M', '38-40', '30-32', '17.2'],
                  ['L', '40-42', '32-34', '18.0'],
                  ['XL', '42-44', '34-36', '18.8'],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="p-2.5 font-bold text-[#282C3F]">{row[0]}</td>
                    <td className="p-2.5 text-[#535766]">{row[1]}&quot;</td>
                    <td className="p-2.5 text-[#535766]">{row[2]}&quot;</td>
                    <td className="p-2.5 text-[#535766]">{row[3]}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* AI Size Recommendation Modal */}
      <Modal
        open={aiSizeOpen}
        onClose={() => setAiSizeOpen(false)}
        title="AI Size Recommendation"
      >
        <form onSubmit={handleSizeRecommendation} className="space-y-4 text-xs">
          <p className="text-[#535766]">
            Enter your measurements and preferred fit. Gemini factors in{' '}
            <strong className="text-[#282C3F]">{product.fabric}</strong> drape and{' '}
            <strong className="text-[#282C3F]">{product.fit} Fit</strong> cut.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#282C3F] mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min={120}
                max={220}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-[#282C3F] mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min={30}
                max={160}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC] tabular-nums"
              />
            </div>
            <div>
              <label className="block font-bold text-[#282C3F] mb-1">
                Usual Size
              </label>
              <select
                value={usualSize}
                onChange={(e) => setUsualSize(e.target.value)}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
              >
                {product.sizes.map((s) => (
                  <option key={s.size} value={s.size}>
                    {s.size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#282C3F] mb-1">
                Preferred Fit
              </label>
              <select
                value={preferredFit}
                onChange={(e) => setPreferredFit(e.target.value)}
                className="w-full h-10 px-3 rounded border border-[#EAEAEC]"
              >
                <option value="Snug">Snug / Tailored</option>
                <option value="Regular">Regular / True</option>
                <option value="Relaxed">Relaxed / Roomy</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={sizeRecLoading}
            className="w-full h-11 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {sizeRecLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating Best Fit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find My Size</span>
              </>
            )}
          </button>

          {sizeRecError && (
            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-2.5 rounded">
              {sizeRecError}
            </p>
          )}

          {sizeRec && (
            <div className="p-4 rounded-lg bg-[#FFF0F4] border border-[#FF3F6C]/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#FF3F6C]">
                  Recommended Size: {sizeRec.recommendedSize}
                </span>
                <span className="text-[11px] font-semibold text-[#14958F]">
                  {sizeRec.confidence}
                </span>
              </div>
              <p className="text-xs text-[#282C3F] leading-relaxed">
                {sizeRec.reasoning}
              </p>
              <p className="text-[11px] text-[#535766]">{sizeRec.fitNotes}</p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
