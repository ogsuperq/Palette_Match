import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { consumeAuthReturn, getAuthReturn, startLogin } from "@/lib/auth";

export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      nav("/");
      return;
    }
    const sessionId = decodeURIComponent(m[1]);
    (async () => {
      try {
        const { data: user } = await http.post("/auth/session", { session_id: sessionId });
        setUser(user);
        const returnPath = user.role ? consumeAuthReturn() : getAuthReturn();
        window.history.replaceState({}, document.title, returnPath);
        if (!user.role) {
          nav("/onboard-role", { replace: true, state: { user } });
        } else {
          nav(returnPath, { replace: true });
        }
      } catch (e) {
        setError(e.response?.data?.detail || "Sign-in could not be completed.");
      }
    })();
  }, [nav, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      {error ? (
        <div className="max-w-md px-6 text-center">
          <h1 className="font-serif text-4xl">Sign-in interrupted</h1>
          <p className="text-neutral-600 mt-4">{error}</p>
          <button onClick={() => startLogin(getAuthReturn())} className="btn-primary mt-8">
            Try signing in again
          </button>
        </div>
      ) : (
        <div className="overline text-neutral-500">Signing you in…</div>
      )}
    </div>
  );
}
