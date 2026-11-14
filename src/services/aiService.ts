import type {
  Product,
  ProductReview,
  ReviewSummaryResult,
  SizeRecommendationResult,
  VisualSearchResult,
} from '../types';

function compactCatalog(products: Product[]) {
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    gender: p.gender,
    category: p.category,
    price: p.price,
    tags: p.tags,
    colors: p.colors.map((c) => c.name),
  }));
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const aiService = {
  async askStylist(params: {
    query: string;
    products: Product[];
    history: Array<{ role: string; text: string }>;
  }): Promise<{
    reply: string;
    recommendedProductIds: string[];
    stylingTips: string[];
  }> {
    return postJson('/api/ai/stylist', {
      query: params.query,
      catalogSummary: compactCatalog(params.products),
      history: params.history,
    });
  },

  async completeTheLook(params: {
    targetProduct: Product;
    products: Product[];
  }): Promise<{
    lookTitle: string;
    stylistNote: string;
    complementaryProductIds: string[];
  }> {
    const candidates = params.products
      .filter((p) => p.id !== params.targetProduct.id)
      .slice(0, 48);
    return postJson('/api/ai/complete-look', {
      targetProduct: {
        id: params.targetProduct.id,
        title: params.targetProduct.title,
        brand: params.targetProduct.brand,
        gender: params.targetProduct.gender,
        category: params.targetProduct.category,
        price: params.targetProduct.price,
        colors: params.targetProduct.colors.map((c) => c.name),
        tags: params.targetProduct.tags,
      },
      catalogSummary: compactCatalog(candidates),
    });
  },

  async visualSearch(params: {
    imageBase64: string;
    mimeType: string;
    products: Product[];
  }): Promise<VisualSearchResult> {
    return postJson('/api/ai/visual-search', {
      imageBase64: params.imageBase64,
      mimeType: params.mimeType,
      catalogSummary: compactCatalog(params.products),
    });
  },

  async summarizeReviews(params: {
    productTitle: string;
    reviews: ProductReview[];
  }): Promise<ReviewSummaryResult> {
    return postJson('/api/ai/review-summary', {
      productTitle: params.productTitle,
      reviews: params.reviews.map((r) => ({
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        sizePurchased: r.sizePurchased,
      })),
    });
  },

  async recommendSize(params: {
    heightCm: number;
    weightKg: number;
    usualSize: string;
    preferredFit: string;
    product: Product;
  }): Promise<SizeRecommendationResult> {
    return postJson('/api/ai/size-recommendation', {
      heightCm: params.heightCm,
      weightKg: params.weightKg,
      usualSize: params.usualSize,
      preferredFit: params.preferredFit,
      product: {
        title: params.product.title,
        fit: params.product.fit,
        fabric: params.product.fabric,
        gender: params.product.gender,
        category: params.product.category,
        availableSizes: params.product.sizes.map((s) => s.size),
      },
    });
  },
};
