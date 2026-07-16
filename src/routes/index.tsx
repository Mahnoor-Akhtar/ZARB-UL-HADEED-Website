import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Users, GitBranch, BarChart3, MapPin, Layers, FileText, Download,
  Lock, WifiOff, Smartphone, Monitor, Check, ChevronDown, Mail, Phone, MapPinned,
  LogIn, PlayCircle, Menu, X, ArrowRight, Star, FileSpreadsheet, FileDown
} from "lucide-react";
import heroImg from "@/assets/dashboard-hero.jpg";
import screenRoster from "@/assets/screen-roster.jpg";
import screenAnalysis from "@/assets/screen-analysis.jpg";
import screenBattery from "@/assets/screen-battery.jpg";
import screenMovement from "@/assets/screen-movement.jpg";
import { logoSrc, heroVideoSrc } from "@/lib/app-assets";
import { ThemeToggle } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80" },
    ],
  }),
  component: Landing,
});

const nav = [
  { label: "Features", href: "#features" },
  { label: "Screens", href: "#screens" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[color:var(--forest-deep)]/80 border-b border-gold">
      <div className="mx-auto max-w-7xl px-[15px] flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3">
            <img src={logoSrc} alt="Zarb Ul Hadeed CXVII emblem" className="h-14 w-14 rounded-full ring-1 ring-[color:var(--gold)]/50" />
            <div className="leading-tight">
              <div className="font-display text-gold-gradient text-2xl font-bold tracking-wide">ZARB UL HADEED</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/70">CXVII · TRET 1975</div>
            </div>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map(n => (
            <a key={n.href} href={n.href} className="text-base text-white/80 hover:text-[color:var(--gold-soft)] transition-colors">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-3 text-base rounded-md border border-gold text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/10 transition">
            <LogIn className="h-4 w-4" /> Login
          </Link>
          <a href="#cta" className="inline-flex items-center gap-2 px-5 py-3 text-base rounded-md btn-neon hover:btn-neon-hover">
            <PlayCircle className="h-4 w-4" /> Request Demo
          </a>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gold bg-[color:var(--forest-deep)] px-4 py-4 space-y-3">
          {nav.map(n => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block text-sm text-white/80">{n.label}</a>
          ))}
          <a href="#cta" className="block text-center py-2 rounded-md btn-neon">Request Demo</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-dark relative overflow-hidden h-[calc(100vh-5rem)] min-h-[650px] max-h-[950px] flex items-center">
      {/* Background video — local and reliable */}
      <video
        src={heroVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(0.85) contrast(1.08) brightness(0.85)" }}
      />

      {/* Cinematic overlays — dark on the left for legibility, clear on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--forest-deep)]/92 via-[color:var(--forest-deep)]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--forest-deep)]/40 via-transparent to-[color:var(--forest-deep)]/70" />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 200px 40px rgba(3,20,10,0.9)" }} />
      {/* Fine grid texture */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(205,155,45,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(205,155,45,0.4) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-1 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-sm border-l-2 border-[color:var(--gold)] bg-[color:var(--forest-deep)]/60 backdrop-blur-sm px-3 py-1.5 text-xs uppercase tracking-[0.35em] text-[color:var(--gold-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--neon)] shadow-[0_0_10px_var(--neon)]" />
            CXVII · Tret · Est. 1975
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-display font-bold leading-[1.05] tracking-tight text-[3rem] sm:text-6xl lg:text-[4.5rem] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
            <span className="block text-white">Command Your Roster.</span>
            <span className="block text-gold-gradient">With Precision & Pride.</span>
          </h1>

          {/* Subtitle */}
         

          {/* Divider */}
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-[color:var(--gold)] to-transparent" />

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#cta" className="inline-flex items-center gap-2 px-8 py-4 rounded-md btn-neon hover:btn-neon-hover text-base font-semibold tracking-wide shadow-[0_10px_30px_-10px_rgba(0,255,102,0.5)]">
              Request Demo <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-md border border-gold bg-[color:var(--forest-deep)]/50 backdrop-blur text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/15 transition text-base font-medium tracking-wide">
              Explore Features
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[color:var(--gold)]/25 pt-5 text-[10px] uppercase tracking-[0.25em] text-white/70">
            <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-[color:var(--gold)]" /> RBAC Secured</div>
            <div className="flex items-center gap-2"><WifiOff className="h-3.5 w-3.5 text-[color:var(--gold)]" /> Offline-First</div>
            <div className="flex items-center gap-2"><Monitor className="h-3.5 w-3.5 text-[color:var(--gold)]" /> Cross-Platform</div>
          </div>
        </div>
      </div>

      {/* Corner marks — military stencil feel */}
      <div className="hidden md:block absolute top-6 right-6 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/60 font-mono">
        <div>N 33°52'12"</div>
        <div className="text-right">E 72°43'08"</div>
      </div>
      <div className="hidden md:flex absolute bottom-6 right-6 items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/60 font-mono">
        <span className="h-px w-8 bg-[color:var(--gold)]/40" />
        Operations Ready
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { k: "500+", v: "Personnel Managed" },
    { k: "3", v: "Role Levels" },
    { k: "PDF / CSV", v: "Report Exports" },
    { k: "100%", v: "Offline Capable" },
  ];
  return (
    <section className="border-y border-gold bg-[color:var(--forest-deep)]">
      <div className="mx-auto max-w-7xl px-1 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div key={i.v} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-bold text-gold-gradient">{i.k}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">{i.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: GitBranch, title: "Parade Tree", desc: "Hierarchical command view of every battery, troop and section — expand and drill down in seconds." },
    { icon: BarChart3, title: "Analysis Dashboard", desc: "Live KPIs, strength trends and readiness charts. Data for decisions, not decoration." },
    { icon: Users, title: "Nominal Roll", desc: "Searchable, sortable roster with rank, MOS, status and duty — the source of truth for the unit." },
    { icon: MapPin, title: "Movement History", desc: "Timeline of postings, TDYs and transfers. Audit trail is baked in — never lose a record." },
    { icon: Layers, title: "Custom Groups", desc: "Build ad-hoc groups for exercises, deployments or courses without touching the main structure." },
    { icon: FileText, title: "Reports Export", desc: "One-click PDF and CSV. Ready for the CO's desk or your favourite spreadsheet." },
  ];
  return (
    <section id="features" className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-7xl px-1">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Features</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Everything the unit needs. Nothing it doesn't.</h2>
          <p className="mt-4 text-[color:var(--muted-foreground)]">
            Built by soldiers, for soldiers. Every feature earns its place on the parade ground.
          </p>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="card-forest p-6 group hover:border-[color:var(--gold)] transition-colors">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gold bg-[color:var(--gold)]/5 text-[color:var(--gold)] group-hover:bg-[color:var(--gold)]/15 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl text-[color:var(--gold-soft)]">{f.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Screens() {
  const shots = [
    { img: heroImg, label: "Dashboard" },
    { img: screenAnalysis, label: "Analysis" },
    { img: screenBattery, label: "Battery Detail" },
    { img: screenRoster, label: "Nominal Roll" },
    { img: screenMovement, label: "Movement History" },
  ];
  return (
    <section id="screens" className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-7xl px-1">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Screens</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">A tour of the operations room.</h2>
          </div>
          <p className="text-sm text-[color:var(--muted-foreground)] max-w-sm">Consistent design language across mobile, tablet, desktop and web.</p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-7 card-forest overflow-hidden">
            <img src={shots[0].img} alt={shots[0].label} loading="lazy" className="w-full h-full object-cover" />
            <div className="p-5 border-t border-gold flex items-center justify-between">
              <div className="font-display text-[color:var(--gold-soft)]">{shots[0].label}</div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">Desktop</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4 md:gap-6">
            {shots.slice(1).map(s => (
              <div key={s.label} className="card-forest overflow-hidden">
                <img src={s.img} alt={s.label} loading="lazy" className="w-full h-56 object-cover" />
                <div className="p-3 border-t border-gold text-xs font-display text-[color:var(--gold-soft)] text-center">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    { name: "User", desc: "Field-level access", perms: [true, true, false, false, false, false] },
    { name: "Admin", desc: "Battery / Company", perms: [true, true, true, true, true, false] },
    { name: "Superadmin", desc: "Unit-wide", perms: [true, true, true, true, true, true] },
  ];
  const caps = ["View Roster", "View Parade Tree", "Edit Personnel", "Manage Movements", "Export Reports", "Manage Roles"];

  return (
    <section id="roles" className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-7xl px-1">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Access Control</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Role-based access. Chain of command respected.</h2>
        </div>
        <div className="mt-12 card-forest overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold">
                <th className="text-left p-5 font-display text-[color:var(--gold-soft)]">Capability</th>
                {roles.map(r => (
                  <th key={r.name} className="p-5 text-center">
                    <div className="font-display text-[color:var(--gold-soft)]">{r.name}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)] font-normal">{r.desc}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {caps.map((c, i) => (
                <tr key={c} className="border-b border-gold/50 last:border-0">
                  <td className="p-5 text-white/90">{c}</td>
                  {roles.map((r, j) => (
                    <td key={j} className="p-5 text-center">
                      {r.perms[i] ? (
                        <Check className="inline h-5 w-5 text-[color:var(--neon)]" />
                      ) : (
                        <span className="text-[color:var(--muted-foreground)]">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Login", d: "Secure sign-in with role-mapped access." },
    { n: "02", t: "Manage Roster", d: "Add, edit and organise personnel across the parade tree." },
    { n: "03", t: "Track Movements", d: "Log postings, transfers and TDY with a full audit trail." },
    { n: "04", t: "Generate Reports", d: "Export PDF / CSV — signed, dated and ready." },
  ];
  return (
    <section className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-7xl px-1">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">How it works</div>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient max-w-2xl">Four steps from login to signed report.</h2>
        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.n} className="card-forest p-6 relative">
              <div className="font-display text-5xl text-gold-gradient/40">{s.n}</div>
              <h3 className="mt-3 font-display text-xl text-[color:var(--gold-soft)]">{s.t}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{s.d}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-4 top-10 h-6 w-6 text-[color:var(--gold)]/50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechHighlights() {
  const items = [
    { icon: Layers, t: "MVVM Architecture", d: "Clean separation. Testable. Maintainable for the long haul." },
    { icon: WifiOff, t: "Offline-First Storage", d: "Local encrypted store. Sync when you're back on the wire." },
    { icon: Smartphone, t: "Cross-Platform", d: "One codebase — mobile, tablet, desktop and web." },
  ];
  return (
    <section className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-7xl px-1 grid md:grid-cols-3 gap-6">
        {items.map(i => (
          <div key={i.t} className="card-forest p-8">
            <i.icon className="h-8 w-8 text-[color:var(--gold)]" />
            <h3 className="mt-5 font-display text-xl text-[color:var(--gold-soft)]">{i.t}</h3>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reports() {
  return (
    <section className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-7xl px-1 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Reports</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Signed, dated, and ready for the CO.</h2>
          <p className="mt-4 text-[color:var(--muted-foreground)] max-w-lg">
            One click delivers a formatted nominal roll, parade state, movement register or
            custom group report. PDF for the record. CSV for the analyst.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-gold px-4 py-2 text-sm text-[color:var(--gold-soft)]">
              <FileDown className="h-4 w-4" /> PDF Export
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-gold px-4 py-2 text-sm text-[color:var(--gold-soft)]">
              <FileSpreadsheet className="h-4 w-4" /> CSV Export
            </div>
          </div>
        </div>
        <div className="card-forest p-6">
          <div className="flex items-center justify-between border-b border-gold pb-3">
            <div className="flex items-center gap-2">
              <img src={logoSrc} alt="" className="h-8 w-8" />
              <div>
                <div className="font-display text-sm text-[color:var(--gold-soft)]">NOMINAL ROLL</div>
                <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted-foreground)]">Zarb Ul Hadeed · CXVII</div>
              </div>
            </div>
            <div className="text-[10px] text-[color:var(--muted-foreground)]">14 JUL 2026</div>
          </div>
          <div className="mt-4 space-y-2 text-sm font-mono">
            {[
              ["MAJ", "Jameson, W.", "HQ", "PRESENT"],
              ["CPT", "Anderson, M.", "A Coy", "PRESENT"],
              ["SGT", "Thompson, B.", "B Coy", "DEPLOYED"],
              ["SSG", "Lopez, C.", "BSTB", "TRAINING"],
              ["SPC", "Johnson, C.", "D Coy", "ON LEAVE"],
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 py-1 border-b border-gold/20 last:border-0">
                <span className="col-span-2 text-[color:var(--gold)]">{row[0]}</span>
                <span className="col-span-5 text-white/90">{row[1]}</span>
                <span className="col-span-2 text-[color:var(--muted-foreground)]">{row[2]}</span>
                <span className="col-span-3 text-right text-xs text-[color:var(--neon)]">{row[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { icon: Shield, t: "RBAC Enforced", d: "Every action gated by role. No stray privileges." },
    { icon: Lock, t: "Data Privacy", d: "Encrypted at rest. TLS in transit. No third-party trackers." },
    { icon: WifiOff, t: "Offline-First", d: "The unit doesn't stop when the network does." },
  ];
  return (
    <section className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-7xl px-1">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Security</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Built like a bunker.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i.t} className="card-forest p-8">
              <i.icon className="h-8 w-8 text-[color:var(--gold)]" />
              <h3 className="mt-5 font-display text-xl text-[color:var(--gold-soft)]">{i.t}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "Cut our Sunday parade prep from four hours to twenty minutes. Everyone in the mess noticed.", who: "Adjutant, 2nd Battalion" },
    { q: "First piece of software that actually respects how a unit is structured. Feels made for us.", who: "Company Commander" },
    { q: "The offline mode saved us during an exercise. No signal, no problem — every record synced later.", who: "S-1 NCO" },
  ];
  return (
    <section className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-7xl px-1">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">From the field</div>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient max-w-2xl">Trusted by those who serve.</h2>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <figure key={i} className="card-forest p-8">
              <div className="flex gap-1 text-[color:var(--gold)]">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-white/90 leading-relaxed">"{t.q}"</blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">— {t.who}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Unit", price: "Free", desc: "For a single sub-unit up to 100 personnel.", features: ["Parade tree & roster", "PDF/CSV exports", "Offline storage", "Community support"], cta: "Get Started" },
    { name: "Battalion", price: "On Request", featured: true, desc: "Full unit deployment with role hierarchy.", features: ["Everything in Unit", "Up to 1,000 personnel", "Movement history", "Priority support"], cta: "Request Demo" },
    { name: "Formation", price: "Custom", desc: "Multi-battalion / brigade rollout.", features: ["Everything in Battalion", "Unlimited personnel", "Custom reports", "On-site training"], cta: "Contact Sales" },
  ];
  return (
    <section id="pricing" className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-7xl px-1">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Pricing</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Choose the deployment that fits.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.name} className={`card-forest p-8 relative ${p.featured ? "ring-1 ring-[color:var(--gold)]" : ""}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest btn-neon">Recommended</div>
              )}
              <div className="font-display text-2xl text-[color:var(--gold-soft)]">{p.name}</div>
              <div className="mt-2 font-display text-4xl text-gold-gradient">{p.price}</div>
              <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{p.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[color:var(--neon)] mt-0.5" /> <span className="text-white/90">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#cta" className={`mt-8 inline-flex w-full justify-center px-4 py-3 rounded-md text-sm ${p.featured ? "btn-neon hover:btn-neon-hover" : "border border-gold text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/10"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: "Which platforms are supported?", a: "Android, iOS, Windows, macOS and any modern web browser. One account, all devices." },
    { q: "Does it truly work offline?", a: "Yes. The app operates fully offline with a local encrypted store. Data syncs automatically when connectivity returns." },
    { q: "How is data secured?", a: "Role-based access control, encryption at rest, TLS in transit, and no third-party telemetry. Deployable on-prem if required." },
    { q: "Can we customise reports?", a: "Absolutely. Nominal roll, parade state, movement register and custom groups can all be exported to PDF or CSV." },
    { q: "What support is included?", a: "Community support on the Unit plan. Priority email and on-site training available on Battalion and Formation plans." },
  ];
  return (
    <section className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)] text-center">FAQ</div>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient text-center">Questions from the parade ground.</h2>
        <div className="mt-12 space-y-3">
          {items.map((it, i) => (
            <div key={i} className="card-forest">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-display text-[color:var(--gold-soft)]">{it.q}</span>
                <ChevronDown className={`h-5 w-5 text-[color:var(--gold)] transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 -mt-2 text-sm text-[color:var(--muted-foreground)] leading-relaxed">{it.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="py-16 bg-[color:var(--background)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative card-forest p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(600px 300px at 50% 0%, #CD9B2D 0%, transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gold-gradient">Ready to modernise the unit?</h2>
            <p className="mt-4 text-[color:var(--muted-foreground)] max-w-xl mx-auto">
              Book a 30-minute demo. We'll walk through the parade tree, reports and offline mode with your data model in mind.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-md btn-neon hover:btn-neon-hover text-sm">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-gold text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/10 transition text-sm">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-16 bg-forest-gradient">
      <div className="mx-auto max-w-7xl px-1 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">Contact</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-gold-gradient">Send a signal.</h2>
          <p className="mt-4 text-[color:var(--muted-foreground)] max-w-md">We usually respond within one working day. For urgent operational requests, use the phone line.</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-[color:var(--gold)]" /> contact@zarbulhadeed.mil</div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-[color:var(--gold)]" /> +92 000 000 0000</div>
            <div className="flex items-center gap-3"><MapPinned className="h-5 w-5 text-[color:var(--gold)]" /> Unit HQ, CXVII Lines, TRET</div>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); alert("Message queued. We'll be in touch."); }} className="card-forest p-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">Name</label>
            <input required className="mt-2 w-full bg-[color:var(--input)] border border-gold rounded-md px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)]" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">Email</label>
            <input required type="email" className="mt-2 w-full bg-[color:var(--input)] border border-gold rounded-md px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)]" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--muted-foreground)]">Message</label>
            <textarea required rows={5} className="mt-2 w-full bg-[color:var(--input)] border border-gold rounded-md px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[color:var(--gold)]" />
          </div>
          <button className="w-full py-3 rounded-md btn-neon hover:btn-neon-hover text-sm">Send Message</button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[color:var(--forest-deep)] border-t border-gold">
      <div className="mx-auto max-w-7xl px-1 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="Emblem" className="h-14 w-14 rounded-full ring-1 ring-[color:var(--gold)]/40" />
            <div>
              <div className="font-display text-gold-gradient text-lg font-bold">ZARB UL HADEED</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold-soft)]/70">CXVII · TRET · 1975</div>
            </div>
          </div>
          <p className="mt-5 text-sm text-[color:var(--muted-foreground)] max-w-md">
            Personnel management, purpose-built for the unit. Forged in tradition, wired for the modern battlefield.
          </p>
        </div>
        <div>
          <div className="font-display text-[color:var(--gold-soft)]">Product</div>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted-foreground)]">
            <li><a href="#features" className="hover:text-[color:var(--gold-soft)]">Features</a></li>
            <li><a href="#screens" className="hover:text-[color:var(--gold-soft)]">Screens</a></li>
            <li><a href="#pricing" className="hover:text-[color:var(--gold-soft)]">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-[color:var(--gold-soft)]">Company</div>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted-foreground)]">
            <li><a href="#contact" className="hover:text-[color:var(--gold-soft)]">Contact</a></li>
            <li><a href="#cta" className="hover:text-[color:var(--gold-soft)]">Request Demo</a></li>
            <li><a href="#" className="hover:text-[color:var(--gold-soft)]">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold">
        <div className="mx-auto max-w-7xl px-1 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--muted-foreground)]">
          <div>© {new Date().getFullYear()} Zarb Ul Hadeed CXVII. All rights reserved.</div>
          <div className="uppercase tracking-widest">Forged in Tradition · Wired for Tomorrow</div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-10">
        <Hero />
        <Stats />
        <Features />
        <Screens />
        <Roles />
        <HowItWorks />
        <TechHighlights />
        <Reports />
        <Security />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
