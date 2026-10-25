"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { OstrichLogo } from "@/components/opencex/ostrich-logo";

/**
 * Full-screen splash with animated Mbuni CEX logo + loading bar.
 * Calls onDone() after the animation completes (~2.2s).
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onDone, 200);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.4 0.008 250) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.4 0.008 250) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.18 152 / 0.18) 0%, transparent 70%)" }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Logo mark */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.7, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-black shadow-2xl shadow-emerald-500/30 overflow-hidden"
          animate={{
            boxShadow: [
              "0 0 40px oklch(0.72 0.18 152 / 0.4)",
              "0 0 80px oklch(0.72 0.18 152 / 0.6)",
              "0 0 40px oklch(0.72 0.18 152 / 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <OstrichLogo className="w-20 h-20" />
        </motion.div>

        {/* Orbiting coin */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-gold shadow-lg shadow-gold/50"
          style={{ top: "50%", left: "50%", marginLeft: -12, marginTop: -12 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            style={{ transform: "translate(60px, 0)" }}
            className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-[10px] font-bold text-black"
          >
            ₿
          </div>
        </motion.div>
      </motion.div>

      {/* Wordmark */}
      <motion.h1
        className="relative mt-8 text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Mbuni CEX
        <span className="ml-2 text-primary"> 2026</span>
      </motion.h1>

      <motion.p
        className="relative mt-2 text-sm text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        Spot Cryptocurrency Exchange · Rust · Go · React
      </motion.p>

      {/* Loading bar */}
      <div className="relative mt-10 w-64 h-1 bg-elevated/60 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="relative mt-3 text-[10px] text-secondary tabular w-64 flex justify-between">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Initializing matching engine
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-6 text-[10px] text-secondary/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        © 2026 Mbuni CEX · All systems ready
      </motion.div>
    </motion.div>
  );
}
