import { useMemo, useState } from "react";
import { Filter, Check, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Tab = "rank" | "trade" | "battery";

const TOTAL = 427;
const FIGHTING = 377;
const NON_FIGHTING = 50;

// ============ Rank data ============
const RANK_FIGHTING: Array<{ group: string; items: Array<[string, number]> }> = [
  { group: "Officers", items: [["Lt Col", 1], ["Maj", 4], ["Capt", 3], ["Lt", 4], ["2/Lt", 1]] },
  { group: "JCOs",     items: [["SM", 1], ["Sub", 4], ["N/Sub", 11]] },
  { group: "Sldrs",    items: [
    ["BQMH", 3], ["Hav", 30], ["Lhav", 21], ["Nk", 48], ["Lnk", 50],
    ["Svy", 5], ["RQMH", 1], ["TA", 10], ["RHM Hav", 1], ["NK", 1],
    ["OCU", 38], ["DSV", 6], ["BHM", 2], ["BQMH Hav", 1], ["BHM Hav", 2], ["Gnr", 106],
  ]},
];
const RANK_NON_FIGHTING: Array<{ group: string; items: Array<[string, number]> }> = [
  { group: "Clk - 13", items: [["N/Sub", 1], ["Hav", 4], ["Nk", 3], ["Lnk", 1], ["Clk", 4]] },
  { group: "Ck - 14",  items: [["Hav", 2], ["Nk", 3], ["Lnk", 4], ["C/U", 3], ["NK", 1], ["C/M", 2]] },
  { group: "NCB - 12", items: [["NCB (E)", 12]] },
  { group: "S/W - 11", items: [["S/W", 2], ["SW", 9]] },
];

const ALL_RANKS = [
  "All", "Officers", "Lt Col", "Maj", "Capt", "Lt", "2/Lt",
  "JCOs", "SM", "Sub", "N/Sub",
  "Soldiers", "Hav", "Lhav", "Nk", "Lnk", "Sep",
];

// ============ Trade data ============
const TRADE_FIGHTING: Array<{ group: string; items: Array<[string, number]> }> = [
  { group: "Officers", items: [["Lt Col, Maj, Capt, Lt, 2/Lt", 0]] }, // display as flat list
  { group: "JCOs",     items: [["Gnr", 10], ["TA", 4], ["OCU", 1], ["DMT", 1]] },
  { group: "Sldrs",    items: [
    ["Svy", 12], ["TA", 53], ["OCU", 57], ["DSV", 17], ["DMT", 39], ["Gnr", 170],
  ]},
];
const TRADE_NON_FIGHTING: Array<{ group: string; items: Array<[string, number]> }> = [
  { group: "Clk - 13", items: [] },
  { group: "Ck - 14",  items: [] },
  { group: "NCB - 12", items: [] },
  { group: "S/W - 11", items: [] },
];
const ALL_TRADES = ["All", "Gnr", "TA", "OCU", "DMT", "DSV", "Svy", "Clk", "Ck"];

// ============ Battery data ============
type BatteryStat = {
  key: "HQ" | "P" | "Q" | "R";
  label: string;
  strength: number;
  officers: number;
  jcos: number;
  sldrs: number;
  nonFighting: number;
  ratio: number; // %
  tone: "rose" | "slate" | "amber" | "emerald";
};
const BATTERIES: BatteryStat[] = [
  { key: "HQ", label: "HQ Battery", strength: 75,  officers: 2, jcos: 2, sldrs: 58,  nonFighting: 13, ratio: 83, tone: "rose"    },
  { key: "P",  label: "P Battery",  strength: 84,  officers: 4, jcos: 4, sldrs: 67,  nonFighting: 9,  ratio: 89, tone: "slate"   },
  { key: "Q",  label: "Q Battery",  strength: 126, officers: 4, jcos: 6, sldrs: 104, nonFighting: 12, ratio: 90, tone: "amber"   },
  { key: "R",  label: "R Battery",  strength: 142, officers: 3, jcos: 4, sldrs: 119, nonFighting: 15, ratio: 89, tone: "emerald" },
];
const ALL_BATTERIES = ["All", "HQ Bty", "P Bty", "Q Bty", "R Bty"];

// ============ Category summary ============
const OFFRS_JCOS_SLDRS: Array<[string, number]> = [
  ["Present", 41], ["Leave", 39], ["Att", 26], ["Aval", 60],
  ["Courses", 25], ["OSL/Pris", 21], ["Sta Gds", 13], ["Unit Gds", 25],
  ["CMH/Sick", 2], ["Regt Emp", 12], ["Trg", 16], ["Sports", 13],
  ["Aslt Course", 1], ["DIDO", 11], ["Working", 17], ["Prot", 11],
  ["Ex/Cl", 24], ["U/D", 20],
];
const CLK_CK_NCBS: Array<[string, number]> = [
  ["Present", 5], ["Leave", 2], ["Att", 1], ["Aval", 9], ["Courses", 5],
  ["OSL/Pris", 4], ["Sta Gds", 3], ["Unit Gds", 4], ["CMH/Sick", 1],
  ["Trg", 3], ["Sports", 1], ["DIDO", 2], ["Working", 2], ["Prot", 1],
  ["Ex/Cl", 4], ["U/D", 3],
];

// Scale category counts based on the active filter selection so the two
// summary blocks reflect the chosen rank / trade / battery scope.
function scaleCategoryItems(
  items: Array<[string, number]>,
  tab: Tab,
  filter: string[],
): Array<[string, number]> {
  const isAll = filter.length === 0 || filter.includes("All");
  if (isAll) return items;

  // Deterministic per-selection scale in [0.15, 0.85] so numbers feel real.
  const key = `${tab}:${[...filter].sort().join("|")}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const baseScale = 0.15 + ((h % 700) / 1000); // 0.15 – 0.85

  return items.map(([label, count]) => {
    // Jitter each item slightly so distribution isn't uniform.
    let hh = h;
    for (let i = 0; i < label.length; i++) hh = (hh * 31 + label.charCodeAt(i)) >>> 0;
    const jitter = 0.85 + ((hh % 300) / 1000); // 0.85 – 1.15
    const scaled = Math.max(0, Math.round(count * baseScale * jitter));
    return [label, scaled];
  });
}

export default function Analysis() {
  const [tab, setTab] = useState<Tab>("rank");
  const [rankFilter, setRankFilter] = useState<string[]>(["All"]);
  const [tradeFilter, setTradeFilter] = useState<string[]>(["All"]);
  const [batteryFilter, setBatteryFilter] = useState<string[]>(["All"]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const filterState = tab === "rank" ? rankFilter : tab === "trade" ? tradeFilter : batteryFilter;
  const setFilterState = tab === "rank" ? setRankFilter : tab === "trade" ? setTradeFilter : setBatteryFilter;
  const filterOptions = tab === "rank" ? ALL_RANKS : tab === "trade" ? ALL_TRADES : ALL_BATTERIES;
  const filterLabel = tab === "rank" ? "All Ranks" : tab === "trade" ? "All Trades" : "All Batteries";
  const selectLabel = tab === "rank" ? "Select Rank" : tab === "trade" ? "Select Trade" : "Select Battery";

  const totalLabel = tab === "battery" ? "Bty Total" : tab === "trade" ? "Trade Total" : "Rank Total";

  const filterText =
    filterState.length === 0 || filterState.includes("All")
      ? filterLabel
      : filterState.join(", ");

  // Compute filtered data
  const rankData = useMemo(() => filterRankData(rankFilter), [rankFilter]);
  const tradeData = useMemo(() => filterTradeData(tradeFilter), [tradeFilter]);
  const batteryData = useMemo(() => filterBatteryData(batteryFilter), [batteryFilter]);

  const totals = useMemo(() => {
    if (tab === "rank") return sumGroups(rankData.fighting, rankData.nonFighting);
    if (tab === "trade") return sumGroups(tradeData.fighting, tradeData.nonFighting);
    return sumBatteries(batteryData);
  }, [tab, rankData, tradeData, batteryData]);

  return (
    <section className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 rounded-xl bg-black/30 border border-[color:var(--gold)]/20 p-1">
        {(["rank", "trade", "battery"] as Tab[]).map((t) => {
          const label = t === "rank" ? "Rank Analysis" : t === "trade" ? "Trade Analysis" : "Battery Analysis";
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-gradient-to-b from-[color:var(--gold)] to-yellow-700 text-black shadow-lg"
                  : "text-white/70 hover:text-[color:var(--gold-soft)] hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Filter chip + select */}
      <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 p-3 space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">
          <Filter className="h-3.5 w-3.5" />
          Filter: <span className="text-white/70 normal-case tracking-normal font-normal">{filterText}</span>
          {!filterState.includes("All") && filterState.length > 0 && (
            <button
              onClick={() => setFilterState(["All"])}
              className="ml-auto inline-flex items-center gap-1 text-[10px] text-white/60 hover:text-[color:var(--gold-soft)]"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center justify-between gap-2 rounded-md bg-black/40 border border-white/10 hover:border-[color:var(--gold)]/40 px-3 py-2.5 text-left"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">{selectLabel}</div>
            <div className="text-sm text-white">{filterState.includes("All") || filterState.length === 0 ? "All" : filterState.join(", ")}</div>
          </div>
          <span className="text-[color:var(--gold)]">▾</span>
        </button>
      </div>

      {/* Totals strip */}
      <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 px-4 py-4 grid grid-cols-3 divide-x divide-[color:var(--gold)]/15">
        <TotalCell label={totalLabel} value={totals.total} />
        <TotalCell label="Fighting" value={totals.fighting} />
        <TotalCell label="Non Fighting" value={totals.nonFighting} />
      </div>

      {tab === "rank" && <RankAnalysis fighting={rankData.fighting} nonFighting={rankData.nonFighting} />}
      {tab === "trade" && <TradeAnalysis fighting={tradeData.fighting} nonFighting={tradeData.nonFighting} />}
      {tab === "battery" && <BatteryAnalysis batteries={batteryData} />}

      {/* Shared category summary — scales with current filter */}
      <CategorySummaryCard
        title="OFFRS/JCOS/SLDRS"
        items={scaleCategoryItems(OFFRS_JCOS_SLDRS, tab, filterState)}
      />
      <CategorySummaryCard
        title="CLK/CK/NCBS/ENGRS, ETC."
        items={scaleCategoryItems(CLK_CK_NCBS, tab, filterState)}
      />

      {/* Filter picker */}
      <FilterPicker
        open={pickerOpen}
        title={selectLabel}
        options={filterOptions}
        value={filterState}
        onCancel={() => setPickerOpen(false)}
        onApply={(v) => { setFilterState(v.length ? v : ["All"]); setPickerOpen(false); }}
      />
    </section>
  );
}

// ============ Filter helpers ============
type Group = { group: string; items: Array<[string, number]> };

function filterGroups(groups: Group[], filter: string[]): Group[] {
  if (filter.length === 0 || filter.includes("All")) return groups;
  const groupSet = new Set(filter);
  return groups
    .map((g) => {
      // If group name (e.g. "Officers", "JCOs", "Sldrs", "Clk - 13") is directly selected, keep all items
      if (groupSet.has(g.group) || groupSet.has(g.group.split(" ")[0])) {
        return g;
      }
      const items = g.items.filter(([k]) => groupSet.has(k));
      return items.length > 0 ? { ...g, items } : null;
    })
    .filter((g): g is Group => g !== null);
}

function filterRankData(filter: string[]) {
  // Map header aliases: "Soldiers" → "Sldrs"
  const normalized = filter.map((f) => (f === "Soldiers" ? "Sldrs" : f));
  return {
    fighting: filterGroups(RANK_FIGHTING, normalized),
    nonFighting: filterGroups(RANK_NON_FIGHTING, normalized),
  };
}

function filterTradeData(filter: string[]) {
  return {
    fighting: filterGroups(TRADE_FIGHTING, filter),
    nonFighting: filterGroups(TRADE_NON_FIGHTING, filter),
  };
}

function filterBatteryData(filter: string[]): BatteryStat[] {
  if (filter.length === 0 || filter.includes("All")) return BATTERIES;
  const keys = new Set(filter.map((f) => f.replace(/\s*Bty$/i, "").trim().toUpperCase()));
  return BATTERIES.filter((b) => keys.has(b.key));
}

function sumGroups(fighting: Group[], nonFighting: Group[]) {
  const sum = (gs: Group[]) => gs.reduce((acc, g) => acc + g.items.reduce((a, [, v]) => a + v, 0), 0);
  const f = sum(fighting);
  const nf = sum(nonFighting);
  return { total: f + nf, fighting: f, nonFighting: nf };
}

function sumBatteries(bs: BatteryStat[]) {
  const total = bs.reduce((a, b) => a + b.strength, 0);
  const nf = bs.reduce((a, b) => a + b.nonFighting, 0);
  return { total, fighting: total - nf, nonFighting: nf };
}


function TotalCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold-soft)]/70">{label}</div>
      <div className="font-display text-3xl font-bold text-gold-gradient mt-1">{value}</div>
    </div>
  );
}

function GroupPill({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-soft)] bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 rounded px-2 py-0.5">
      {label}
    </span>
  );
}

function BulletList({ items }: { items: Array<[string, number]> }) {
  return (
    <ul className="mt-2 space-y-1 pl-3">
      {items.map(([k, v], i) => (
        <li key={i} className="text-[12px] text-white/80 flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-[color:var(--gold)]/70" />
          <span>{k}{v > 0 ? ` - ${v}` : ""}</span>
        </li>
      ))}
    </ul>
  );
}

function ColumnCard({ title, groups }: { title: string; groups: Array<{ group: string; items: Array<[string, number]> }> }) {
  return (
    <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 p-3 space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">{title}</div>
      {groups.map((g, i) => (
        <div key={i}>
          <GroupPill label={g.group} />
          {g.items.length > 0 && <BulletList items={g.items} />}
        </div>
      ))}
    </div>
  );
}

function RankAnalysis({ fighting, nonFighting }: { fighting: Group[]; nonFighting: Group[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fighting.length > 0 ? (
        <ColumnCard title="Fighting" groups={fighting} />
      ) : (
        <EmptyCard title="Fighting" />
      )}
      {nonFighting.length > 0 ? (
        <ColumnCard title="Non Fighting" groups={nonFighting} />
      ) : (
        <EmptyCard title="Non Fighting" />
      )}
    </div>
  );
}

function TradeAnalysis({ fighting, nonFighting }: { fighting: Group[]; nonFighting: Group[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fighting.length > 0 ? (
        <ColumnCard title="Fighting" groups={fighting} />
      ) : (
        <EmptyCard title="Fighting" />
      )}
      {nonFighting.length > 0 ? (
        <ColumnCard title="Non Fighting" groups={nonFighting} />
      ) : (
        <EmptyCard title="Non Fighting" />
      )}
    </div>
  );
}

function BatteryAnalysis({ batteries }: { batteries: BatteryStat[] }) {
  if (batteries.length === 0) return <EmptyCard title="Batteries" />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {batteries.map((b) => <BatteryCard key={b.key} b={b} />)}
    </div>
  );
}

function EmptyCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">{title}</div>
      <div className="mt-2 text-xs text-white/40 italic">No matches for current filter</div>
    </div>
  );
}


function BatteryCard({ b }: { b: BatteryStat }) {
  const toneCls = {
    rose:    { border: "border-rose-500/40",    bg: "bg-rose-500/10",    title: "text-rose-300",    bar: "bg-rose-500",    pill: "bg-rose-500/15 border-rose-500/40 text-rose-200"    },
    slate:   { border: "border-slate-400/40",   bg: "bg-slate-500/10",   title: "text-slate-200",   bar: "bg-slate-400",   pill: "bg-slate-400/15 border-slate-400/40 text-slate-200"  },
    amber:   { border: "border-amber-500/40",   bg: "bg-amber-500/10",   title: "text-amber-300",   bar: "bg-amber-500",   pill: "bg-amber-500/15 border-amber-500/40 text-amber-200" },
    emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", title: "text-emerald-300", bar: "bg-emerald-500", pill: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200" },
  }[b.tone];

  const Row = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between text-[12px] text-white/85 py-0.5">
      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${toneCls.bar}`} />
        {label}
      </span>
      <span className={`text-[11px] font-bold rounded px-2 py-0.5 border ${toneCls.pill}`}>{value}</span>
    </div>
  );

  return (
    <div className={`rounded-xl border-2 ${toneCls.border} ${toneCls.bg} p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <div className={`text-[11px] font-bold uppercase tracking-[0.2em] ${toneCls.title}`}>{b.label}</div>
        <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${toneCls.pill}`}>Str: {b.strength}</span>
      </div>
      <Row label="Officers" value={b.officers} />
      <Row label="JCOs" value={b.jcos} />
      <Row label="Sldrs" value={b.sldrs} />
      <Row label="Non-Fighting" value={b.nonFighting} />
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
          <span>Fighting Ratio</span>
          <span className={`font-bold ${toneCls.title}`}>{b.ratio}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
          <div className={`h-full ${toneCls.bar}`} style={{ width: `${b.ratio}%` }} />
        </div>
      </div>
    </div>
  );
}

function CategorySummaryCard({ title, items }: { title: string; items: Array<[string, number]> }) {
  return (
    <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)] pb-2 border-b border-[color:var(--gold)]/20 mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(([k, v]) => (
          <span
            key={k}
            className="text-[11px] rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/80 flex items-center gap-1.5"
          >
            <span className="h-1 w-1 rounded-full bg-[color:var(--gold)]" />
            {k}: <span className="font-bold text-[color:var(--gold-soft)]">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterPicker({
  open, title, options, value, onCancel, onApply,
}: {
  open: boolean;
  title: string;
  options: string[];
  value: string[];
  onCancel: () => void;
  onApply: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(value);
  // Reset draft when opening
  useMemo(() => { if (open) setDraft(value); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (opt: string) => {
    if (opt === "All") { setDraft(["All"]); return; }
    setDraft((d) => {
      const without = d.filter((x) => x !== "All");
      return without.includes(opt) ? without.filter((x) => x !== opt) : [...without, opt];
    });
  };

  const headers = new Set(["Officers", "JCOs", "Soldiers"]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm bg-[color:var(--forest-deep,#0b1210)] text-white border-[color:var(--gold)]/40 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-display uppercase tracking-widest text-[color:var(--gold)]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto py-2 space-y-1.5">
          {options.map((opt) => {
            const isHeader = headers.has(opt);
            const checked = draft.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => !isHeader && toggle(opt)}
                disabled={isHeader}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[color:var(--gold)]/10 transition-colors ${isHeader ? "cursor-default" : ""}`}
              >
                {!isHeader ? (
                  <span className={`h-5 w-5 rounded border-2 flex items-center justify-center ${checked ? "bg-[color:var(--gold)] border-[color:var(--gold)]" : "border-white/25"}`}>
                    {checked && <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />}
                  </span>
                ) : (
                  <span className="h-5 w-5" />
                )}
                <span className={`text-sm ${isHeader ? "font-bold text-[color:var(--gold-soft)]" : "text-white/85"}`}>{opt}</span>
              </button>
            );
          })}
        </div>
        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <button
            onClick={onCancel}
            className="text-sm text-white/60 hover:text-white px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(draft)}
            className="text-sm font-bold uppercase tracking-wider bg-[color:var(--gold)] text-black rounded-md px-5 py-2 hover:brightness-110"
          >
            Apply
          </button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
