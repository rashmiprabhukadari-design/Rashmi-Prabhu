import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, PackageSearch } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import type { FabricType, FitType, GenderCategory, ProductFilters, SortOption } from '../types';
import { filterAndSortProducts, formatINR } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { FilterSidebar } from '../components/listing/FilterSidebar';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { BottomSheet } from '../components/common/BottomSheet';
import { EmptyState } from '../components/common/EmptyState';

const PAGE_SIZE = 16;

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: "What's New", value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Better Discount', value: 'discount' },
  { label: 'Customer Rating', value: 'rating' },
];

export default function ListingPage() {
  const { gender = 'all', category = 'all' } = useParams<{
    gender: string;
    category: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const products = useCatalogStore((s) => s.products);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingSim, setIsLoadingSim] = useState(false);

  const formattedTitle = `${gender === 'all' ? 'Shop' : gender.charAt(0).toUpperCase() + gender.slice(1)} ${
    category === 'all' ? 'Collection' : category.replace(/-/g, ' ')
  }`;
  useDocumentTitle(formattedTitle);

  const filters: ProductFilters = useMemo(() => {
    const parseList = (key: string) =>
      searchParams.get(key)?.split(',').filter(Boolean) ?? [];

    const maxPrice = Number(searchParams.get('maxPrice')) || 10000;
    const minDiscount = Number(searchParams.get('minDiscount')) || 0;
    const minRating = Number(searchParams.get('minRating')) || 0;
    const sortBy = (searchParams.get('sort') as SortOption) || 'recommended';

    return {
      gender: (gender as GenderCategory | 'all') || 'all',
      category: category || 'all',
      brands: parseList('brands'),
      priceRange: [0, maxPrice],
      colors: parseList('colors'),
      sizes: parseList('sizes'),
      minDiscount,
      minRating,
      fits: parseList('fits') as FitType[],
      fabrics: parseList('fabrics') as FabricType[],
      sortBy,
    };
  }, [gender, category, searchParams]);

  const updateFilters = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.brands.length) params.set('brands', next.brands.join(','));
    if (next.priceRange[1] < 10000) params.set('maxPrice', String(next.priceRange[1]));
    if (next.colors.length) params.set('colors', next.colors.join(','));
    if (next.sizes.length) params.set('sizes', next.sizes.join(','));
    if (next.minDiscount > 0) params.set('minDiscount', String(next.minDiscount));
    if (next.minRating > 0) params.set('minRating', String(next.minRating));
    if (next.fits.length) params.set('fits', next.fits.join(','));
    if (next.fabrics.length) params.set('fabrics', next.fabrics.join(','));
    if (next.sortBy !== 'recommended') params.set('sort', next.sortBy);

    if (patch.gender !== undefined || patch.category !== undefined) {
      const qs = params.toString();
      navigate(`/${next.gender}/${next.category}${qs ? `?${qs}` : ''}`, {
        replace: true,
      });
    } else {
      setSearchParams(params, { replace: true });
    }
    setPage(1);
  };

  // Trigger brief skeleton transition on route change for realistic feel
  useEffect(() => {
    setPage(1);
    setIsLoadingSim(true);
    const t = setTimeout(() => setIsLoadingSim(false), 180);
    return () => clearTimeout(t);
  }, [gender, category]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  const visibleProducts = filteredProducts.slice(0, page * PAGE_SIZE);
  const hasMore = visibleProducts.length < filteredProducts.length;

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    filters.brands.forEach((b) =>
      chips.push({
        key: `brand-${b}`,
        label: b,
        onRemove: () =>
          updateFilters({ brands: filters.brands.filter((x) => x !== b) }),
      })
    );
    filters.colors.forEach((c) =>
      chips.push({
        key: `color-${c}`,
        label: `Color: ${c}`,
        onRemove: () =>
          updateFilters({ colors: filters.colors.filter((x) => x !== c) }),
      })
    );
    filters.sizes.forEach((s) =>
      chips.push({
        key: `size-${s}`,
        label: `Size: ${s}`,
        onRemove: () =>
          updateFilters({ sizes: filters.sizes.filter((x) => x !== s) }),
      })
    );
    if (filters.priceRange[1] < 10000) {
      chips.push({
        key: 'maxPrice',
        label: `Under ${formatINR(filters.priceRange[1])}`,
        onRemove: () => updateFilters({ priceRange: [0, 10000] }),
      });
    }
    if (filters.minDiscount > 0) {
      chips.push({
        key: 'discount',
        label: `${filters.minDiscount}%+ OFF`,
        onRemove: () => updateFilters({ minDiscount: 0 }),
      });
    }
    if (filters.minRating > 0) {
      chips.push({
        key: 'rating',
        label: `${filters.minRating}★ & above`,
        onRemove: () => updateFilters({ minRating: 0 }),
      });
    }
    filters.fits.forEach((f) =>
      chips.push({
        key: `fit-${f}`,
        label: `${f} Fit`,
        onRemove: () =>
          updateFilters({ fits: filters.fits.filter((x) => x !== f) }),
      })
    );
    filters.fabrics.forEach((f) =>
      chips.push({
        key: `fabric-${f}`,
        label: f,
        onRemove: () =>
          updateFilters({ fabrics: filters.fabrics.filter((x) => x !== f) }),
      })
    );
    return chips;
  }, [filters]);

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true });
    setPage(1);
  };

  return (
    <div className="sk-container px-4 md:px-10 py-6 pb-16">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          {
            label: gender === 'all' ? 'All Departments' : gender.toUpperCase(),
            to: `/${gender}/all`,
          },
          ...(category !== 'all'
            ? [{ label: category.replace(/-/g, ' ').toUpperCase() }]
            : []),
        ]}
      />

      {/* Listing Header */}
      <div className="mt-4 pb-4 border-b border-[#EAEAEC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#282C3F] capitalize">
            {formattedTitle}
            <span className="ml-2 text-sm font-normal text-[#94969F] tabular-nums">
              ({filteredProducts.length} items)
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-initial h-10 px-4 rounded-lg border border-[#EAEAEC] bg-white text-xs font-bold uppercase tracking-wider text-[#282C3F] flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterChips.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#FF3F6C] text-white text-[10px]">
                {activeFilterChips.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <label htmlFor="sort-select" className="sr-only">
              Sort products
            </label>
            <div className="flex items-center border border-[#EAEAEC] rounded-lg bg-white px-3 h-10">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#535766] mr-2 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline text-xs text-[#535766] mr-1.5">
                Sort by:
              </span>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilters({ sortBy: e.target.value as SortOption })
                }
                className="text-xs font-bold text-[#282C3F] bg-transparent outline-none cursor-pointer pr-2"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="mt-6 flex gap-8 items-start">
        {/* Desktop Sticky 260px Filter Sidebar */}
        <div className="hidden lg:block w-[260px] shrink-0 sticky top-[88px] max-h-[calc(100vh-110px)] overflow-y-auto pr-2">
          <FilterSidebar
            products={products}
            filters={filters}
            onChange={updateFilters}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {/* Applied Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-[#282C3F] bg-[#F5F5F6] text-xs font-semibold text-[#282C3F] hover:bg-white cursor-pointer"
                >
                  <span>{chip.label}</span>
                  <X className="w-3.5 h-3.5 text-[#535766]" aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#FF3F6C] hover:underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {isLoadingSim ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No matching styles found"
              description="Try clearing a few filters or widening your price range to explore more pieces."
              ctaLabel="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination / Load More */}
              {hasMore && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-xs text-[#535766] tabular-nums">
                    Showing {visibleProducts.length} of {filteredProducts.length} styles
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="h-11 px-8 rounded-lg border border-[#282C3F] bg-white text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white transition-colors cursor-pointer"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters */}
      <BottomSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Styles"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
              className="flex-1 h-11 rounded-lg border border-[#EAEAEC] text-xs font-bold uppercase tracking-wider text-[#282C3F]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex-1 h-11 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider"
            >
              Apply ({filteredProducts.length})
            </button>
          </div>
        }
      >
        <FilterSidebar
          products={products}
          filters={filters}
          onChange={updateFilters}
          onClearAll={clearAllFilters}
        />
      </BottomSheet>
    </div>
  );
}
