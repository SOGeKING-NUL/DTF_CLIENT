import DashboardPageLayout from "@/components/dashboard/layout"
import AtomIcon from "@/components/icons/atom"

export default function DiscoverYieldPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Discover Yield",
        description: "Explore narratives and mechanisms",
        icon: AtomIcon,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Liquid Staking", "Lending Markets", "Basis Trades", "Real‑World Yields", "Stablecoin Farms", "Delta‑neutral"].map((name) => (
          <div key={name} className="rounded-2xl p-5 ring-1 ring-white/15 bg-white/5 backdrop-blur-md hover:bg-white/10 transition">
            <div className="text-xl font-semibold mb-2">{name}</div>
            <p className="text-sm text-white/80">High‑level overview and risk notes. Click through to view proposed DTF baskets and backtests.</p>
            <div className="mt-4 w-full aspect-[16/9] rounded-lg bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-inset ring-white/15" />
            <div className="mt-4 flex justify-between">
              <span className="text-white/70 text-sm">Est. APY</span>
              <span className="text-white font-medium">—</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardPageLayout>
  )
}


