const PREVIEW_RETURN_KEY = "palette_match_preview_return";

export function rememberPreviewReturnState(state) {
  try {
    sessionStorage.setItem(
      PREVIEW_RETURN_KEY,
      JSON.stringify({
        ...state,
        scrollY: typeof window !== "undefined" ? window.scrollY : 0,
        saved_at: new Date().toISOString(),
      })
    );
  } catch {
    // Preview should still open if session storage is unavailable.
  }
}

export function consumePreviewReturnState() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(PREVIEW_RETURN_KEY) || "{}");
    sessionStorage.removeItem(PREVIEW_RETURN_KEY);
    return stored;
  } catch {
    return {};
  }
}

export function returnFromPreview(nav, fallbackPath) {
  const stored = consumePreviewReturnState();
  const returnTo = stored.returnTo || fallbackPath;
  nav(returnTo);
  window.setTimeout(() => {
    if (Number.isFinite(stored.scrollY)) {
      window.scrollTo(0, stored.scrollY);
    }
  }, 0);
}
