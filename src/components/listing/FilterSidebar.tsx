import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import type { FabricType, FitType, GenderCategory, Product, ProductFilters } from '../../types';
import { formatINR } from '../../utils/commerce';

interface FilterSidebarProps {
  products: Product[];
  filters: ProductFilters;
  onChange: (next: Partial<ProductFilters>) => void;
  onClearAll: () => void;
}

const GENDERS: { label: string; value: GenderCategory | 'all' }[] = [
  { label: 'All Departments', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
  { label: 'Footwear', value: 'footwear' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Beauty', value: 'beauty' },
];

const FITS: FitType[] = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Tailored'];
const FABRICS: FabricType[] = [
  'Cotton',
  'Linen',
  'Silk Blend',
  'Denim',
  'Polyester',
  'Leather',
  'Wool Blend',
  'Botanical Formula',
];

const DISCOUNTS = [10, 20, 30, 40, 50];

export function FilterSidebar({
  products,
  filters,
  onChange,
  onClearAll,
}: FilterSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');

  const { allBrands, allCategories, allColors, allSizes } = useMemo(() => {
    const brandMap = new Map<string, number>();
    const catSet = new Set<string>();
    const colorMap = new Map<string, string>();
    const sizeSet = new Set<string>();

    for (const p of products) {
      brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      catSet.add(p.category);
      for (const c of p.colors) {
        if (!colorMap.has(c.name)) colorMap.set(c.name, c.hex);
      }
      for (const s of p.sizes) {
        sizeSet.add(s.size);
      }
    }

    return {
      allBrands: Array.from(brandMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      allCategories: Array.from(catSet).sort(),
      allColors: Array.from(colorMap.entries()).slice(0, 14),
      allSizes: Array.from(sizeSet),
    };
  }, [products]);

  const visibleBrands = allBrands.filter(([b]) =>
    b.toLowerCase().includes(brandSearch.trim().toLowerCase())
  );

  const toggleItem = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <aside className="w-full space-y-5 text-xs text-[#282C3F]">
      <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEC]">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#282C3F]">
          Filters
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-bold uppercase tracking-wider text-[#FF3F6C] hover:underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Department / Gender */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Department
        </h3>
        <div className="space-y-2">
          {GENDERS.map((g) => (
            <label key={g.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="filter-gender"
                checked={(filters.gender || 'all') === g.value}
                onChange={() => onChange({ gender: g.value, category: 'all' })}
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-[#282C3F]">{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Category
        </h3>
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="filter-cat"
              checked={!filters.category || filters.category === 'all'}
              onChange={() => onChange({ category: 'all' })}
              className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
            />
            <span>All Categories</span>
          </label>
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer capitalize">
              <input
                type="radio"
                name="filter-cat"
                checked={filters.category === cat}
                onChange={() => onChange({ category: cat })}
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span>{cat.replace(/-/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand with search */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Brand
        </h3>
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-[#94969F] absolute left-2.5 top-2.5" aria-hidden="true" />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brand"
            aria-label="Search brands"
            className="w-full h-8 pl-8 pr-2.5 rounded border border-[#EAEAEC] text-xs outline-none focus:border-[#282C3F]"
          />
        </div>
        <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
          {visibleBrands.map(([brand, count]) => (
            <label key={brand} className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() =>
                    onChange({ brands: toggleItem(filters.brands, brand) })
                  }
                  className="accent-[#FF3F6C] w-4 h-4 rounded-sm cursor-pointer shrink-0"
                />
                <span className="truncate">{brand}</span>
              </span>
              <span className="text-[11px] text-[#94969F] tabular-nums">({count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F]">
            Max Price
          </h3>
          <span className="text-xs font-bold text-[#FF3F6C] tabular-nums">
            Up to {formatINR(filters.priceRange[1])}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={10000}
          step={250}
          value={filters.priceRange[1]}
          onChange={(e) =>
            onChange({ priceRange: [filters.priceRange[0], Number(e.target.value)] })
          }
          aria-label="Maximum price filter"
          className="w-full accent-[#FF3F6C] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#94969F] tabular-nums mt-1">
          <span>₹500</span>
          <span>₹5,000</span>
          <span>₹10,000</span>
        </div>
      </div>

      {/* Color */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Color
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {allColors.map(([name, hex]) => (
            <label key={name} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.colors.includes(name)}
                onChange={() =>
                  onChange({ colors: toggleItem(filters.colors, name) })
                }
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-[#EAEAEC] shrink-0"
                style={{ backgroundColor: hex }}
                aria-hidden="true"
              />
              <span className="truncate">{name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Size
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {allSizes.slice(0, 14).map((sz) => {
            const active = filters.sizes.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => onChange({ sizes: toggleItem(filters.sizes, sz) })}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#FF3F6C] bg-[#FFF0F4] text-[#FF3F6C]'
                    : 'border-[#EAEAEC] bg-white text-[#282C3F] hover:border-[#282C3F]'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Discount Range
        </h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="filter-discount"
              checked={filters.minDiscount === 0}
              onChange={() => onChange({ minDiscount: 0 })}
              className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
            />
            <span>Any Discount</span>
          </label>
          {DISCOUNTS.map((d) => (
            <label key={d} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="filter-discount"
                checked={filters.minDiscount === d}
                onChange={() => onChange({ minDiscount: d })}
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span>{d}% and above</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Customer Rating
        </h3>
        <div className="space-y-1.5">
          {[4.5, 4, 3].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter-rating"
                checked={filters.minRating === r}
                onChange={() => onChange({ minRating: r })}
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span className="inline-flex items-center gap-1">
                {r} <Star className="w-3 h-3 fill-[#14958F] text-[#14958F]" /> &amp; above
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="filter-rating"
              checked={filters.minRating === 0}
              onChange={() => onChange({ minRating: 0 })}
              className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
            />
            <span>All Ratings</span>
          </label>
        </div>
      </div>

      {/* Fit */}
      <div className="pb-4 border-b border-[#EAEAEC]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Fit
        </h3>
        <div className="space-y-1.5">
          {FITS.map((fit) => (
            <label key={fit} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fits.includes(fit)}
                onChange={() => onChange({ fits: toggleItem(filters.fits, fit) })}
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span>{fit}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#282C3F] mb-2.5">
          Fabric
        </h3>
        <div className="space-y-1.5">
          {FABRICS.map((fab) => (
            <label key={fab} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fabrics.includes(fab)}
                onChange={() =>
                  onChange({ fabrics: toggleItem(filters.fabrics, fab) })
                }
                className="accent-[#FF3F6C] w-4 h-4 cursor-pointer"
              />
              <span>{fab}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
