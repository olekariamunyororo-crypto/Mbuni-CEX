"use client";

import { useEffect, useRef } from "react";
import { useOpenCEX } from "@/lib/opencex/store";
import { BinanceFeed } from "@/lib/opencex/binance-feed";

export function useBinanceFeed() {
  const activePair = useOpenCEX((s) => s.activePair);
  const setLiveMode = useOpenCEX((s) => s.setLiveMode);
  const setFeedConnected = useOpenCEX((s) => s.setFeedConnected);
  const setFeed = useOpenCEX((s) => s.setFeed);
  const updateBook = useOpenCEX((s) => s.updateBookFromBinance);
  const updateTrade = useOpenCEX((s) => s.updateTradeFromBinance);
  const updateTicker = useOpenCEX((s) => s.updateTickerFromBinance);
  const updateKline = useOpenCEX((s) => s.updateKlineFromBinance);

  const feedRef = useRef<BinanceFeed | null>(null);

  useEffect(() => {
    setLiveMode(true);

    const feed = new BinanceFeed(activePair, {
      onConnect: () => setFeedConnected(true),
      onDisconnect: () => setFeedConnected(false),
      onDepth: (d) => updateBook(d.pair, d.bids, d.asks),
      onTrade: (t) => updateTrade(t.pair, t.price, t.qty, t.side, t.timestamp),
      onTicker: (t) =>
        updateTicker(t.pair, t.lastPrice, t.priceChangePct, t.high, t.low, t.volume, t.quoteVolume),
      onKline: (k) =>
        updateKline(k.pair, k.openTime, k.open, k.high, k.low, k.close, k.volume, k.isClosed),
    });

    feed.connect();
    feedRef.current = feed;
    setFeed(feed);

    return () => {
      feed.close();
      feedRef.current = null;
      setFeed(null);
      setFeedConnected(false);
      setLiveMode(false);
    };
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.switchPair(activePair);
    }
  }, [activePair]);
}
