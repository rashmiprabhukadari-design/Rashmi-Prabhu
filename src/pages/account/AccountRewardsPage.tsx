import { Award, Copy, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useToastStore } from '../../store/useToastStore';
import { calculateLoyaltyTier } from '../../utils/commerce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AccountRewardsPage() {
  useDocumentTitle('Rewards & Coupons');
  const user = useAuthStore((s) => s.user);
  const allCoupons = useCatalogStore((s) => s.coupons);
  const coupons = allCoupons.filter((c) => c.active);
  const showToast = useToastStore((s) => s.showToast);

  const points = user?.loyaltyPoints || 0;
  const tierInfo = calculateLoyaltyTier(points);
  const progressPct = Math.min(100, Math.round((points / 2500) * 100));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#282C3F] to-[#434864] text-white space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FF3F6C] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF905A]">
                StyleKart Loyalty Tier
              </p>
              <h2 className="text-xl font-extrabold">{tierInfo.tier}</h2>
            </div>
          </div>
          <div className="text-right tabular-nums">
            <p className="text-2xl font-extrabold">{points}</p>
            <p className="text-[11px] text-white/75">Available Points</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-[#FF3F6C] rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-white/80">
            {tierInfo.nextTier
              ? `${tierInfo.pointsToNext} points away from ${tierInfo.nextTier}`
              : 'Top Runway Icon tier unlocked!'}
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-white/90">
          {tierInfo.perks.map((perk) => (
            <li key={perk} className="bg-white/10 rounded px-3 py-2">
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#282C3F] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#FF3F6C]" />
          Active StyleKart Coupons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="p-4 rounded border border-dashed border-[#FF3F6C] bg-[#FFF0F4]/60 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-mono-tabular text-sm font-extrabold text-[#FF3F6C]">
                  {c.code}
                </p>
                <p className="text-xs font-bold text-[#282C3F] mt-0.5">
                  {c.title}
                </p>
                <p className="text-[11px] text-[#535766] mt-0.5">
                  {c.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(c.code);
                  showToast(`Copied ${c.code}`);
                }}
                className="h-9 px-3 rounded bg-white border border-[#FF3F6C]/40 text-xs font-bold text-[#FF3F6C] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
