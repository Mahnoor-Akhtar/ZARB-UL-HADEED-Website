import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Shield, User, Lock, AlertCircle } from "lucide-react";
import { logoSrc, heroVideoSrc } from "@/lib/app-assets";
import { ThemeToggle } from "@/lib/theme";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Zarb Ul Hadeed" },
      { name: "description", content: "Secure access to the Zarb Ul Hadeed personnel management suite." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const user = login(username, password);
    if (!user) {
      setError("Invalid username or password. Ask an admin to assign credentials in Manage Command Group.");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[color:var(--forest-deep)]">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(0.75) contrast(1.05) brightness(0.4)" }}
        src={heroVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        alt=""
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--forest-deep)]/85 via-[color:var(--forest-deep)]/70 to-[color:var(--forest-deep)]/95" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 260px 60px rgba(0,0,0,0.75)" }}
      />

      {/* Back to site */}
      <Link
        to="/"
        className="absolute top-5 left-5 z-30 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-[color:var(--gold-soft)] transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to site
      </Link>
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/60 hidden sm:block">
          Secure Terminal · CXVII
        </span>
        <ThemeToggle />
      </div>

      {/* Content grid */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT — brand / logo side */}
        <div className="flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-16 lg:py-24 lg:border-r border-[color:var(--gold)]/20">
          <div className="max-w-md text-center lg:text-left">
            <img
              src={logoSrc}
              alt="Zarb Ul Hadeed emblem"
              className="h-28 w-28 lg:h-36 lg:w-36 rounded-full ring-1 ring-[color:var(--gold)]/50 mx-auto lg:mx-0 mb-6"
            />
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/70 mb-3">
              CXVII · TRET 1975
            </div>
            <h1 className="font-display text-gold-gradient text-3xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
              Zarb Ul Hadeed
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-[color:var(--gold)] to-transparent mb-5 mx-auto lg:mx-0" />
            <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
              Command your roster with precision & pride. Secure access to the unit's personnel management console.
            </p>

            <div className="hidden lg:flex items-center gap-4 mt-8 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold-soft)]/60">
              <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> RBAC</span>
              <span>·</span>
              <span>Offline-First</span>
              <span>·</span>
              <span>AES-256</span>
            </div>
          </div>
        </div>

        {/* RIGHT — login form */}
        <div className="flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-12 lg:py-24">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h2 className="font-display text-3xl font-light text-white tracking-tight mb-2">Sign in</h2>
              <p className="text-base text-white/40">Access your command console.</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold-soft)]" />
                <input
                  id="userid"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-transparent border border-[color:var(--gold)]/40 rounded-lg text-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)] transition-colors placeholder:text-white/40"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold-soft)]" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border border-[color:var(--gold)]/40 rounded-lg text-white pl-11 pr-11 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)] transition-colors placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[color:var(--gold-soft)]"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-white/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded-sm border-white/20 bg-transparent accent-[color:var(--gold)]"
                  />
                  Remember me
                </label>
                <a href="#forgot" className="text-[color:var(--gold-soft)] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-lg bg-[color:var(--forest)] hover:bg-[color:var(--forest)]/80 border border-[color:var(--gold)] text-white font-semibold text-sm tracking-[0.2em] uppercase transition-colors"
              >
                Login
              </button>

              <div className="rounded-md border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 px-3 py-2 text-xs text-[color:var(--gold-soft)]">
                Default super admin: `Haris` / `123456`
              </div>

              <p className="text-center text-xs text-white/40 pt-2">
                No account?{" "}
                <a href="#request-access" className="text-[color:var(--gold-soft)] hover:underline">
                  Request access
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
