"use client";

import { useState } from "react";
import { CandlestickChart, LayoutDashboard, ArrowLeftRight, Wallet, MoreHorizontal, ShieldCheck, Network, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { ViewKey } from "@/app/page";
import { useOpenCEX } from "@/lib/opencex/store";
import { fmtUSD } from "@/lib/opencex/format";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

interface NavItem {
  key: ViewKey;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY: NavItem[] = [
  { key: "trading", label: "Trade", short: "Trade", icon: CandlestickChart },
  { key: "markets", label: "Markets", short: "Markets", icon: LayoutDashboard },
  { key: "swap", label: "Swap", short: "Swap", icon: ArrowLeftRight },
  { key: "wallet", label: "Wallet", short: "Wallet", icon: Wallet },
];

const SECONDARY: NavItem[] = [
  { key: "admin", label: "Admin", short: "Admin", icon: ShieldCheck },
  { key: "architecture", label: "Architecture", short: "Arch", icon: Network },
];

export function MobileNav({
  view,
  onChange,
  onLogout,
  sessionUser,
}: {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
  onLogout?: () => void;
  sessionUser?: { email?: string | null; name?: string | null; tier?: number };
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const balances = useOpenCEX((s) => s.balances);
  const totalUSD = balances.reduce((s, b) => s + b.usdValue, 0);

  const isPrimary = PRIMARY.some((p) => p.key === view);
  const activeSecondary = SECONDARY.find((s) => s.key === view);

  const select = (v: ViewKey) => {
    onChange(v);
    setMoreOpen(false);
  };

  const displayName = sessionUser?.name || sessionUser?.email?.split("@")[0] || "alex.trader";
  const initials = displayName.slice(0, 2).toUpperCase();
  const tier = sessionUser?.tier ?? 3;

  return (
    <>
      {/* Bottom tab bar — fixed, dark, with safe-area padding */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur border-t border-sidebar-border">
        <div
          className="grid grid-cols-5 h-14"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => select(item.key)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-emerald-400" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.4]" : "stroke-2"}`} />
                <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>{item.short}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 ${
              !isPrimary ? "text-emerald-400" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px]">{activeSecondary ? activeSecondary.short : "More"}</span>
          </button>
        </div>
      </nav>

      {/* "More" drawer — shows secondary nav + portfolio summary + user */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="bg-sidebar border-sidebar-border text-sidebar-foreground">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center justify-between">
              <span>More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded hover:bg-sidebar-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground">
              Back-office & system views · portfolio summary
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            {/* Portfolio summary card */}
            <div className="rounded-lg bg-sidebar-accent/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Portfolio Value</div>
              <div className="text-xl font-bold tabular mt-0.5">{fmtUSD(totalUSD)}</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">+2.4% 24h</div>
            </div>

            {/* Secondary nav */}
            <div className="space-y-1">
              {SECONDARY.map((item) => {
                const Icon = item.icon;
                const active = view === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => select(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User row */}
            <div className="flex items-center gap-2 px-1 pt-2 border-t border-sidebar-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{displayName}</div>
                <div className="text-[10px] text-muted-foreground">Tier {tier} · Verified</div>
              </div>
              <button
                onClick={() => signOut({ redirect: false }).then(() => { setMoreOpen(false); onLogout?.(); })}
                className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-sidebar-accent"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
