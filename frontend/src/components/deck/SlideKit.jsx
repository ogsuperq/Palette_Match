import React from "react";

export const Overline = ({ children, className = "" }) => (
  <span className={`text-[11px] md:text-xs font-medium uppercase tracking-[0.28em] text-[#8a8a8a] ${className}`}>
    {children}
  </span>
);

export const SlideShell = ({ children, className = "", testId, light = false }) => (
  <div
    data-testid={testId}
    className={`slide-root flex flex-col justify-center px-7 py-12 sm:px-12 md:px-20 lg:px-28 ${light ? "arch-light" : ""} ${className}`}
  >
    {children}
  </div>
);

export const r = (i) => ({ className: "reveal", style: { animationDelay: `${i * 0.12}s` } });

export const GalleryFrame = ({ label, children, className = "", testId }) => (
  <div className={`flex flex-col items-center ${className}`} data-testid={testId}>
    <div className="gallery-frame p-3 w-full">
      <div className="bg-[#f4f2ee] border border-black/5 w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
        {children}
      </div>
    </div>
    {label && (
      <div className="brass-plaque mt-4 px-4 py-1.5 text-[10px] font-medium uppercase">
        {label}
      </div>
    )}
  </div>
);

export const Logo = ({ light = false, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <span className="inline-block w-7 h-7 rotate-45 border border-[#b08d2b]" />
    <span className={`font-serif-pm text-lg tracking-wide ${light ? "text-white" : "text-[#121212]"}`}>
      Palette&nbsp;Match
    </span>
  </div>
);
