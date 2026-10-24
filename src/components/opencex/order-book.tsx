"use client";

import { useOpenCEX } from "@/lib/opencex/store";
import { fmtPrice, fmtQty, fmtCompact } from "@/lib/opencex/format";
import { useMemo } from "react";

export function OrderBook({ pair }: { pair: string }) {
  const book = useOpenCEX((s) => s.books[pair]);
  const p = useOpenCEX((s) => s.pairs.find((x) => x.symbol === pair));

  const { asks, bids, maxTotal, spreadPct } = useMemo(() => {
    if (!book) return { asks: [], bids: [], maxTotal: 0, spreadPct: 0 };
    const asks = book.asks.slice(0, 12);
    const bids = book.bids.slice(0, 12);
    const maxTotal = Math.max(
      asks.reduce((m, l) => Math.max(m, l.total), 0),
      bids.reduce((m, l) => Math.max(m, l.total), 0)
    );
    const spreadPct = book.midPrice ? (book.spread / book.midPrice) * 100 : 0;
    return { asks, bids, maxTotal, spreadPct };
  }, [book]);

  if (!book || !p) {
    return <div className="p-4 text-muted-foreground text-sm">Loading order book…</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Book</span>
        <span className="text-[10px] text-muted-foreground tabular">Depth · {p.symbol}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] uppercase text-muted-foreground border-b border-border">
        <span>Price (USDT)</span>
        <span className="text-right">Size ({p.base})</span>
        <span className="text-right">Total ({p.base})</span>
      </div>

      {/* Asks — reversed so best ask is at the bottom */}
      <div className="flex-1 overflow-hidden flex flex-col-reverse">
        {asks.map((lvl, i) => (
          <BookRow
            key={`a-${lvl.price}-${i}`}
            price={lvl.price}
            qty={lvl.qty}
            total={lvl.total}
            maxTotal={maxTotal}
            side="ask"
            decimals={p.priceDecimals}
            qtyDecimals={p.baseDecimals}
          />
        ))}
      </div>

      {/* Mid / spread */}
      <div className="border-y border-border bg-muted/20 px-3 py-1.5 flex items-center justify-between">
        <span className={`text-base font-bold tabular ${book.spread >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {fmtPrice(book.lastPrice, p.priceDecimals)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Spread <span className="tabular text-foreground">{fmtPrice(book.spread, p.priceDecimals)}</span> ({spreadPct.toFixed(3)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {bids.map((lvl, i) => (
          <BookRow
            key={`b-${lvl.price}-${i}`}
            price={lvl.price}
            qty={lvl.qty}
            total={lvl.total}
            maxTotal={maxTotal}
            side="bid"
            decimals={p.priceDecimals}
            qtyDecimals={p.baseDecimals}
          />
        ))}
      </div>

      <div className="px-3 py-1.5 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Total Bids: <span className="tabular text-emerald-400">{fmtCompact(bids.reduce((s, l) => s + l.qty, 0))} {p.base}</span></span>
        <span>Total Asks: <span className="tabular text-red-400">{fmtCompact(asks.reduce((s, l) => s + l.qty, 0))} {p.base}</span></span>
      </div>
    </div>
  );
}

function BookRow({
  price,
  qty,
  total,
  maxTotal,
  side,
  decimals,
  qtyDecimals,
}: {
  price: number;
  qty: number;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
  decimals: number;
  qtyDecimals: number;
}) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === "bid";
  return (
    <div className="relative grid grid-cols-3 gap-2 px-3 py-0.5 text-xs tabular hover:bg-muted/30">
      <div
        className={`absolute inset-y-0 right-0 ${isBid ? "bg-emerald-500/10" : "bg-red-500/10"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`relative ${isBid ? "text-emerald-400" : "text-red-400"}`}>{fmtPrice(price, decimals)}</span>
      <span className="relative text-right">{fmtQty(qty, qtyDecimals)}</span>
      <span className="relative text-right text-muted-foreground">{fmtQty(total, qtyDecimals)}</span>
    </div>
  );
}
