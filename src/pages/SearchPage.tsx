import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Loader2, Search, Sparkles, Upload } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { useAuthStore } from '../store/useAuthStore';
import { aiService } from '../services/aiService';
import { filterAndSortProducts } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { SortOption, VisualSearchResult } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialVisual = searchParams.get('visual') === '1';

  const products = useCatalogStore((s) => s.products);
  const { recentSearches, addRecentSearch } = useAuthStore();

  const [queryInput, setQueryInput] = useState(initialQ);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [visualMode, setVisualMode] = useState(initialVisual);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);
  const [visualResult, setVisualResult] = useState<VisualSearchResult | null>(null);

  const activeQuery = searchParams.get('q') || '';
  useDocumentTitle(activeQuery ? `Search: ${activeQuery}` : 'Search & Visual Discovery');

  const results = useMemo(() => {
    if (visualMode && visualResult) {
      const idSet = new Set(visualResult.matchedProductIds);
      return products.filter((p) => idSet.has(p.id));
    }
    if (!activeQuery.trim()) {
      return products.slice(0, 16);
    }
    return filterAndSortProducts(products, {
      gender: 'all',
      category: 'all',
      searchQuery: activeQuery,
      brands: [],
      priceRange: [0, 100000],
      colors: [],
      sizes: [],
      minDiscount: 0,
      minRating: 0,
      fits: [],
      fabrics: [],
      sortBy,
    });
  }, [products, activeQuery, sortBy, visualMode, visualResult]);

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setVisualMode(false);
    const clean = queryInput.trim();
    if (clean) addRecentSearch(clean);
    setSearchParams(clean ? { q: clean } : {}, { replace: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      setPreviewUrl(dataUrl);
      setVisualMode(true);
      setVisualLoading(true);
      setVisualError(null);
      try {
        const res = await aiService.visualSearch({
          imageBase64: dataUrl,
          mimeType: file.type || 'image/jpeg',
          products,
        });
        setVisualResult(res);
      } catch (err: unknown) {
        setVisualError(
          err instanceof Error ? err.message : 'Visual search failed.'
        );
      } finally {
        setVisualLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sk-container px-4 md:px-10 py-8 pb-16 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVisualMode(false)}
            className={`h-9 px-4 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              !visualMode
                ? 'bg-[#282C3F] text-white'
                : 'bg-[#F5F5F6] text-[#535766] hover:text-[#282C3F]'
            }`}
          >
            Keyword Search
          </button>
          <button
            type="button"
            onClick={() => setVisualMode(true)}
            className={`h-9 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              visualMode
                ? 'bg-[#FF3F6C] text-white'
                : 'bg-[#F5F5F6] text-[#535766] hover:text-[#282C3F]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            AI Visual Search
          </button>
        </div>

        {!visualMode ? (
          <form onSubmit={handleTextSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#535766] absolute left-3.5 top-3.5" />
              <input
                type="search"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search dresses, linen shirts, sneakers, brands..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#EAEAEC] bg-white text-sm text-[#282C3F] outline-none focus:border-[#282C3F]"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6325D] cursor-pointer"
            >
              Search
            </button>
          </form>
        ) : (
          <div className="p-5 rounded-lg border border-dashed border-[#FF3F6C] bg-[#FFF0F4]/60 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#E6325D] shrink-0">
                <Upload className="w-4 h-4" />
                <span>Upload Outfit Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-[#535766]">
                Upload any outfit, footwear, bag, or beauty product photo. Gemini identifies the style, palette, and category to find matching pieces.
              </p>
            </div>

            {previewUrl && (
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2 border-t border-[#FF3F6C]/20">
                <img
                  src={previewUrl}
                  alt="Uploaded visual search query"
                  className="w-24 h-32 object-cover rounded border border-[#EAEAEC]"
                />
                <div className="flex-1 space-y-1.5">
                  {visualLoading && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#282C3F]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF3F6C]" />
                      <span>Analyzing silhouette, colors &amp; fabric...</span>
                    </div>
                  )}
                  {visualError && (
                    <p className="text-xs text-[#ba1a1a]">{visualError}</p>
                  )}
                  {visualResult && (
                    <>
                      <p className="text-xs font-bold text-[#FF3F6C] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Detected: {visualResult.detectedCategory}
                      </p>
                      <p className="text-xs text-[#282C3F]">
                        {visualResult.summary}
                      </p>
                      <p className="text-[11px] text-[#535766]">
                        Colors: {visualResult.detectedColors.join(', ')} · Keywords:{' '}
                        {visualResult.styleKeywords.join(', ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {recentSearches.length > 0 && !visualMode && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#535766]">Recent:</span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQueryInput(term);
                  setSearchParams({ q: term }, { replace: true });
                }}
                className="px-3 py-1 rounded-full bg-[#F5F5F6] text-xs font-medium text-[#282C3F] hover:bg-[#FFF0F4] hover:text-[#FF3F6C] cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-[#EAEAEC] pb-3">
        <h1 className="text-base md:text-lg font-bold text-[#282C3F]">
          {visualMode && visualResult
            ? `Visual Matches (${results.length})`
            : activeQuery
              ? `Results for "${activeQuery}" (${results.length})`
              : `Popular Catalog Picks (${results.length})`}
        </h1>
        {!visualMode && (
          <select
            aria-label="Sort search results"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-3 rounded border border-[#EAEAEC] text-xs font-bold text-[#282C3F]"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
            <option value="rating">Top Rated</option>
          </select>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No styles matched "${activeQuery}"`}
          description="Try searching by brand (e.g. VERVE COUTURE), fabric (Linen), or occasion (Wedding)."
          ctaLabel="Browse All Women"
          ctaTo="/women/all"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
