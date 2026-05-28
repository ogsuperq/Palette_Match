import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/api";

export default function AuthCallback() {
  const nav = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      nav("/");
      return;
    }
    const sessionId = m[1];
    (async () => {
      try {
        const { data: user } = await http.post("/auth/session", { session_id: sessionId });
        // Clean URL
        window.history.replaceState({}, document.title, "/dashboard");
        if (!user.role) {
          nav("/onboard-role", { replace: true, state: { user } });
        } else {
          nav("/dashboard", { replace: true, state: { user } });
        }
      } catch (e) {
        nav("/", { replace: true });
      }
    })();
  }, [nav]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      <div className="overline text-neutral-500">Signing you in…</div>
    </div>
  );
}
