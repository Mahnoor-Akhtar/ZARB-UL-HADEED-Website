import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, BarChart3, Users, SlidersHorizontal, Boxes, ShieldCheck,
  Layers, Settings, Bell, Search, LogOut, ChevronRight, ChevronDown,
  Trash2, Pencil, Plus, X, ArrowLeft, User as UserIcon, Download,
} from "lucide-react";
import { ThemeToggle } from "@/lib/theme";
import { defaultAvatarSrc, logoSrc } from "@/lib/app-assets";
import NominalRoll, { ProfileModal } from "@/components/NominalRoll";
import { useProfileViewOpen } from "@/lib/profile-view";
import { useIsReadOnly, useSession } from "@/lib/auth";
import Analysis from "@/components/Analysis";
import AttendanceFilter from "@/components/AttendanceFilter";
import AppAttributes from "@/components/AppAttributes";
import CommandGroup from "@/components/CommandGroup";
import GroupManagement from "@/components/GroupManagement";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import personnelData from "@/data/personnel.json";

type Person = {
  id: number; section: string; armyNo: string; rank: string;
  trade: string; name: string; cl: string; bty: string; remarks: string | null;
  fighting?: string; category?: string; phone?: string; city?: string; photo?: string | null;
};
const PERSONNEL = personnelData as Person[];

// Deterministic pick: seeded shuffle by key, take first N
function pickPersons(key: string, count: number): Person[] {
  if (count <= 0) return [];
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const arr = [...PERSONNEL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Zarb Ul Hadeed" },
      { name: "description", content: "Personnel management command console." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const modules = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "analysis", label: "Analysis", icon: BarChart3 },
  { key: "nominal", label: "Nominal Groups", icon: Users },
  { key: "filters", label: "Filters", icon: SlidersHorizontal },
  { key: "attributes", label: "App Attributes", icon: Boxes },
  { key: "command", label: "Command Groups", icon: ShieldCheck },
  { key: "group-mgmt", label: "Group Management", icon: Layers },
  { key: "settings", label: "Settings", icon: Settings },
];

type SubGroup = { label?: string; items: { name: string; count: number }[] };
type Category = { key: string; title: string; total: number; groups: SubGroup[] };

const categories: Category[] = [
  { key: "present", title: "Present", total: 46, groups: [{ items: [
    { name: "Duty", count: 15 }, { name: "Office", count: 18 }, { name: "Standby", count: 13 },
  ]}]},
  { key: "leave", title: "Leave", total: 41, groups: [{ items: [
    { name: "P/Lve", count: 11 }, { name: "Weekend", count: 10 },
    { name: "C/Lve", count: 12 }, { name: "Sick Lve", count: 8 },
  ]}]},
  { key: "aval", title: "Aval", total: 69, groups: [{ items: [
    { name: "Leave Reserve", count: 26 }, { name: "Other", count: 28 }, { name: "General Aval", count: 15 },
  ]}]},
  { key: "att", title: "Att", total: 27, groups: [
    { label: "Perm Comd - 11", items: [
      { name: "Arms Br", count: 2 }, { name: "Army Camp", count: 3 }, { name: "PMA", count: 1 },
      { name: "3 Trg/ASL Muree", count: 0 }, { name: "UN Msn", count: 1 },
      { name: "COAS Dte", count: 1 }, { name: "52 RSTE", count: 3 },
    ]},
    { label: "Temp - 16", items: [
      { name: "9 Div", count: 0 }, { name: "30 CAB", count: 4 }, { name: "30 Corps", count: 0 },
      { name: "Arty Cen", count: 4 }, { name: "325 CIB", count: 0 }, { name: "Arms Br", count: 8 },
    ]},
  ]},
  { key: "courses", title: "Courses", total: 30, groups: [{ items: [
    { name: "JSC/MCC/OGS", count: 4 }, { name: "SNBIC", count: 3 },
    { name: "PRT Course", count: 3 }, { name: "SCC Screening", count: 10 },
    { name: "ARI(TA)", count: 3 }, { name: "JNAC", count: 3 }, { name: "ARI(G)", count: 4 },
  ]}]},
  { key: "osl", title: "OSL/Pris", total: 25, groups: [{ items: [
    { name: "OSL", count: 11 }, { name: "Detained", count: 9 }, { name: "Regt Prisoner", count: 5 },
  ]}]},
  { key: "stagds", title: "Sta Gds", total: 16, groups: [{ items: [
    { name: "ISI Sub Sec Gd", count: 3 }, { name: "PRO Sec", count: 1 },
    { name: "COM Gd", count: 6 }, { name: "GMP", count: 2 },
    { name: "FG Deg Gd", count: 1 }, { name: "Ammo Gd", count: 3 },
  ]}]},
  { key: "unitgds", title: "Unit Gds", total: 29, groups: [{ items: [
    { name: "MT", count: 3 }, { name: "Stores", count: 4 }, { name: "158 Line", count: 2 },
    { name: "Office", count: 3 }, { name: "POL", count: 3 }, { name: "Guns", count: 3 },
    { name: "148 SP", count: 5 }, { name: "Prisoner", count: 6 },
  ]}]},
  { key: "cmh", title: "CMH/Sick", total: 3, groups: [{ items: [
    { name: "CMH Gwa", count: 1 }, { name: "CMH Kht", count: 1 }, { name: "SIQ", count: 1 },
  ]}]},
  { key: "regtemp", title: "Regt Emp", total: 12, groups: [{ items: [
    { name: "RP", count: 2 }, { name: "Orderly/Daily N", count: 0 },
    { name: "Ck House", count: 2 }, { name: "Complain NCO", count: 3 },
    { name: "Adm/Emg/CO", count: 1 }, { name: "Tea Bar NCO", count: 0 },
    { name: "DR", count: 1 }, { name: "Store Man", count: 1 }, { name: "Rnrs", count: 2 },
  ]}]},
  { key: "trg", title: "Trg", total: 19, groups: [{ items: [
    { name: "Observer", count: 8 }, { name: "Guns", count: 11 },
  ]}]},
  { key: "sports", title: "Sports", total: 14, groups: [{ items: [
    { name: "Rugby", count: 6 }, { name: "Volleyball", count: 8 },
  ]}]},
  { key: "aslt", title: "Aslt Course", total: 1, groups: [{ items: [
    { name: "Obstacle Trg", count: 1 }, { name: "General Aslt", count: 0 }, { name: "Physical Test", count: 0 },
  ]}]},
  { key: "dido", title: "DIDO", total: 13, groups: [{ items: [
    { name: "Waiters", count: 6 }, { name: "Managers", count: 7 },
  ]}]},
  { key: "working", title: "Working", total: 19, groups: [{ items: [
    { name: "Area Maint", count: 10 }, { name: "Weapon Maint", count: 9 },
  ]}]},
  { key: "prot", title: "Prot", total: 12, groups: [{ items: [
    { name: "Chinese Team", count: 7 }, { name: "Players Pot", count: 5 },
  ]}]},
  { key: "excl", title: "Ex/Cl", total: 28, groups: [{ items: [
    { name: "Extra Class", count: 10 }, { name: "Other", count: 6 }, { name: "Remedial Class", count: 12 },
  ]}]},
  { key: "ud", title: "U/D", total: 23, groups: [{ items: [
    { name: "Under Displ", count: 6 }, { name: "Other", count: 10 }, { name: "Inquiry", count: 7 },
  ]}]},
];

const TOTAL = 427;
const FIGHTING = 377;
const NON_FIGHTING = 50;

function DashboardPage() {
  const readOnly = useIsReadOnly();
  const [active, setActive] = useState("dashboard");
  const profileOpen = useProfileViewOpen();
  const [cats, setCats] = useState<Category[]>(categories);
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.key, false]))
  );
  const [fabOpen, setFabOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [listView, setListView] = useState<{ title: string; persons: Person[] } | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchViewing, setSearchViewing] = useState<Person | null>(null);
  const navigate = useNavigate();

  const searchResults = (() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return [] as Person[];
    return (personnelData as Person[]).filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.armyNo?.toLowerCase().includes(q) ||
        p.rank?.toLowerCase().includes(q) ||
        p.trade?.toLowerCase().includes(q) ||
        p.bty?.toLowerCase().includes(q) ||
        p.section?.toLowerCase().includes(q) ||
        p.cl?.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.remarks ?? "").toLowerCase().includes(q) ||
        (p.fighting ?? "").toLowerCase().includes(q)
      );
    }).slice(0, 40);
  })();

  const openCategoryList = (c: Category) => {
    setListView({ title: `${c.title} — ${c.total}`, persons: pickPersons(`cat:${c.key}`, c.total) });
  };
  const openItemList = (c: Category, gi: number, ii: number) => {
    const it = c.groups[gi]?.items[ii];
    if (!it) return;
    setListView({
      title: `${c.title} · ${it.name} — ${it.count}`,
      persons: pickPersons(`item:${c.key}:${gi}:${it.name}`, it.count),
    });
  };


  const askConfirm = (opts: Omit<typeof confirmState, "open">) =>
    setConfirmState({ ...opts, open: true });

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const deleteCategory = (key: string) => {
    const cat = cats.find((c) => c.key === key);
    askConfirm({
      title: "Delete category?",
      description: `“${cat?.title ?? key}” aur uske andar ki sab subcategories permanently hat jayengi.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => {
        const snapshot = cats;
        setCats((cs) => cs.filter((c) => c.key !== key));
        setDeleteMode(false);
        toast.success("Category deleted", {
          description: cat?.title,
          action: {
            label: "Undo",
            onClick: () => {
              setCats(snapshot);
              toast.success("Restored", { description: cat?.title });
            },
          },
        });
      },
    });
  };
  const deleteItem = (catKey: string, groupIdx: number, itemIdx: number) => {
    const item = cats.find((c) => c.key === catKey)?.groups[groupIdx]?.items[itemIdx];
    askConfirm({
      title: "Delete item?",
      description: `“${item?.name ?? "Item"}” ko hata diya jayega.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => {
        const snapshot = cats;
        setCats((cs) =>
          cs.map((c) => {
            if (c.key !== catKey) return c;
            const groups = c.groups.map((g, gi) =>
              gi !== groupIdx ? g : { ...g, items: g.items.filter((_, i) => i !== itemIdx) }
            );
            return { ...c, groups };
          })
        );
        setDeleteMode(false);
        toast.success("Item deleted", {
          description: item?.name,
          action: {
            label: "Undo",
            onClick: () => {
              setCats(snapshot);
              toast.success("Restored", { description: item?.name });
            },
          },
        });
      },
    });
  };
  const renameCategory = (key: string, title: string) => {
    setCats((cs) => cs.map((c) => (c.key === key ? { ...c, title } : c)));
  };
  const renameItem = (catKey: string, groupIdx: number, itemIdx: number, name: string) => {
    setCats((cs) =>
      cs.map((c) => {
        if (c.key !== catKey) return c;
        const groups = c.groups.map((g, gi) =>
          gi !== groupIdx
            ? g
            : { ...g, items: g.items.map((it, i) => (i === itemIdx ? { ...it, name } : it)) }
        );
        return { ...c, groups };
      })
    );
  };
  const addMainCategory = (title: string) => {
    const key = `cat-${Date.now()}`;
    setCats((cs) => [...cs, { key, title, total: 0, groups: [{ items: [] }] }]);
    setOpen((o) => ({ ...o, [key]: false }));
  };
  const addSubGroup = (catKey: string, label: string) => {
    setCats((cs) =>
      cs.map((c) => (c.key !== catKey ? c : { ...c, groups: [...c.groups, { label, items: [] }] }))
    );
  };
  const addSubItem = (catKey: string, groupIdx: number, name: string) => {
    setCats((cs) =>
      cs.map((c) => {
        if (c.key !== catKey) return c;
        const groups = c.groups.map((g, gi) =>
          gi !== groupIdx ? g : { ...g, items: [...g.items, { name, count: 0 }] }
        );
        return { ...c, groups };
      })
    );
  };

  const requestCloseWithGuard = (dirty: boolean, close: () => void) => {
    if (!dirty) { close(); return; }
    askConfirm({
      title: "Unsaved changes",
      description: "Aapke changes save nahi hue. Kya aap band karna chahte hain?",
      confirmLabel: "Discard",
      destructive: true,
      onConfirm: close,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[color:var(--forest-deep)] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[color:var(--gold)]/15 bg-black/30 sticky top-0 h-screen self-start">
        <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-[color:var(--gold)]/15">
          <img src={logoSrc} alt="Zarb" className="h-10 w-10 rounded-full ring-1 ring-[color:var(--gold)]/50" />
          <div className="leading-tight">
            <div className="font-display text-gold-gradient text-sm font-bold tracking-wide">ZARB-UL-HADEED</div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-[color:var(--gold-soft)]/60">117 SP Regt.</div>
          </div>
        </Link>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {modules.filter((m) => !readOnly || (m.key !== "command" && m.key !== "group-mgmt" && m.key !== "attributes")).map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors ${
                  isActive
                    ? "bg-[color:var(--gold)]/10 text-[color:var(--gold-soft)] border-l-2 border-[color:var(--gold)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 uppercase tracking-wider text-[11px] font-semibold">{m.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[color:var(--gold)]/15">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold-soft)]/50">Powered by Defense Suite</div>
          <div className="text-[10px] text-white/30 mt-0.5">v2.4.1.0</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 sm:px-10 lg:px-16 xl:px-24 py-4 border-b border-[color:var(--gold)]/15 bg-black/20 sticky top-0 z-10 backdrop-blur">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-gold-gradient uppercase tracking-wide">
                Zarb-Ul-Hadeed
              </h1>
              <span className="text-[color:var(--gold)]">★</span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">117 SP Regt. · Strength State</p>
          </div>

          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              placeholder="Search Personnel..."
              className="w-72 pl-9 pr-8 py-2 rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm placeholder:text-white/30"
            />
            {searchQ && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setSearchQ(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {searchFocus && searchQ.trim() && (
              <div className="absolute left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-md border border-[color:var(--gold)]/30 bg-black/95 backdrop-blur shadow-2xl z-50">
                {searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-white/50 text-center">No personnel found</div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">
                      {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
                    </div>
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchViewing(p);
                          setSearchFocus(false);
                          setSearchQ("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[color:var(--gold)]/10 border-b border-white/5 last:border-b-0 flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={p.photo || defaultAvatarSrc} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white truncate">
                            <span className="text-[color:var(--gold-soft)]">{p.rank}</span> {p.name}
                          </div>
                          <div className="text-[10px] text-white/50 truncate">
                            {p.armyNo} · {p.trade} · Bty {p.bty}{p.remarks ? ` · ${p.remarks}` : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>


          <ThemeToggle />

          <button className="relative p-2 rounded-md hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-5 w-5 text-white/70" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[color:var(--neon)]" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <img src={logoSrc} alt="Regt crest" className="h-9 w-9 rounded-full ring-1 ring-[color:var(--gold)]/50" />
            <button
              onClick={() => navigate({ to: "/login" })}
              className="p-2 rounded-md hover:bg-white/5 text-white/60 hover:text-[color:var(--gold-soft)]"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 sm:p-10 lg:p-16 xl:p-24 space-y-5 overflow-x-hidden">
          {/* Summary strip */}
          {!profileOpen && active === "dashboard" && !listView && (
            <section className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 px-6 py-5">
              <div className="grid grid-cols-3 divide-x divide-[color:var(--gold)]/15">
                <SummaryStat value={TOTAL} label="Total" tone="gold" />
                <SummaryStat value={FIGHTING} label="Fighting" tone="neon" />
                <SummaryStat value={NON_FIGHTING} label="Non Fighting" tone="neon" />
              </div>
            </section>
          )}


          {active === "nominal" ? (
            <NominalRoll />
          ) : active === "analysis" ? (
            <Analysis />
          ) : active === "filters" ? (
            <AttendanceFilter />
          ) : active === "attributes" ? (
            <AppAttributes />
          ) : active === "command" ? (
            <CommandGroupsView />

          ) : active === "group-mgmt" ? (
            <GroupManagement />

          ) : active === "settings" ? (
            <SettingsView />


          ) : listView ? (
            <PersonnelListView
              title={listView.title}
              persons={listView.persons}
              onBack={() => setListView(null)}
            />
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start auto-rows-min">
              {cats.map((c) => (
                <CategoryCard
                  key={c.key}
                  category={c}
                  open={open[c.key]}
                  onToggle={() => toggle(c.key)}
                  deleteMode={deleteMode}
                  onDeleteCategory={() => deleteCategory(c.key)}
                  onDeleteItem={(gi, ii) => deleteItem(c.key, gi, ii)}
                  onOpenCategory={() => openCategoryList(c)}
                  onOpenItem={(gi, ii) => openItemList(c, gi, ii)}
                />
              ))}
            </section>
          )}
        </main>

        {/* Dashboard-level FAB + modals — hidden on Nominal Groups tab (NominalRoll owns its own FAB) */}
        {!readOnly && !profileOpen && active !== "nominal" && active !== "analysis" && active !== "filters" && active !== "attributes" && active !== "group-mgmt" && active !== "settings" && active !== "command" && (
          <>
            <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
              {fabOpen && (
                <>
                  <button
                    onClick={() => setDeleteMode((v) => !v)}
                    className={`h-11 w-11 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-fade-in ${
                      deleteMode ? "bg-rose-500 text-white ring-2 ring-rose-300" : "bg-[color:var(--gold)] text-black"
                    }`}
                    aria-label="Delete"
                    aria-pressed={deleteMode}
                    title={deleteMode ? "Exit delete mode" : "Delete"}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditOpen((v) => !v)}
                    className={`h-11 w-11 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-fade-in ${
                      editOpen ? "bg-[color:var(--forest)] text-[color:var(--gold-soft)] ring-2 ring-[color:var(--gold)]" : "bg-[color:var(--gold)] text-black"
                    }`}
                    aria-label="Edit"
                    aria-pressed={editOpen}
                    title={editOpen ? "Close edit" : "Edit"}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setAddOpen((v) => !v)}
                    className={`h-11 w-11 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-fade-in ${
                      addOpen ? "bg-[color:var(--forest)] text-[color:var(--gold-soft)] ring-2 ring-[color:var(--gold)]" : "bg-[color:var(--gold)] text-black"
                    }`}
                    aria-label="Add"
                    aria-pressed={addOpen}
                    title={addOpen ? "Close add" : "Add"}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setFabOpen((v) => !v)}
                className="h-12 w-12 rounded-full bg-[color:var(--gold)] text-black shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
                aria-label="Actions"
              >
                {fabOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
            </div>

            {deleteMode && (
              <div className="fixed bottom-6 left-6 z-30 flex items-center gap-3 rounded-full bg-black/80 border border-rose-500/40 px-4 py-2 shadow-lg animate-fade-in">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400">Delete Mode</span>
                <button
                  onClick={() => setDeleteMode(false)}
                  className="text-[11px] uppercase tracking-wider text-white/70 hover:text-white"
                >
                  Close
                </button>
              </div>
            )}

            {editOpen && (
              <EditCategoriesModal
                cats={cats}
                onClose={() => setEditOpen(false)}
                onRequestClose={requestCloseWithGuard}
                onRenameCategory={renameCategory}
                onRenameItem={renameItem}
              />
            )}
            {addOpen && (
              <AddCategoryModal
                cats={cats}
                onClose={() => setAddOpen(false)}
                onRequestClose={requestCloseWithGuard}
                onAddMain={addMainCategory}
                onAddSub={addSubGroup}
                onAddDetail={addSubItem}
              />
            )}
          </>
        )}

        <AlertDialog
          open={confirmState.open}
          onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        >
          <AlertDialogContent className="bg-[color:var(--forest-deep)] border-[color:var(--gold)]/30 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-gold-gradient uppercase tracking-wide">
                {confirmState.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                {confirmState.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/15 text-white/80 hover:bg-white/5 hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmState.onConfirm()}
                className={
                  confirmState.destructive
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-[color:var(--gold)] text-black hover:brightness-110"
                }
              >
                {confirmState.confirmLabel ?? "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {searchViewing && (
        <ProfileModal
          person={searchViewing as any}
          onClose={() => setSearchViewing(null)}
          onEdit={() => setSearchViewing(null)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

function PlaceholderView({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="animate-fade-in rounded-2xl border border-[color:var(--gold)]/25 bg-black/30 px-6 py-16 text-center">
      <div className="inline-grid place-items-center h-14 w-14 rounded-full bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 text-[color:var(--gold-soft)] mb-4">
        <Layers className="h-6 w-6" />
      </div>
      <h2 className="font-display text-xl font-bold text-gold-gradient uppercase tracking-wide">{title}</h2>
      <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">{subtitle}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">Coming soon</p>
    </section>
  );
}

const DEFAULT_USER = {
  id: -1,
  section: "Officers",
  armyNo: "PA-43337",
  rank: "Lt Col",
  trade: "Arty",
  name: "Muhammad Tayyab Ghaznavi",
  cl: "Class-I",
  bty: "HQ",
  remarks: "Duty",
  fighting: "Fighting" as const,
  role: "SUPER ADMIN",
  phone: "+92 300 1234567",
  city: "Rawalpindi",
};

function SettingsView() {
  const navigate = useNavigate();
  const session = useSession();
  const CURRENT_USER = session
    ? { ...DEFAULT_USER, armyNo: session.armyNo, rank: session.rank, name: session.name, role: session.role }
    : DEFAULT_USER;
  const [showProfile, setShowProfile] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const downloadHistory = async () => {
    try {
      const { downloadHistoryReport } = await import("@/lib/history-report");
      downloadHistoryReport({
        rank: CURRENT_USER.rank,
        name: CURRENT_USER.name,
        armyNo: CURRENT_USER.armyNo,
      });
    } catch (e) {
      console.error("Failed to generate history report", e);
    }
  };


  if (showProfile) {
    return (
      <ProfileModal
        person={CURRENT_USER as any}
        onClose={() => setShowProfile(false)}
        onEdit={() => setShowProfile(false)}
        readOnly
      />
    );
  }

  return (
    <section className="animate-fade-in space-y-4">
      <div className="rounded-2xl border border-[color:var(--gold)]/25 bg-black/30 px-6 py-5 flex items-center gap-3">
        <Settings className="h-5 w-5 text-[color:var(--gold)]" />
        <h2 className="font-display text-lg font-bold text-gold-gradient uppercase tracking-widest">
          Settings Centre
        </h2>
      </div>

      {/* Current user profile */}
      <button
        onClick={() => setShowProfile(true)}
        className="w-full text-left rounded-xl border border-[color:var(--gold)]/25 bg-black/30 hover:bg-black/40 transition-colors px-5 py-4 flex items-center gap-4"
      >
        <img
          src={logoSrc}
          alt="Crest"
          className="h-14 w-14 rounded-full ring-1 ring-[color:var(--gold)]/50 object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">
            {CURRENT_USER.rank} {CURRENT_USER.name}
          </div>
          <div className="text-xs text-white/60 truncate">
            Army No: {CURRENT_USER.armyNo} · {CURRENT_USER.section}
          </div>
          <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-widest bg-[color:var(--gold)]/15 text-[color:var(--gold)] border border-[color:var(--gold)]/30 rounded-md px-2 py-0.5">
            {CURRENT_USER.role}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-[color:var(--gold)]/60 shrink-0" />
      </button>

      {/* Download History */}
      <button
        onClick={downloadHistory}
        className="w-full text-left rounded-xl border border-[color:var(--gold)]/25 bg-black/30 hover:bg-black/40 transition-colors px-5 py-4 flex items-center gap-4"
      >
        <div className="grid place-items-center h-11 w-11 rounded-full bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 text-[color:var(--gold)]">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">Download History</div>
          <div className="text-xs text-white/60">
            Download PDF report with all personnel history
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[color:var(--gold)]/60 shrink-0" />
      </button>

      {/* Logout Session */}
      <button
        onClick={() => setConfirmLogout(true)}
        className="w-full text-left rounded-xl border border-rose-500/30 bg-rose-500/[0.06] hover:bg-rose-500/[0.1] transition-colors px-5 py-4 flex items-center gap-4"
      >
        <div className="grid place-items-center h-11 w-11 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <LogOut className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-rose-300">Logout Session</div>
          <div className="text-xs text-rose-300/70">
            Securely exit your console session
          </div>
        </div>
      </button>

      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setConfirmLogout(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[color:var(--forest-deep)] border border-rose-500/40 shadow-2xl p-5 animate-scale-in">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-rose-300">
              Logout Session
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Are you sure you want to exit your console session?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate({ to: "/login" })}
                className="text-xs font-bold uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 rounded-md px-3 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CommandGroupsView() {
  return <CommandGroup onClose={() => { /* no-op: view is always shown within the tab */ }} />;
}


function SummaryStat({ value, label, tone }: { value: number; label: string; tone: "gold" | "neon" }) {
  const color = tone === "gold" ? "text-gold-gradient" : "text-[color:var(--neon)]";
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <div className={`font-display text-4xl sm:text-5xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/60">{label}</div>
    </div>
  );
}

function CategoryCard({
  category, open, onToggle, deleteMode, onDeleteCategory, onDeleteItem, onOpenCategory, onOpenItem,
}: {
  category: Category;
  open: boolean;
  onToggle: () => void;
  deleteMode: boolean;
  onDeleteCategory: () => void;
  onDeleteItem: (groupIdx: number, itemIdx: number) => void;
  onOpenCategory: () => void;
  onOpenItem: (groupIdx: number, itemIdx: number) => void;
}) {
  return (
    <div className="rounded-xl border-l-2 border-[color:var(--gold)] border-y border-r border-[color:var(--gold)]/15 bg-black/30 overflow-hidden">
      <div className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors">
        <button
          onClick={deleteMode ? onToggle : onOpenCategory}
          className="flex-1 text-left"
          title={deleteMode ? "Toggle" : "View personnel list"}
        >
          <span className="inline-flex items-center gap-2 rounded-md bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 px-3 py-1 hover:bg-[color:var(--gold)]/20 transition-colors">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-soft)]">
              {category.title} — {category.total}
            </span>
          </span>
        </button>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-white/5"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={`h-4 w-4 text-[color:var(--gold-soft)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {deleteMode && (
          <button
            onClick={onDeleteCategory}
            className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 animate-fade-in"
            aria-label={`Delete ${category.title}`}
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>


      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 space-y-3">
            {category.groups.map((g, gi) => {
              const groupTotal = g.items.reduce((a, b) => a + b.count, 0);
              const ItemsList = (
                <ul className="grid grid-cols-2 gap-2">
                  {g.items.map((it, i) => (
                    <li
                      key={i}
                      onClick={() => { if (!deleteMode) onOpenItem(gi, i); }}
                      className={`flex items-center justify-between gap-2 rounded-md bg-white/[0.03] hover:bg-[color:var(--gold)]/10 border border-white/10 hover:border-[color:var(--gold)]/40 px-3 py-2 transition-colors ${deleteMode ? "" : "cursor-pointer"}`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <ChevronRight className="h-3 w-3 text-[color:var(--gold)] shrink-0" />
                        <span className="text-[12px] text-white/90 truncate">{it.name}</span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-semibold text-white/80 bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/20 rounded px-1.5 py-0.5">
                          {it.count}
                        </span>
                        {deleteMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteItem(gi, i); }}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10 animate-fade-in"
                            aria-label={`Delete ${it.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </li>
                  ))}

                </ul>
              );
              if (!g.label) return <div key={gi}>{ItemsList}</div>;
              return (
                <div
                  key={gi}
                  className="rounded-lg border border-[color:var(--gold)]/20 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 rounded-md bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 px-2.5 py-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-soft)]">
                        {g.label} — {groupTotal}
                      </span>
                    </span>
                  </div>
                  {ItemsList}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in max-h-[85vh] flex flex-col">
        {children}
      </div>
    </div>
  );
}

function EditCategoriesModal({
  cats, onClose, onRequestClose, onRenameCategory, onRenameItem,
}: {
  cats: Category[];
  onClose: () => void;
  onRequestClose: (dirty: boolean, close: () => void) => void;
  onRenameCategory: (key: string, title: string) => void;
  onRenameItem: (catKey: string, gi: number, ii: number, name: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  

  const startEdit = (id: string, current: string) => { setEditing(id); setDraft(current); };
  const commit = (fn: () => void, label: string, prev: string) => {
    const next = draft.trim();
    let didUpdate = false;
    if (!next) {
      toast.error("Name can't be empty");
    } else if (next === prev) {
      // no-op, same value
    } else {
      fn();
      toast.success(`${label} updated`, { description: `${prev} → ${next}` });
      didUpdate = true;
    }
    setEditing(null);
    setDraft("");
    if (didUpdate) onClose();
  };
  const tryClose = () => onRequestClose(editing !== null, onClose);

  return (
    <ModalShell onClose={tryClose}>
      <div className="px-5 pt-5 pb-3 border-b border-[color:var(--gold)]/20 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-gold-gradient uppercase tracking-wide">Edit Category Names</h2>
        <button
          onClick={tryClose}
          aria-label="Close"
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {cats.map((c) => {
          const catId = `c:${c.key}`;
          const isExp = expanded[c.key];
          return (
            <div key={c.key} className="rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center gap-2 px-3 py-2.5">
                {editing === catId ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commit(() => onRenameCategory(c.key, draft.trim()), "Category", c.title)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commit(() => onRenameCategory(c.key, draft.trim()), "Category", c.title);
                      if (e.key === "Escape") { setEditing(null); setDraft(""); }
                    }}
                    className="flex-1 bg-black/40 border border-[color:var(--gold)]/40 rounded px-2 py-1 text-sm text-white outline-none"
                  />
                ) : (
                  <span className="flex-1 text-sm font-semibold text-white">{c.title}</span>
                )}
                <button
                  onClick={() => startEdit(catId, c.title)}
                  className="p-1.5 rounded hover:bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                  aria-label="Rename category"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setExpanded((s) => ({ ...s, [c.key]: !s[c.key] }))}
                  className="p-1.5 rounded hover:bg-white/5 text-white/60"
                  aria-label="Toggle"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExp ? "rotate-180" : ""}`} />
                </button>
              </div>
              {isExp && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/5">
                  {c.groups.map((g, gi) =>
                    g.items.map((it, ii) => {
                      const id = `${c.key}:${gi}:${ii}`;
                      return (
                        <div key={id} className="flex items-center gap-2 pl-4">
                          <ChevronRight className="h-3 w-3 text-[color:var(--gold)]/60 shrink-0" />
                          {editing === id ? (
                            <input
                              autoFocus
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={() => commit(() => onRenameItem(c.key, gi, ii, draft.trim()), "Item", it.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commit(() => onRenameItem(c.key, gi, ii, draft.trim()), "Item", it.name);
                                if (e.key === "Escape") { setEditing(null); setDraft(""); }
                              }}
                              className="flex-1 bg-black/40 border border-[color:var(--gold)]/40 rounded px-2 py-1 text-xs text-white outline-none"
                            />
                          ) : (
                            <span className="flex-1 text-xs text-white/80">{it.name}</span>
                          )}
                          <button
                            onClick={() => startEdit(id, it.name)}
                            className="p-1 rounded hover:bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                            aria-label="Rename item"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                  {c.groups.every((g) => g.items.length === 0) && (
                    <div className="pl-4 text-xs text-white/40 italic">No subcategories.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-[color:var(--gold)]/20 flex justify-end">
        <button
          onClick={onClose}
          className="text-[11px] font-bold uppercase tracking-[0.2em] bg-[color:var(--gold)] text-black rounded-md px-5 py-2 hover:brightness-110"
        >
          OK
        </button>
      </div>
    </ModalShell>
  );
}

type AddType = "main" | "sub" | "detail";

function AddCategoryModal({
  cats, onClose, onRequestClose, onAddMain, onAddSub, onAddDetail,
}: {
  cats: Category[];
  onClose: () => void;
  onRequestClose: (dirty: boolean, close: () => void) => void;
  onAddMain: (title: string) => void;
  onAddSub: (catKey: string, label: string) => void;
  onAddDetail: (catKey: string, gi: number, name: string) => void;
}) {
  const [type, setType] = useState<AddType>("main");
  const [catKey, setCatKey] = useState("");
  const [groupIdx, setGroupIdx] = useState<string>("");
  const [name, setName] = useState("");

  const selectedCat = cats.find((c) => c.key === catKey);
  const dirty = name.trim().length > 0 || catKey !== "" || groupIdx !== "";

  const canSubmit =
    name.trim().length > 0 &&
    (type === "main" ||
      (type === "sub" && catKey) ||
      (type === "detail" && catKey && groupIdx !== ""));

  const tryClose = () => onRequestClose(dirty, onClose);

  const submit = () => {
    const n = name.trim();
    if (!n) { toast.error("Name is required"); return; }
    if (type === "sub" && !catKey) { toast.error("Select a main category"); return; }
    if (type === "detail" && (!catKey || groupIdx === "")) {
      toast.error("Select category and subcategory"); return;
    }
    if (type === "main") {
      onAddMain(n);
      toast.success("Category added", { description: n });
    } else if (type === "sub" && catKey) {
      onAddSub(catKey, n);
      toast.success("Subcategory added", { description: n });
    } else if (type === "detail" && catKey && groupIdx !== "") {
      onAddDetail(catKey, Number(groupIdx), n);
      toast.success("Item added", { description: n });
    }
    onClose();
  };

  const triggerCls = "w-full bg-black/40 border-[color:var(--gold)]/25 text-white hover:border-[color:var(--gold)]/60 focus:ring-[color:var(--gold)]/50 h-10 rounded-md";
  const contentCls = "bg-[color:var(--forest-deep)] border-[color:var(--gold)]/30 text-white";
  const itemCls = "text-white focus:bg-[color:var(--gold)]/15 focus:text-[color:var(--gold-soft)] data-[state=checked]:text-[color:var(--gold-soft)]";
  const inputCls = "w-full bg-black/40 border border-[color:var(--gold)]/25 hover:border-[color:var(--gold)]/60 focus:border-[color:var(--gold)] rounded-md px-3 py-2 text-sm text-white outline-none transition-colors";
  const labelCls = "block text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)] mb-1.5";

  return (
    <ModalShell onClose={tryClose}>
      <div className="px-5 pt-5 pb-3 border-b border-[color:var(--gold)]/20 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-gold-gradient uppercase tracking-wide">Add New Category</h2>
        <button
          onClick={tryClose}
          aria-label="Close"
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <label className={labelCls}>Addition Type</label>
          <Select
            value={type}
            onValueChange={(v) => { setType(v as AddType); setCatKey(""); setGroupIdx(""); }}
          >
            <SelectTrigger className={triggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={contentCls}>
              <SelectItem value="main" className={itemCls}>Add Main Category</SelectItem>
              <SelectItem value="sub" className={itemCls}>Add Subcategory</SelectItem>
              <SelectItem value="detail" className={itemCls}>Add Sub-subcategory Detail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(type === "sub" || type === "detail") && (
          <div>
            <label className={labelCls}>Select Main Category</label>
            <Select
              value={catKey}
              onValueChange={(v) => { setCatKey(v); setGroupIdx(""); }}
            >
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent className={contentCls}>
                {cats.map((c) => (
                  <SelectItem key={c.key} value={c.key} className={itemCls}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {type === "detail" && (
          <div>
            <label className={labelCls}>Select Subcategory</label>
            <Select
              value={groupIdx}
              onValueChange={(v) => setGroupIdx(v)}
              disabled={!selectedCat}
            >
              <SelectTrigger className={`${triggerCls} disabled:opacity-50`}>
                <SelectValue placeholder="Choose subcategory" />
              </SelectTrigger>
              <SelectContent className={contentCls}>
                {selectedCat?.groups.map((g, gi) => (
                  <SelectItem key={gi} value={String(gi)} className={itemCls}>
                    {g.label || `Group ${gi + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className={labelCls}>
            {type === "main" ? "Main Category Name" : type === "sub" ? "Subcategory Name" : "Sub-subcategory Name"}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className={inputCls}
          />
        </div>
      </div>
      <div className="px-5 py-3 border-t border-[color:var(--gold)]/20 flex items-center justify-end gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="text-[11px] font-bold uppercase tracking-[0.2em] bg-[color:var(--gold)] text-black rounded-md px-5 py-2 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          OK
        </button>
      </div>
    </ModalShell>
  );
}

const remarksTone = (r: string | null | undefined) => {
  if (!r) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  const s = r.toLowerCase();
  if (s.includes("leave") || s.includes("lve")) return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  if (s.includes("att") || s.includes("dido")) return "bg-sky-500/10 text-sky-300 border-sky-500/30";
  if (s.includes("course") || s.includes("trg")) return "bg-violet-500/10 text-violet-300 border-violet-500/30";
  if (s.includes("u/d") || s.includes("osl")) return "bg-rose-500/10 text-rose-300 border-rose-500/30";
  return "bg-[color:var(--gold)]/10 text-[color:var(--gold-soft)] border-[color:var(--gold)]/30";
};

const batteryTone = (b: string) => {
  const k = (b || "").trim().toUpperCase();
  if (k === "P")  return "bg-slate-300/15 text-slate-200 border-slate-300/40";
  if (k === "Q")  return "bg-orange-300/15 text-orange-200 border-orange-300/40";
  if (k === "R")  return "bg-emerald-300/15 text-emerald-200 border-emerald-300/40";
  if (k === "HQ") return "bg-red-500/20 text-red-200 border-red-400/50";
  return "bg-white/5 border-white/10 text-white/70";
};

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <Select value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
      <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">All {label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PersonnelListView({
  title, persons, onBack,
}: {
  title: string;
  persons: Person[];
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const [bty, setBty] = useState("");
  const [rank, setRank] = useState("");
  const [cl, setCl] = useState("");
  const [section, setSection] = useState("");
  const [trade, setTrade] = useState("");
  const [viewing, setViewing] = useState<Person | null>(null);


  const uniq = (k: keyof Person) =>
    Array.from(new Set(persons.map((p) => p[k]).filter(Boolean) as string[])).sort();
  const options = {
    bty: uniq("bty"),
    rank: uniq("rank"),
    cl: uniq("cl"),
    section: uniq("section"),
    trade: uniq("trade"),
  };

  const filtered = persons.filter((p) => {
    if (bty && p.bty !== bty) return false;
    if (rank && p.rank !== rank) return false;
    if (cl && p.cl !== cl) return false;
    if (section && p.section !== section) return false;
    if (trade && p.trade !== trade) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (
      p.name.toLowerCase().includes(t) ||
      p.armyNo.toLowerCase().includes(t) ||
      p.rank.toLowerCase().includes(t) ||
      p.trade.toLowerCase().includes(t) ||
      p.section.toLowerCase().includes(t)
    );
  }).sort((a, b) => {
    const c = (a.bty || "").localeCompare(b.bty || "", undefined, { numeric: true, sensitivity: "base" });
    if (c !== 0) return c;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  const reset = () => { setQ(""); setBty(""); setRank(""); setCl(""); setSection(""); setTrade(""); };

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
    <section className="space-y-4 animate-fade-in">

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="p-2 rounded-md bg-black/40 border border-[color:var(--gold)]/25 text-[color:var(--gold-soft)] hover:bg-[color:var(--gold)]/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-gold-gradient uppercase tracking-wide truncate">
            {title}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mt-0.5">
            {filtered.length} of {persons.length} Personnel
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search by Army No, Rank, Trade, or Name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm placeholder:text-white/30"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <FilterSelect label="Section" value={section} onChange={setSection} options={options.section} />
          <FilterSelect label="Battery" value={bty} onChange={setBty} options={options.bty} />
          <FilterSelect label="Rank" value={rank} onChange={setRank} options={options.rank} />
          <FilterSelect label="Trade" value={trade} onChange={setTrade} options={options.trade} />
          <FilterSelect label="Class" value={cl} onChange={setCl} options={options.cl} />
          <button
            onClick={reset}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-widest text-white/70 hover:bg-white/5 hover:text-[color:var(--gold-soft)]"
          >
            Reset
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-10 italic">
          No personnel match your filters.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((p) => (
            <li key={p.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setViewing(p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setViewing(p); } }}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--gold)]/15 bg-black/30 px-3 py-3 hover:bg-black/45 transition-colors cursor-pointer">

                <div className="relative shrink-0">
                  <img
                    src={defaultAvatarSrc}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover object-top ring-1 ring-[color:var(--gold)]/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[color:var(--neon)] ring-2 ring-black/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {p.rank} {p.trade} {p.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono text-[color:var(--gold-soft)]">{p.armyNo}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${batteryTone(p.bty)}`}>
                          {p.bty || "—"} Bty
                        </span>
                        <span className="text-[11px] text-white/50">Cl: {p.cl}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider rounded-md border px-2 py-0.5 shrink-0 ${remarksTone(p.remarks)}`}>
                      {p.remarks || "Aval"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/60">
                    <UserIcon className="h-3 w-3" />
                    <span className="italic truncate">{p.section}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

    </section>
  );
}


