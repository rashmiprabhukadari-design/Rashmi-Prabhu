import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { formatINR } from '../../utils/commerce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SafeImage } from '../../components/common/SafeImage';
import { EmptyState } from '../../components/common/EmptyState';

export default function AccountOrdersPage() {
  useDocumentTitle('My Orders');
  const orders = useCatalogStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Once you place an order, you can track delivery milestones, request returns, and download invoices here."
        ctaLabel="Start Shopping"
        ctaTo="/women/all"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#282C3F]">
        Order History ({orders.length})
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/account/orders/${order.id}`}
            className="block border border-[#EAEAEC] rounded-lg bg-white p-4 hover:border-[#282C3F] transition-colors space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5F5F6] text-xs">
              <div>
                <span
                  className={`font-bold uppercase tracking-wider ${
                    order.status === 'Cancelled'
                      ? 'text-[#ba1a1a]'
                      : order.status === 'Delivered'
                        ? 'text-[#14958F]'
                        : 'text-[#FF905A]'
                  }`}
                >
                  {order.status}
                </span>
                <p className="text-[11px] text-[#535766] mt-0.5">
                  Order <span className="font-mono-tabular font-semibold">{order.id}</span> ·{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#282C3F] tabular-nums">
                  {formatINR(order.priceBreakup.totalPayable)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#535766]" />
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-3 min-w-[210px]"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded border border-[#EAEAEC] shrink-0"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="font-bold uppercase text-[#282C3F] truncate">
                      {item.brand}
                    </p>
                    <p className="text-[#535766] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#94969F]">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
