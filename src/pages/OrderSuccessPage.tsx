import { Link, useParams } from 'react-router-dom';
import { Award, CheckCircle2, Package, Truck } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { formatINR } from '../utils/commerce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SafeImage } from '../components/common/SafeImage';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle('Order Confirmed');
  const order = useCatalogStore((s) => s.orders.find((o) => o.id === id));

  if (!order) {
    return (
      <div className="sk-container px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#282C3F]">Order Not Found</h1>
        <Link
          to="/account/orders"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="sk-container px-4 md:px-10 py-10 pb-20 max-w-3xl mx-auto space-y-6">
      <div className="p-6 md:p-8 border border-[#EAEAEC] rounded-lg bg-white text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#14958F]/10 text-[#14958F] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#282C3F]">
          Order Confirmed!
        </h1>
        <p className="text-sm text-[#535766]">
          Order <strong className="font-mono-tabular text-[#282C3F]">{order.id}</strong> has been placed and is being prepared for dispatch.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F4] text-[#FF3F6C] text-xs font-bold">
          <Award className="w-4 h-4" />
          <span>+{order.pointsEarned} StyleKart Loyalty Points Earned</span>
        </div>
      </div>

      <div className="p-5 border border-[#EAEAEC] rounded-lg bg-white space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAEAEC]">
          <div className="flex items-center gap-2 text-[#14958F] font-bold">
            <Truck className="w-4 h-4" />
            <span>Estimated Delivery: {order.estimatedDelivery}</span>
          </div>
          <span className="font-bold text-[#282C3F] tabular-nums">
            Paid via {order.paymentMethod} · {formatINR(order.priceBreakup.totalPayable)}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
              <SafeImage
                src={item.image}
                alt={item.title}
                className="w-12 h-16 object-cover rounded border border-[#EAEAEC]"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase text-[#282C3F]">{item.brand}</p>
                <p className="text-[#535766] truncate">{item.title}</p>
                <p className="text-[11px] text-[#94969F]">
                  Size: {item.size} · Qty: {item.quantity}
                </p>
              </div>
              <span className="font-bold text-[#282C3F] tabular-nums">
                {formatINR(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#EAEAEC] flex flex-wrap gap-3">
          <Link
            to={`/account/orders/${order.id}`}
            className="flex-1 h-11 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Track Order &amp; Invoice
          </Link>
          <Link
            to="/"
            className="flex-1 h-11 rounded-lg border border-[#EAEAEC] text-[#282C3F] text-xs font-bold uppercase tracking-wider flex items-center justify-center hover:border-[#282C3F]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
