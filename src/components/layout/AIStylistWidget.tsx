import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, X, ShoppingBag, Loader2 } from 'lucide-react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { aiService } from '../../services/aiService';
import type { AIStylistMessage } from '../../types';
import { formatINR } from '../../utils/commerce';
import { SafeImage } from '../common/SafeImage';

const SUGGESTED_PROMPTS = [
  'Wedding guest outfit under ₹5000',
  'Smart casual office look for men',
  'Weekend brunch dress with matching bag',
  'Festive Diwali kurta under ₹3500',
];

export function AIStylistWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIStylistMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Tell me the occasion, vibe, or budget (e.g., "wedding guest outfit under ₹5000") and I will curate pieces straight from StyleKart.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const products = useCatalogStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  const sendQuery = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    const userMsg: AIStylistMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await aiService.askStylist({
        query: clean,
        products,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
      });

      const assistantMsg: AIStylistMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        recommendedProductIds: res.recommendedProductIds,
        stylingTips: res.stylingTips,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach AI Stylist right now.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <>
      {/* Floating Stylist Trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI Stylist"
          className="fixed bottom-18 md:bottom-6 right-4 md:right-6 z-30 h-11 px-4 rounded-full bg-[#282C3F] text-white shadow-lg hover:bg-[#FF3F6C] transition-colors flex items-center gap-2 text-xs font-bold tracking-wide cursor-pointer no-print"
        >
          <Sparkles className="w-4 h-4 text-[#FF905A]" aria-hidden="true" />
          <span>AI Stylist</span>
        </button>
      )}

      {/* Stylist Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="StyleKart AI Stylist"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#282C3F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF3F6C] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">StyleKart AI Stylist</h2>
                  <p className="text-[11px] text-white/75">
                    Personal outfit curation from live catalog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI Stylist"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFB]">
              {messages.map((msg) => {
                const matchedProducts = (msg.recommendedProductIds || [])
                  .map((id) => productMap.get(id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#FF3F6C] text-white'
                          : 'bg-white border border-[#EAEAEC] text-[#282C3F]'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.stylingTips && msg.stylingTips.length > 0 && (
                        <ul className="mt-2 pt-2 border-t border-[#EAEAEC] space-y-1 text-[11px] text-[#535766] list-disc pl-4">
                          {msg.stylingTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {matchedProducts.length > 0 && (
                      <div className="mt-2.5 w-full space-y-2">
                        {matchedProducts.map((p) => {
                          const defaultSize =
                            p.sizes.find((s) => s.stock > 0)?.size ?? 'M';
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-2.5 bg-white border border-[#EAEAEC] rounded hover:border-[#282C3F] transition-colors"
                            >
                              <Link
                                to={`/product/${p.id}`}
                                onClick={() => setOpen(false)}
                                className="w-12 h-16 rounded overflow-hidden shrink-0 bg-[#F5F5F6]"
                              >
                                <SafeImage
                                  src={p.images[0]}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link
                                  to={`/product/${p.id}`}
                                  onClick={() => setOpen(false)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#535766] block truncate"
                                >
                                  {p.brand}
                                </Link>
                                <Link
                                  to={`/product/${p.id}`}
                                  onClick={() => setOpen(false)}
                                  className="text-xs font-semibold text-[#282C3F] block truncate hover:text-[#FF3F6C]"
                                >
                                  {p.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5 text-xs tabular-nums">
                                  <span className="font-bold text-[#282C3F]">
                                    {formatINR(p.price)}
                                  </span>
                                  <span className="text-[#FF905A] font-semibold text-[11px]">
                                    ({p.discountPercent}% OFF)
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  addItem(
                                    p.id,
                                    defaultSize,
                                    p.colors[0]?.name ?? 'Standard',
                                    1
                                  );
                                  showToast(`Added ${p.title} to Bag`);
                                }}
                                aria-label={`Add ${p.title} to bag`}
                                className="h-8 px-2.5 rounded bg-[#FFF0F4] text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#535766] bg-white border border-[#EAEAEC] rounded-lg px-3.5 py-2.5 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF3F6C]" />
                  <span>Curating looks for you...</span>
                </div>
              )}

              {error && (
                <div className="text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="px-4 py-2 border-t border-[#EAEAEC] bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuery(prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full border border-[#EAEAEC] bg-[#F5F5F6] text-[11px] font-medium text-[#282C3F] hover:border-[#FF3F6C] hover:text-[#FF3F6C] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuery(input);
              }}
              className="p-3 border-t border-[#EAEAEC] bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. Wedding guest outfit under ₹5000"
                aria-label="Describe your occasion or style request"
                className="flex-1 h-10 px-3 rounded border border-[#EAEAEC] text-xs text-[#282C3F] focus:border-[#282C3F] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send stylist message"
                className="h-10 w-10 rounded-lg bg-[#FF3F6C] text-white flex items-center justify-center hover:bg-[#E6325D] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
