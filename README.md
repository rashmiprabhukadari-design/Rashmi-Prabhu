# StyleKart — Fashion & Lifestyle E-Commerce

StyleKart is a full-stack fashion storefront built with React, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, and server-side Gemini AI integration.

## Swapping the Mock Service Layer for a Real Backend

All catalog, order, and AI operations are isolated behind `/src/services`:

- `src/services/catalogService.ts`: Reads products, brands, coupons, and banners.
- `src/services/orderService.ts`: Handles order creation and status transitions.
- `src/services/aiService.ts`: Communicates with `/api/ai/*` endpoints on `server.ts`.

### Option A: Firebase (Firestore + Auth)
1. Initialize Firebase in `src/lib/firebase.ts` and replace `useAuthStore` login methods with `signInWithPhoneNumber` / `GoogleAuthProvider`.
2. Update `catalogService.ts` methods (`getProducts`, `getProductById`, `queryProducts`) to query Firestore `collection(db, 'products')` with `getDocs` / `onSnapshot`.
3. Update `orderService.ts` (`placeOrder`, `getOrdersForUser`, `updateStatus`) to write to `collection(db, 'orders')`.

### Option B: Node/Express + MongoDB
1. Add REST routes in `server.ts` (`/api/products`, `/api/orders`, `/api/coupons`, `/api/banners`) backed by Mongoose models.
2. Replace synchronous Zustand reads inside `src/services/catalogService.ts` and `src/services/orderService.ts` with `fetch('/api/...')` calls returning `Promise<...>`.
3. Add JWT or session-cookie middleware to protect `/api/orders` and `/api/admin/*` endpoints.
