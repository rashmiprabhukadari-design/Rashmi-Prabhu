import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { HOME_CATEGORIES } from '../data/categories';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SafeImage } from '../components/common/SafeImage';
import { ProductCard } from '../components/common/ProductCard';
import { Carousel } from '../components/common/Carousel';

function useDealCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(5 * 3600 + 42 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 6 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  return { hrs, mins, secs };
}

export default function HomePage() {
  useDocumentTitle('Online Fashion, Footwear, Beauty & Lifestyle Store');
  const allBanners = useCatalogStore((s) => s.banners);
  const banners = useMemo(
    () => allBanners.filter((b) => b.active),
    [allBanners]
  );
  const products = useCatalogStore((s) => s.products);
  const brands = useCatalogStore((s) => s.brands);

  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const countdown = useDealCountdown();

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length, paused]);

  const safeIdx = banners.length > 0 ? slideIdx % banners.length : 0;
  const activeBanner = banners[safeIdx];

  const dealProducts = useMemo(
    () => products.filter((p) => p.isDealOfDay).slice(0, 8),
    [products]
  );

  const recommendedProducts = useMemo(
    () => products.filter((p) => p.isTrending).slice(0, 12),
    [products]
  );

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Auto-Play Carousel */}
      {activeBanner && (
        <section
          aria-label="Featured Campaigns"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative w-full overflow-hidden bg-[#F5F5F6]"
        >
          <div className="sk-container relative aspect-[16/10] sm:aspect-[16/7] max-h-[540px] w-full overflow-hidden">
            <SafeImage
              src={activeBanner.image}
              alt={activeBanner.title}
              eager
              className="w-full h-full object-cover object-[50%_18%] transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#171B28]/80 via-[#171B28]/35 to-transparent" />

            <div className="absolute inset-0 flex items-center px-14 sm:px-20 lg:px-24">
              <div className="max-w-xl text-white space-y-3 md:space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF905A]">
                  {activeBanner.kicker}
                </p>
                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight tracking-tight text-balance">
                  {activeBanner.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-md leading-relaxed">
                  {activeBanner.subtitle}
                </p>
                <div className="pt-1">
                  <Link
                    to={activeBanner.ctaLink}
                    className="inline-flex items-center gap-2 h-11 md:h-12 px-6 md:px-8 rounded-lg bg-[#FF3F6C] hover:bg-[#E6325D] text-white text-xs font-bold uppercase tracking-[0.06em] transition-colors"
                  >
                    <span>{activeBanner.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIdx(
                      (prev) => (prev - 1 + banners.length) % banners.length
                    )
                  }
                  aria-label="Previous campaign slide"
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#282C3F] items-center justify-center shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % banners.length)}
                  aria-label="Next campaign slide"
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#282C3F] items-center justify-center shadow-md cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {banners.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSlideIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}: ${b.title}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === safeIdx
                          ? 'w-7 bg-[#FF3F6C]'
                          : 'w-2 bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. Shop by Category Icons */}
      <section className="sk-container px-4 md:px-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#282C3F]">
              Shop by Category
            </h2>
            <p className="text-sm text-[#535766]">
              Explore curated styles across every wardrobe essential
            </p>
          </div>
          <Link
            to="/women/all"
            className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline whitespace-nowrap"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 md:gap-4">
          {HOME_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/${cat.gender}/${cat.categorySlug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-[3/4] rounded border border-[#EAEAEC] overflow-hidden bg-[#F5F5F6] mb-2">
                <SafeImage
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-bold text-[#282C3F] group-hover:text-[#FF3F6C] transition-colors leading-tight">
                {cat.label}
              </span>
              <span className="text-[10px] font-bold text-[#FF905A] uppercase tracking-wider mt-0.5">
                {cat.offerText}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Deal of the Day with Live Countdown */}
      <section className="bg-[#FAF8FF] border-y border-[#EAEAEC] py-10">
        <div className="sk-container px-4 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF3F6C] mb-1">
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Flash Runway Markdowns</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#282C3F]">
                Deals of the Day
              </h2>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-[#EAEAEC] w-fit">
              <Clock className="w-4 h-4 text-[#FF905A]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#535766]">Ends in</span>
              <div
                aria-label={`Deal ends in ${countdown.hrs} hours ${countdown.mins} minutes ${countdown.secs} seconds`}
                className="font-mono-tabular text-sm font-bold text-[#282C3F]"
              >
                {countdown.hrs}:{countdown.mins}:{countdown.secs}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Brands & Offer Tiles */}
      <section className="sk-container px-4 md:px-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#282C3F]">
              Trending Brands &amp; Exclusive Offers
            </h2>
            <p className="text-sm text-[#535766]">
              20 curated labels with season-best markdowns
            </p>
          </div>
          <Link
            to="/men/all?sort=discount"
            className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline whitespace-nowrap"
          >
            All Offers
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
          {brands.slice(0, 10).map((brand) => (
            <Link
              key={brand.id}
              to={`/search?q=${encodeURIComponent(brand.name)}`}
              className="group border border-[#EAEAEC] rounded overflow-hidden bg-white sk-card-hover flex flex-col"
            >
              <div className="aspect-[3/4] w-full bg-[#F5F5F6] overflow-hidden relative">
                <SafeImage
                  src={brand.image}
                  alt={brand.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171B28]/85 via-[#171B28]/40 to-transparent p-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF905A]">
                    {brand.discountBadge}
                  </p>
                  <p className="text-sm font-extrabold tracking-wide uppercase truncate">
                    {brand.name}
                  </p>
                  <p className="text-xs text-white/90 font-semibold">
                    {brand.offerText}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Compact Remaining Brand Offer Directory */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {brands.slice(10, 20).map((brand) => (
            <Link
              key={brand.id}
              to={`/search?q=${encodeURIComponent(brand.name)}`}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded border border-[#EAEAEC] bg-white hover:border-[#FF3F6C] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-[#282C3F] truncate">
                  {brand.name}
                </p>
                <p className="text-[11px] text-[#535766] truncate">
                  {brand.tagline}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#FF3F6C] shrink-0">
                {brand.offerText}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Recommended For You Carousel */}
      <section className="sk-container px-4 md:px-10">
        <Carousel
          title="Recommended For You"
          subtitle="Top-rated runway pieces loved by StyleKart shoppers"
          action={
            <Link
              to="/women/all?sort=rating"
              className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline whitespace-nowrap mr-2"
            >
              Explore More
            </Link>
          }
        >
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              className="w-[175px] sm:w-[220px] md:w-[250px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </Carousel>
      </section>
    </div>
  );
}
