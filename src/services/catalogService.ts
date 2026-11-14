import { useCatalogStore } from '../store/useCatalogStore';
import type { Banner, Brand, Coupon, Product, ProductFilters } from '../types';
import { filterAndSortProducts } from '../utils/commerce';

/**
 * CatalogService abstracts product, brand, coupon, and banner reads/writes.
 * Currently backed by Zustand + localStorage; replace method bodies with
 * REST/Firebase calls to connect a real backend without touching UI components.
 */
export const catalogService = {
  getProducts(): Product[] {
    return useCatalogStore.getState().products;
  },

  getProductById(id: string): Product | undefined {
    return useCatalogStore.getState().products.find((p) => p.id === id);
  },

  queryProducts(filters: ProductFilters): Product[] {
    return filterAndSortProducts(useCatalogStore.getState().products, filters);
  },

  getSimilarProducts(product: Product, limit = 8): Product[] {
    const all = useCatalogStore.getState().products;
    return all
      .filter((p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
      .sort((a, b) => {
        const scoreA = (a.category === product.category ? 2 : 0) + (a.gender === product.gender ? 1 : 0);
        const scoreB = (b.category === product.category ? 2 : 0) + (b.gender === product.gender ? 1 : 0);
        return scoreB - scoreA || b.rating - a.rating;
      })
      .slice(0, limit);
  },

  getBrands(): Brand[] {
    return useCatalogStore.getState().brands;
  },

  getCoupons(): Coupon[] {
    return useCatalogStore.getState().coupons;
  },

  getActiveBanners(): Banner[] {
    return useCatalogStore.getState().banners.filter((b) => b.active);
  },

  getSearchSuggestions(query: string) {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return { products: [], brands: [], categories: [] };
    }
    const state = useCatalogStore.getState();
    const matchedProducts = state.products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(clean) ||
          p.brand.toLowerCase().includes(clean) ||
          p.category.toLowerCase().includes(clean) ||
          p.tags.some((t) => t.toLowerCase().includes(clean))
      )
      .slice(0, 5);

    const matchedBrands = state.brands
      .filter((b) => b.name.toLowerCase().includes(clean))
      .slice(0, 4);

    const categoryPairs = Array.from(
      new Map(
        state.products
          .filter(
            (p) =>
              p.category.toLowerCase().includes(clean) ||
              p.gender.toLowerCase().includes(clean)
          )
          .map((p) => [`${p.gender}:${p.category}`, { gender: p.gender, category: p.category }])
      ).values()
    ).slice(0, 4);

    return {
      products: matchedProducts,
      brands: matchedBrands,
      categories: categoryPairs,
    };
  },
};
