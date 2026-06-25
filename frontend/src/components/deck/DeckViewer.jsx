import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SLIDES } from "./slides";
import { exportDeckToPdf } from "../../lib/exportPdf";
import { SLIDE_TITLES } from "../../data/deck";

const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };
const variants = {
  initial: { opacity: 0, y: 15, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -15, filter: "blur(4px)" },
};

export default function DeckViewer() {
  const total = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const touchStart = useRef(null);

  const go = useCallback((dir) => {
    setIndex((i) => Math.min(total - 1, Math.max(0, i + dir)));
  }, [total]);

  const goto = useCallback((i) => setIndex(Math.min(total - 1, Math.max(0, i))), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      if (e.key === "Home") goto(0);
      if (e.key === "End") goto(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goto, total]);

  const handleDownload = useCallback(async () => {
    setExporting(true);
    toast.loading("Preparing your PDF…", { id: "pdf" });
    try {
      await exportDeckToPdf();
      toast.success("Deck downloaded.", { id: "pdf" });
    } catch (e) {
      toast.error("Export failed. Please try again.", { id: "pdf" });
    } finally {
      setExporting(false);
    }
  }, []);

  const onTouchStart = (e) => { touchStart.current = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    touchStart.current = null;
  };

  const Active = SLIDES[index];

  return (
    <div className="investor-deck relative h-screen w-screen overflow-hidden bg-white"
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-black/10 z-30" data-testid="deck-progress">
        <div className="h-full bg-[#b08d2b] transition-all duration-500 ease-out"
          style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Top bar */}
      <div className="fixed top-5 left-6 md:left-10 z-30 flex items-center gap-3">
        <span className="inline-block w-5 h-5 rotate-45 border border-[#b08d2b]" />
        <span className="font-serif-pm text-sm tracking-wide text-[#121212]">Palette Match</span>
      </div>
      <div className="fixed top-4 right-6 md:right-10 z-40 flex items-center gap-4">
        <span className="text-xs tracking-[0.18em] text-[#8a8a8a] hidden md:block">
          {SLIDE_TITLES[index]}
        </span>
        <button onClick={handleDownload} disabled={exporting} data-testid="deck-pdf-toolbar-btn"
          className="flex items-center gap-2 border border-black/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-[#1f1f1f] hover:border-[#b08d2b] hover:text-[#b08d2b] transition-colors disabled:opacity-50">
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>

      {/* Slide stage */}
      <AnimatePresence mode="wait">
        <motion.div key={index} variants={variants} initial="initial" animate="animate" exit="exit"
          transition={transition} className="absolute inset-0">
          <Active onDownload={index === total - 1 ? handleDownload : undefined} />
        </motion.div>
      </AnimatePresence>

      {/* Side arrows */}
      {index > 0 && (
        <button onClick={() => go(-1)} data-testid="deck-prev-btn"
          className="fixed left-2 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2 text-[#9a9a9a] hover:text-[#121212] transition-colors">
          <ChevronLeft className="w-7 h-7" strokeWidth={1.2} />
        </button>
      )}
      {index < total - 1 && (
        <button onClick={() => go(1)} data-testid="deck-next-btn"
          className="fixed right-2 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2 text-[#9a9a9a] hover:text-[#121212] transition-colors">
          <ChevronRight className="w-7 h-7" strokeWidth={1.2} />
        </button>
      )}

      {/* Bottom controls */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button key={SLIDE_TITLES[i]} onClick={() => goto(i)} data-testid={`deck-dot-${i}`}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-[#b08d2b]" : "w-1.5 bg-black/20 hover:bg-black/40"}`} />
        ))}
      </div>
      <div className="fixed bottom-5 left-6 md:left-10 z-30">
        <span className="text-xs tracking-[0.15em] text-[#8a8a8a]" data-testid="deck-slide-counter">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Hidden export layout */}
      <div id="pdf-export-root" className="no-anim" style={{ display: "none", position: "fixed", left: "-99999px", top: 0 }}>
        {SLIDES.map((S, i) => (
          <div className="pdf-page" key={i}>
            <S />
          </div>
        ))}
      </div>
    </div>
  );
}
