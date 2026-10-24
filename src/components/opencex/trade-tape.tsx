"use client";

import { useMemo } from "react";
import { useOpenCEX } from "@/lib/opencex/store";
import { fmtPrice, fmtQty, fmtTime } from "@/lib/opencex/format";

export function TradeTape({ pair, limit = 40 }: { pair: string; limit?: number }) {
  const trades = useOpenCEX((s) => s.trades);
  const p = useOpenCEX((s) => s.pairs.find((x) => x.symbol === pair));
  const visible = useMemo(() => trades.filter((t) => t.pair === pair).slice(0, limit), [trades, pair, limit]);
  if (!p) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Trades</span>
        <span className="text-[10px] text-muted-foreground tabular">{visible.length} trades</span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] uppercase text-muted-foreground border-b border-border">
        <span>Price</span>
        <span className="text-right">Size ({p.base})</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground">No trades yet — bots are warming up.</div>
        )}
        {visible.map((t) => (
          <div key={t.id} className="grid grid-cols-3 gap-2 px-3 py-0.5 text-xs tabular hover:bg-muted/30">
            <span className={t.side === "BUY" ? "text-emerald-400" : "text-red-400"}>
              {fmtPrice(t.price, p.priceDecimals)}
            </span>
            <span className="text-right">{fmtQty(t.qty, p.baseDecimals)}</span>
            <span className="text-right text-muted-foreground">{fmtTime(t.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
