"use client";

import { LayoutDashboard, CandlestickChart, ArrowLeftRight, Wallet, ShieldCheck, Network, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { ViewKey } from "@/app/page";
import { useOpenCEX } from "@/lib/opencex/store";
import { fmtUSD } from "@/lib/opencex/format";
import { OstrichLogo } from "@/components/opencex/ostrich-logo";
import { useState } from "react";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV: NavItem[] = [
  { key: "trading", label: "Trade", icon: CandlestickChart, description: "Pro CLOB terminal" },
  { key: "markets", label: "Markets", icon: LayoutDashboard, description: "All pairs & 24h stats" },
  { key: "swap", label: "Swap", icon: ArrowLeftRight, description: "Simple spot convert" },
  { key: "wallet", label: "Wallet", icon: Wallet, description: "Balances, deposits, withdrawals" },
  { key: "admin", label: "Admin", icon: ShieldCheck, description: "Back-office & risk" },
  { key: "architecture", label: "Architecture", icon: Network, description: "System & observability" },
];

interface SessionUserLike {
  email?: string | null;
  name?: string | null;
  onboardingComplete?: boolean;
  tier?: number;
}

export function Sidebar({
  view,
  onChange,
  onLogout,
  sessionUser,
}: {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
  onLogout?: () => void;
  sessionUser?: SessionUserLike;
}) {
  const balances = useOpenCEX((s) => s.balances);
  const totalUSD = balances.reduce((s, b) => s + b.usdValue, 0);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    signOut({ redirect: false }).then(() => onLogout?.());
  };

  // Derive display name from session or fallback
  const displayName = sessionUser?.name || sessionUser?.email?.split("@")[0] || "alex.trader";
  const initials = displayName.slice(0, 2).toUpperCase();
  const tier = sessionUser?.tier ?? 3;

  return (
    <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black overflow-hidden">
          <OstrichLogo className="w-7 h-7" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm tracking-tight">Mbuni CEX</span>
          <span className="text-[10px] text-secondary uppercase tracking-wider">2026 · v1.0</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors group ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-secondary hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] opacity-70">{item.description}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="rounded-md bg-sidebar-accent/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-secondary">Portfolio Value</div>
          <div className="text-base font-semibold tabular">{fmtUSD(totalUSD)}</div>
          <div className="text-[10px] text-primary mt-0.5">+2.4% 24h</div>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{displayName}</div>
            <div className="text-[10px] text-secondary">Tier {tier} · Verified</div>
          </div>
          <button
            onClick={handleLogout}
            title={confirmLogout ? "Click again to confirm" : "Sign out"}
            className={`p-1.5 rounded transition-colors ${
              confirmLogout ? "bg-danger text-white" : "text-secondary hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
