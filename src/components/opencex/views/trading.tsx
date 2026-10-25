"use client";

import { useOpenCEX } from "@/lib/opencex/store";
import { OrderBook } from "@/components/opencex/order-book";
import { TradeTape } from "@/components/opencex/trade-tape";
import { PriceChart } from "@/components/opencex/price-chart";
import { OrderEntry } from "@/components/opencex/order-entry";
import { OpenOrders } from "@/components/opencex/open-orders";
import { PairSelector } from "@/components/opencex/pair-selector";
import { MobileOrderSheet } from "@/components/opencex/mobile-order-sheet";
import { fmtPrice, fmtPct, fmtCompact } from "@/lib/opencex/format";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ListOrdered, Receipt } from "lucide-react";

type MobileTab = "book" | "trades" | "orders";

export function TradingView() {
  const activePair = useOpenCEX((s) => s.activePair);
  const ticker = useOpenCEX((s) => s.tickers[activePair]);
  const [showOpen, setShowOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("book");

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Top: pair selector + ticker bar — responsive */}
      <div className="border-b border-border bg-card/30 px-3 py-2 flex items-center gap-3 flex-wrap">
        <PairSelector />
        {/* Desktop ticker stats */}
        {ticker && (
          <div className="hidden lg:flex items-center gap-5 text-xs">
            <Stat label="Last" value={fmtPrice(ticker.lastPrice, 2)} />
            <Stat
              label="24h Change"
              value={`${fmtPrice(ticker.priceChange, 2)} (${fmtPct(ticker.priceChangePct)})`}
              tone={ticker.priceChangePct >= 0 ? "up" : "down"}
            />
            <Stat label="24h High" value={fmtPrice(ticker.high, 2)} />
            <Stat label="24h Low" value={fmtPrice(ticker.low, 2)} />
            <Stat label="24h Vol" value={`${fmtCompact(ticker.volume)} `} suffix={activePair.split("/")[0]} />
            <Stat label="24h Vol (USDT)" value={fmtCompact(ticker.quoteVolume)} />
          </div>
        )}
        <div className="hidden lg:flex flex-1" />
        <button
          onClick={() => setShowOpen(!showOpen)}
          className="hidden lg:block text-[11px] text-secondary hover:text-foreground"
        >
          {showOpen ? "Hide" : "Show"} my orders
        </button>
      </div>

      {/* Mobile: condensed 24h stats strip */}
      {ticker && (
        <div className="lg:hidden border-b border-border bg-card/20 px-3 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <Stat label="24h" value={fmtPct(ticker.priceChangePct)} tone={ticker.priceChangePct >= 0 ? "up" : "down"} compact />
          <Stat label="High" value={fmtPrice(ticker.high, 2)} compact />
          <Stat label="Low" value={fmtPrice(ticker.low, 2)} compact />
          <Stat label="Vol" value={fmtCompact(ticker.quoteVolume)} compact suffix="USDT" />
        </div>
      )}

      {/* Desktop layout: 12-col grid */}
      <div className="hidden md:grid md:grid-cols-12 flex-1 gap-px bg-border overflow-hidden min-h-0">
        {/* Order book */}
        <div className="col-span-3 bg-card overflow-hidden">
          <OrderBook pair={activePair} />
        </div>

        {/* Chart + bottom orders */}
        <div className="col-span-6 bg-card flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <PriceChart pair={activePair} />
          </div>
          {showOpen && (
            <div className="h-56 border-t border-border overflow-hidden">
              <OpenOrders pair={activePair} />
            </div>
          )}
        </div>

        {/* Trade tape + order entry */}
        <div className="col-span-3 bg-card flex flex-col overflow-hidden">
          <div className="h-1/2 overflow-hidden border-b border-border">
            <TradeTape pair={activePair} />
          </div>
          <div className="h-1/2 overflow-hidden">
            <OrderEntry pair={activePair} />
          </div>
        </div>
      </div>

      {/* Mobile layout: chart + tabbed bottom + floating trade buttons */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        {/* Chart takes ~50% of viewport */}
        <div className="h-[42vh] min-h-[260px] border-b border-border bg-card overflow-hidden">
          <PriceChart pair={activePair} />
        </div>

        {/* Tabbed bottom section */}
        <div className="flex-1 flex flex-col min-h-0 bg-card">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as MobileTab)} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-3 rounded-none border-b border-border bg-elevated/40 h-9">
              <TabsTrigger value="book" className="text-xs gap-1">
                <BookOpen className="w-3 h-3" /> Book
              </TabsTrigger>
              <TabsTrigger value="trades" className="text-xs gap-1">
                <Receipt className="w-3 h-3" /> Trades
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs gap-1">
                <ListOrdered className="w-3 h-3" /> Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="book" className="flex-1 mt-0 overflow-hidden min-h-0">
              <OrderBook pair={activePair} />
            </TabsContent>
            <TabsContent value="trades" className="flex-1 mt-0 overflow-hidden min-h-0">
              <TradeTape pair={activePair} />
            </TabsContent>
            <TabsContent value="orders" className="flex-1 mt-0 overflow-hidden min-h-0">
              <OpenOrders pair={activePair} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile floating buy/sell buttons */}
      <MobileOrderSheet pair={activePair} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  suffix,
  compact,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  suffix?: string;
  compact?: boolean;
}) {
  const color = tone === "up" ? "text-primary" : tone === "down" ? "text-danger" : "text-foreground";
  return (
    <div className={`flex ${compact ? "flex-row items-baseline gap-1" : "flex-col"} leading-tight shrink-0`}>
      <span className="text-[10px] text-secondary uppercase tracking-wider">{label}</span>
      <span className={`${compact ? "text-xs" : "text-xs"} font-medium tabular ${color}`}>
        {value}
        {suffix && <span className="text-secondary ml-1">{suffix}</span>}
      </span>
    </div>
  );
}
