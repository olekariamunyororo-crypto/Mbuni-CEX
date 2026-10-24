"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Settings, Activity, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { ViewKey } from "@/app/page";
import { useOpenCEX } from "@/lib/opencex/store";
import { fmtPrice, fmtPct } from "@/lib/opencex/format";

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string; short: string }> = {
  trading: { title: "Professional Terminal", short: "Terminal", subtitle: "CLOB · Price-Time priority · Rust matching engine" },
  markets: { title: "Markets", short: "Markets", subtitle: "All trading pairs · 24h stats" },
  swap: { title: "Swap", short: "Swap", subtitle: "Simple spot convert · 0.1% slippage cap" },
  wallet: { title: "Wallet", short: "Wallet", subtitle: "Balances · Deposits · Withdrawals · Hybrid custody" },
  admin: { title: "Admin · Back-office", short: "Admin", subtitle: "Risk · Compliance · Operations" },
  architecture: { title: "Architecture & Observability", short: "Arch", subtitle: "Services · Health · Event stream" },
};

interface SessionUserLike {
  email?: string | null;
  name?: string | null;
  onboardingComplete?: boolean;
  tier?: number;
}

export function TopBar({
  view,
  sessionUser,
  onLogout,
}: {
  view: ViewKey;
  sessionUser?: SessionUserLike;
  onLogout?: () => void;
}) {
  const activePair = useOpenCEX((s) => s.activePair);
  const tickers = useOpenCEX((s) => s.tickers);
  const meta = VIEW_TITLES[view];
  const ticker = tickers[activePair];

  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card/50 backdrop-blur flex items-center px-3 md:px-4 gap-2 md:gap-4">
      {/* Mobile: show short title only */}
      <div className="flex flex-col leading-tight min-w-0">
        <h1 className="text-sm font-semibold truncate">
          <span className="md:hidden">{meta.short}</span>
          <span className="hidden md:inline">{meta.title}</span>
        </h1>
        <span className="text-[11px] text-muted-foreground truncate hidden md:inline">{meta.subtitle}</span>
      </div>

      <div className="flex-1" />

      {/* Trading ticker — full on md+, condensed pair + last price on mobile */}
      {view === "trading" && ticker && (
        <>
          {/* Mobile compact: pair + price + change badge */}
          <div className="flex md:hidden items-center gap-2 px-2 py-1 rounded-md bg-muted/40">
            <span className="text-[11px] font-medium">{activePair}</span>
            <span className="text-sm font-semibold tabular">{fmtPrice(ticker.lastPrice, 2)}</span>
            <span className={`text-[10px] tabular ${ticker.priceChangePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {fmtPct(ticker.priceChangePct)}
            </span>
          </div>

          {/* Desktop full ticker */}
          <div className="hidden md:flex items-center gap-4 px-3 py-1 rounded-md bg-muted/40">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">{activePair}</span>
              <span className="text-sm font-semibold tabular">{fmtPrice(ticker.lastPrice, 2)}</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">24h Change</span>
              <span className={`text-sm font-medium tabular ${ticker.priceChangePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {fmtPct(ticker.priceChangePct)}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">24h High</span>
              <span className="text-sm font-medium tabular">{fmtPrice(ticker.high, 2)}</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">24h Low</span>
              <span className="text-sm font-medium tabular">{fmtPrice(ticker.low, 2)}</span>
            </div>
          </div>
        </>
      )}

      {/* Engine live indicator — only on lg+ */}
      <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-md bg-muted/40">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 live-dot" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] text-muted-foreground">Engine live</span>
        <span className="text-[11px] text-muted-foreground tabular">{now}</span>
      </div>

      {/* Action buttons — hide most on mobile, keep bell */}
      <button className="hidden sm:block p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground">
        <Search className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>
      <button className="hidden sm:block p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground">
        <Settings className="w-4 h-4" />
      </button>
      <button className="hidden sm:block p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground">
        <Activity className="w-4 h-4" />
      </button>
      <button
        onClick={() => signOut({ redirect: false }).then(() => onLogout?.())}
        title="Sign out"
        className="md:hidden p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-red-400"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
