import { useMemo, useState } from "react";
import { MapPin, Calendar, Search, X, Filter as FilterIcon } from "lucide-react";
import personnel from "@/data/personnel.json";
import { defaultAvatarSrc } from "@/lib/app-assets";
import {
  Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProfileModal } from "@/components/NominalRoll";

type Person = {
  id: number; section: string; armyNo: string; rank: string;
  trade: string; name: string; cl: string; bty: string; remarks: string | null;
};

const PERSONNEL = personnel as Person[];

// Category → subcategories
const CATEGORY_MAP: Record<string, string[]> = {
  "Present":  ["Duty", "Office", "Standby"],
  "Leave":    ["P/Lve", "C/Lve", "Weekend", "Sick Lve"],
  "Aval":     ["Leave Reserve", "Other", "General Aval"],
  "Courses":  ["JNAC", "SNAC", "PT Ins", "Gunnery", "Cadre"],
  "Trg":      ["Guns", "Signals", "Driving", "Radar", "Survey"],
  "Att":      ["DIDO", "HQ", "Sister Unit", "Adm"],
  "Duty":     ["Guard", "QRF", "Escort", "Adm"],
  "Sports":   ["Football", "Volley Ball", "Athletics", "Boxing"],
  "CMH/Sick": ["SIQ", "Admitted", "Outpatient"],
  "U/D":      ["Awaiting", "Under Investigation"],
  "OSL/Pris": ["OSL", "Pris"],
};

// Assign deterministic category+sub to each person for demo
const assignments = new Map<number, { category: string; sub: string }>();
(function seed() {
  const cats = Object.keys(CATEGORY_MAP);
  for (const p of PERSONNEL) {
    let h = 0;
    const k = `${p.armyNo}:${p.id}`;
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
    const c = cats[h % cats.length];
    const subs = CATEGORY_MAP[c];
    const s = subs[(h >>> 4) % subs.length];
    assignments.set(p.id, { category: c, sub: s });
  }
})();

const remarksTone = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes("leave")) return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  if (c.includes("att") || c.includes("dido")) return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  if (c.includes("course") || c.includes("trg")) return "bg-violet-500/15 text-violet-300 border-violet-500/40";
  if (c.includes("u/d") || c.includes("osl") || c.includes("sick")) return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  if (c.includes("present") || c.includes("duty")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  return "bg-[color:var(--gold)]/15 text-[color:var(--gold-soft)] border-[color:var(--gold)]/40";
};

export default function AttendanceFilter() {
  const [category, setCategory] = useState<string>("Leave");
  const [subs, setSubs] = useState<string[]>([]);
  const [place, setPlace] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewing, setViewing] = useState<Person | null>(null);

  const subOptions = CATEGORY_MAP[category] || [];

  const toggleSub = (s: string) => {
    setSubs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const results = useMemo(() => {
    const list = PERSONNEL.filter((p) => {
      const a = assignments.get(p.id);
      if (!a) return false;
      if (category && a.category !== category) return false;
      if (subs.length > 0 && !subs.includes(a.sub)) return false;
      if (place.trim()) {
        const t = place.trim().toLowerCase();
        const hay = `${p.section} ${p.bty} ${p.cl} ${p.name}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
    return list;
  }, [category, subs, place]);

  const reset = () => {
    setCategory("Leave");
    setSubs([]);
    setPlace("");
    setStartDate("");
    setEndDate("");
  };

  if (viewing) {
    return (
      <ProfileModal
        person={viewing as any}
        onClose={() => setViewing(null)}
        onEdit={() => setViewing(null)}
      />
    );
  }

  return (
    <section className="space-y-4">

      {/* Criteria Card */}
      <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[color:var(--gold)]/20">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">
            <FilterIcon className="h-3.5 w-3.5" />
            Attendance Filter Criteria
          </div>
          <button
            onClick={reset}
            className="text-[10px] uppercase tracking-widest text-white/60 hover:text-[color:var(--gold-soft)] flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Category
            </label>
            <div className="mt-1.5">
              <UiSelect
                value={category}
                onValueChange={(v) => { setCategory(v); setSubs([]); }}
              >
                <SelectTrigger className="w-full bg-black/40 border-white/10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORY_MAP).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </UiSelect>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Destination / Place
            </label>
            <div className="mt-1.5 relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                type="text"
                placeholder="Search location..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm text-white placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            Subcategories Filter
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {subOptions.map((s) => {
              const active = subs.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSub(s)}
                  className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-[color:var(--gold)] border-[color:var(--gold)] text-black"
                      : "bg-black/40 border-[color:var(--gold)]/30 text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/10"
                  }`}
                >
                  {s}
                </button>
              );
            })}
            {subOptions.length === 0 && (
              <span className="text-[11px] italic text-white/40">No subcategories for this category</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Start Date
            </label>
            <div className="mt-1.5 relative">
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="text"
                placeholder="Select Start Date"
                className="w-full pl-3 pr-9 py-2 rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm text-white placeholder:text-white/30"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              End Date
            </label>
            <div className="mt-1.5 relative">
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                type="text"
                placeholder="Select End Date"
                className="w-full pl-3 pr-9 py-2 rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm text-white placeholder:text-white/30"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          Filtered Results
        </div>
        <div className="text-[11px] font-bold text-[color:var(--gold-soft)]">
          {results.length} Personnel Found
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center text-sm text-white/50 italic py-10">
          No personnel match your filters.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {results.map((p) => {
            const a = assignments.get(p.id)!;
            return (
              <li key={p.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewing(p)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setViewing(p); } }}
                  className="flex items-center gap-3 rounded-xl border border-[color:var(--gold)]/15 bg-black/30 px-3 py-3 hover:bg-black/45 transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={defaultAvatarSrc}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover object-top ring-1 ring-[color:var(--gold)]/50"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {p.rank} {p.trade} {p.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/60">
                          <Calendar className="h-3 w-3" />
                          <span>6/7/2026 (Infinite)</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider rounded-md border px-2 py-0.5 shrink-0 ${remarksTone(a.category)}`}>
                        {a.category} → {a.sub}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
}
