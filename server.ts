import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatAiError(err: unknown, fallback: string): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : fallback;
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return {
      status: 503,
      message: 'AI service is temporarily experiencing high demand. Please try again in a moment.',
    };
  }
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 503, message: raw };
  }
  return { status: 500, message: raw || fallback };
}

async function generateWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
      await new Promise((r) => setTimeout(r, 450));
      return await fn();
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'stylekart-api' });
  });

  // 1. AI Stylist Chat
  app.post('/api/ai/stylist', async (req, res) => {
    try {
      const { query, catalogSummary, history } = req.body as {
        query: string;
        catalogSummary: Array<{
          id: string;
          title: string;
          brand: string;
          gender: string;
          category: string;
          price: number;
          tags: string[];
          colors: string[];
        }>;
        history?: Array<{ role: string; text: string }>;
      };

      if (!query?.trim()) {
        return res.status(400).json({ error: 'Please describe what you are shopping for.' });
      }

      const ai = getGeminiClient();
      const conversationContext = (history || [])
        .slice(-4)
        .map((m) => `${m.role === 'user' ? 'Shopper' : 'Stylist'}: ${m.text}`)
        .join('\n');

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Shopper request: "${query}"\n\nRecent conversation:\n${conversationContext || 'None'}\n\nAvailable StyleKart Catalog (JSON):\n${JSON.stringify(catalogSummary)}`,
          config: {
            systemInstruction:
              'You are StyleKart AI Stylist, a chic, practical Indian fashion & lifestyle personal shopper. Recommend 3 to 5 specific products strictly from the provided catalog JSON that best match the occasion, budget (in INR ₹), weather, and vibe. Return concise warm advice, 2-3 quick styling tips, and exact matching product IDs.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'Warm, concise personal stylist response explaining the outfit curation.',
                },
                recommendedProductIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 to 5 valid product IDs from the provided catalog JSON.',
                },
                stylingTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 actionable styling tips.',
                },
              },
              required: ['reply', 'recommendedProductIds', 'stylingTips'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatAiError(err, 'AI Stylist failed to respond.');
      console.error('AI Stylist Error:', message);
      return res.status(status).json({ error: message });
    }
  });

  // 2. Complete the Look on Product Detail Page
  app.post('/api/ai/complete-look', async (req, res) => {
    try {
      const { targetProduct, catalogSummary } = req.body as {
        targetProduct: {
          id: string;
          title: string;
          brand: string;
          gender: string;
          category: string;
          price: number;
          colors: string[];
          tags: string[];
        };
        catalogSummary: Array<{
          id: string;
          title: string;
          brand: string;
          gender: string;
          category: string;
          price: number;
          tags: string[];
          colors: string[];
        }>;
      };

      const ai = getGeminiClient();
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Target product being viewed:\n${JSON.stringify(targetProduct)}\n\nCandidate catalog items:\n${JSON.stringify(catalogSummary)}`,
          config: {
            systemInstruction:
              'You are a fashion merchandiser creating a "Complete the Look" outfit pairing. Pick 3 or 4 complementary items from the candidate catalog (for example footwear, bag/watch, bottoms/blazer, or fragrance/lip color that pair well with the target product, never the target product itself). Explain briefly why they work together.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                lookTitle: {
                  type: Type.STRING,
                  description: 'Short editorial outfit title (e.g., Effortless Brunch Pairing).',
                },
                stylistNote: {
                  type: Type.STRING,
                  description: 'One concise sentence explaining why these pieces complement the hero item.',
                },
                complementaryProductIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 to 4 complementary product IDs from candidate catalog.',
                },
              },
              required: ['lookTitle', 'stylistNote', 'complementaryProductIds'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatAiError(err, 'Complete the Look failed.');
      console.error('Complete the Look Error:', message);
      return res.status(status).json({ error: message });
    }
  });

  // 3. Visual Search (Image upload -> style/color/category -> catalog matches)
  app.post('/api/ai/visual-search', async (req, res) => {
    try {
      const { imageBase64, mimeType, catalogSummary } = req.body as {
        imageBase64: string;
        mimeType: string;
        catalogSummary: Array<{
          id: string;
          title: string;
          brand: string;
          gender: string;
          category: string;
          price: number;
          tags: string[];
          colors: string[];
        }>;
      };

      if (!imageBase64) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      const ai = getGeminiClient();
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: `Analyze the apparel, footwear, accessory, or beauty item in this photo. Identify its category, primary colors, fabric/style keywords, and select up to 8 closest matching product IDs from this StyleKart catalog:\n${JSON.stringify(catalogSummary)}`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedCategory: { type: Type.STRING },
                detectedColors: { type: Type.ARRAY, items: { type: Type.STRING } },
                styleKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
                matchedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'detectedCategory',
                'detectedColors',
                'styleKeywords',
                'summary',
                'matchedProductIds',
              ],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatAiError(err, 'Visual search failed.');
      console.error('Visual Search Error:', message);
      return res.status(status).json({ error: message });
    }
  });

  // 4. Smart Review Summary
  app.post('/api/ai/review-summary', async (req, res) => {
    try {
      const { productTitle, reviews } = req.body as {
        productTitle: string;
        reviews: Array<{ rating: number; title: string; comment: string; sizePurchased?: string }>;
      };

      const ai = getGeminiClient();
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Product: ${productTitle}\nReviews:\n${JSON.stringify(reviews)}`,
          config: {
            systemInstruction:
              'Summarize the customer reviews objectively into concise pros, cons, overall sentiment, and a fit verdict.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallSentiment: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                fitVerdict: { type: Type.STRING },
              },
              required: ['overallSentiment', 'pros', 'cons', 'fitVerdict'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatAiError(err, 'Review summary failed.');
      console.error('Review Summary Error:', message);
      return res.status(status).json({ error: message });
    }
  });

  // 5. AI Size Recommendation
  app.post('/api/ai/size-recommendation', async (req, res) => {
    try {
      const { heightCm, weightKg, usualSize, preferredFit, product } = req.body as {
        heightCm: number;
        weightKg: number;
        usualSize: string;
        preferredFit: string;
        product: {
          title: string;
          fit: string;
          fabric: string;
          gender: string;
          category: string;
          availableSizes: string[];
        };
      };

      const ai = getGeminiClient();
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Shopper measurements: Height ${heightCm} cm, Weight ${weightKg} kg, Usual size: ${usualSize}, Preferred fit: ${preferredFit}.\nProduct details: ${JSON.stringify(product)}`,
          config: {
            systemInstruction:
              'You are a garment fit specialist. Recommend the single best size strictly from product.availableSizes, with confidence level and clear body-proportion & fabric-drape reasoning.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendedSize: { type: Type.STRING },
                confidence: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                fitNotes: { type: Type.STRING },
              },
              required: ['recommendedSize', 'confidence', 'reasoning', 'fitNotes'],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const { status, message } = formatAiError(err, 'Size recommendation failed.');
      console.error('Size Rec Error:', message);
      return res.status(status).json({ error: message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StyleKart server running at http://localhost:${PORT}`);
  });
}

startServer();
