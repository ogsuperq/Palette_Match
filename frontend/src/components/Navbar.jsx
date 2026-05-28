import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const startLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <header
      data-testid="nav-bar"
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-neutral-200"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-tighter">Palette Match</span>
          <span className="hidden sm:inline overline text-neutral-500">— curated commissions</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm">
          <Link to="/artists" data-testid="nav-artists" className="hover:text-neutral-900 text-neutral-600 hidden sm:inline">
            Discover Artists
          </Link>
          <Link to="/intake" data-testid="nav-intake" className="hover:text-neutral-900 text-neutral-600 hidden sm:inline">
            Commission Art
          </Link>
          {user ? (
            <>
              <button
                data-testid="nav-dashboard"
                onClick={() => nav("/dashboard")}
                className="text-neutral-700 hover:text-neutral-900"
              >
                Dashboard
              </button>
              <button
                data-testid="nav-logout"
                onClick={logout}
                className="overline text-neutral-500 hover:text-neutral-900"
              >
                Sign out
              </button>
              {user.picture && (
                <img src={user.picture} alt="" className="h-8 w-8 rounded-full border border-neutral-200" />
              )}
            </>
          ) : (
            <button data-testid="nav-signin" onClick={startLogin} className="btn-primary !py-2 !px-4">
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
