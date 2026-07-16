import { useEffect, useMemo, useRef, useState } from "react";
import { Search, User, Pencil, Plus, X, Camera, Trash2, Menu, ArrowLeft, Shield, MapPin, Calendar, Hash, Briefcase, Award, Users as UsersIcon, Phone, Home, ClipboardList } from "lucide-react";
import { useMarkProfileOpen } from "@/lib/profile-view";
import { useIsReadOnly } from "@/lib/auth";
import { defaultAvatarSrc } from "@/lib/app-assets";
import { toast } from "sonner";
import personnel from "@/data/personnel.json";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


type Person = {
  id: number;
  section: string;
  armyNo: string;
  rank: string;
  trade: string;
  name: string;
  cl: string;
  bty: string;
  remarks: string | null;
  fighting?: "Fighting" | "Non-Fighting";
  category?: string;
  phone?: string;
  city?: string;
  photo?: string | null;
};

const SEED = personnel as Person[];

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
  if (k === "P")  return "bg-slate-300/15 text-slate-200 border-slate-300/40";           // Papa — light gray
  if (k === "Q")  return "bg-orange-300/15 text-orange-200 border-orange-300/40";        // Quebec — light orange
  if (k === "R")  return "bg-emerald-300/15 text-emerald-200 border-emerald-300/40";     // Romeo — light green
  if (k === "HQ") return "bg-red-500/20 text-red-200 border-red-400/50";                 // HQ — red
  return "bg-white/5 border-white/10 text-white/70";
};

const batteryFullName = (b: string) => {
  const k = (b || "").trim().toUpperCase();
  if (k === "P") return "Papa Battery";
  if (k === "Q") return "Quebec Battery";
  if (k === "R") return "Romeo Battery";
  if (k === "HQ") return "Headquarter Battery";
  return `${b} Battery`;
};


const CATEGORIES = ["Officers", "JCOs", "NCOs", "Gnrs", "Unit Gds"];
const FIGHTING_OPTS: Array<"Fighting" | "Non-Fighting"> = ["Fighting", "Non-Fighting"];

export default function NominalRoll() {
  const readOnly = useIsReadOnly();
  const [people, setPeople] = useState<Person[]>(SEED);
  const [q, setQ] = useState("");
  const [bty, setBty] = useState("");
  const [rank, setRank] = useState("");
  const [cl, setCl] = useState("");
  const [section, setSection] = useState("");
  const [trade, setTrade] = useState("");

  const [modal, setModal] = useState<{ mode: "add" | "edit"; person: Person } | null>(null);
  const [rowMode, setRowMode] = useState<"edit" | "delete" | null>(null);
  const [confirmDel, setConfirmDel] = useState<Person | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [viewing, setViewing] = useState<Person | null>(null);



  const options = useMemo(() => {
    const uniq = (k: keyof Person) =>
      Array.from(new Set(people.map((p) => p[k]).filter(Boolean) as string[])).sort();
    return {
      bty: uniq("bty"),
      rank: uniq("rank"),
      cl: uniq("cl"),
      section: uniq("section"),
      trade: uniq("trade"),
    };
  }, [people]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const filtered = people.filter((p) => {
      if (bty && p.bty !== bty) return false;
      if (rank && p.rank !== rank) return false;
      if (cl && p.cl !== cl) return false;
      if (section && p.section !== section) return false;
      if (trade && p.trade !== trade) return false;
      if (!t) return true;
      return (
        p.name.toLowerCase().includes(t) ||
        p.armyNo.toLowerCase().includes(t) ||
        p.rank.toLowerCase().includes(t) ||
        p.trade.toLowerCase().includes(t) ||
        p.section.toLowerCase().includes(t)
      );
    });
    return [...filtered].sort((a, b) => {
      const btyCmp = (a.bty || "").localeCompare(b.bty || "", undefined, { numeric: true, sensitivity: "base" });
      if (btyCmp !== 0) return btyCmp;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [q, bty, rank, cl, section, trade, people]);


  const reset = () => { setQ(""); setBty(""); setRank(""); setCl(""); setSection(""); setTrade(""); };

  const openAdd = () => setModal({
    mode: "add",
    person: {
      id: Date.now(),
      section: "", armyNo: "", rank: "", trade: "", name: "",
      cl: "", bty: "", remarks: null,
      fighting: "Fighting", category: "", phone: "", city: "", photo: null,
    },
  });

  const openEdit = (p: Person) => setModal({ mode: "edit", person: { ...p } });

  const savePerson = (p: Person) => {
    if (!p.armyNo.trim() || !p.name.trim()) {
      toast.error("Missing required fields", { description: "Army Number and Full Name are required." });
      return;
    }
    setPeople((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
    });
    toast.success(modal?.mode === "add" ? "Personnel added" : "Personnel updated", { description: `${p.rank || ""} ${p.name}`.trim() });
    setModal(null);
  };

  const deletePerson = (target: Person) => {
    const snapshot = people;
    setPeople((prev) => prev.filter((x) => x.id !== target.id));
    setConfirmDel(null);
    toast.success("Personnel deleted", {
      description: `${target.rank || ""} ${target.name}`.trim(),
      action: { label: "Undo", onClick: () => setPeople(snapshot) },
    });
  };

  const onRowClick = (p: Person) => {
    if (readOnly) { setViewing(p); return; }
    if (rowMode === "edit") openEdit(p);
    else if (rowMode === "delete") setConfirmDel(p);
    else setViewing(p);
  };

  if (viewing) {
    return (
      <ProfileModal
        person={viewing}
        onClose={() => setViewing(null)}
        onEdit={() => { const pp = viewing; setViewing(null); openEdit(pp); }}
        readOnly={readOnly}
      />
    );
  }

  return (
    <section className="space-y-4">


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
          <Select label="Section" value={section} onChange={setSection} options={options.section} />
          <Select label="Battery" value={bty} onChange={setBty} options={options.bty} />
          <Select label="Rank" value={rank} onChange={setRank} options={options.rank} />
          <Select label="Trade" value={trade} onChange={setTrade} options={options.trade} />
          <Select label="Class" value={cl} onChange={setCl} options={options.cl} />
          <button
            onClick={reset}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-widest text-white/70 hover:bg-white/5 hover:text-[color:var(--gold-soft)]"
          >
            Reset
          </button>
        </div>
        <div className="text-xs text-white/60">
          Showing: <span className="text-[color:var(--gold-soft)] font-semibold">{list.length}</span> of {people.length} Personnel
        </div>
      </div>

      <ul className="space-y-2.5">
        {list.map((p) => {
          const ringCls =
            rowMode === "edit"
              ? "ring-2 ring-[color:var(--gold)]/50"
              : rowMode === "delete"
              ? "ring-2 ring-rose-500/60"
              : "";
          return (
            <li key={p.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onRowClick(p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(p); } }}
                className={`flex items-center gap-3 rounded-xl border border-[color:var(--gold)]/15 bg-black/30 px-3 py-3 transition-colors cursor-pointer hover:bg-black/50 ${ringCls}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={p.photo || defaultAvatarSrc}
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
                        <span
                          title={batteryFullName(p.bty)}
                          className={`text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${batteryTone(p.bty)}`}
                        >
                          {p.bty} Bty
                        </span>
                        <span className="text-[11px] text-white/50">Cl: {p.cl}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider rounded-md border px-2 py-0.5 ${remarksTone(p.remarks)}`}>
                        {p.remarks || "Aval"}
                      </span>
                      {rowMode === "edit" && (
                        <span
                          aria-label="Edit"
                          className="grid place-items-center h-6 w-6 rounded-full bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/50 text-[color:var(--gold-soft)] animate-fade-in"
                        >
                          <Pencil className="h-3 w-3" />
                        </span>
                      )}
                      {rowMode === "delete" && (
                        <span
                          aria-label="Delete"
                          className="grid place-items-center h-6 w-6 rounded-full bg-rose-500/15 border border-rose-500/50 text-rose-200 animate-fade-in"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/60">
                    <User className="h-3 w-3" />
                    <span className="italic truncate">{p.section}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="text-center text-sm text-white/50 py-10">No personnel match your filters.</li>
        )}
      </ul>

      {/* Mode banner */}
      {rowMode && (
        <div className={`fixed bottom-6 left-6 z-30 flex items-center gap-3 rounded-full border px-4 py-2 text-xs uppercase tracking-widest shadow-lg animate-fade-in ${
          rowMode === "delete"
            ? "bg-black/80 border-rose-500/40 text-rose-200"
            : "bg-black/80 border-[color:var(--gold)]/40 text-[color:var(--gold-soft)]"
        }`}>
          {rowMode === "delete" ? "Tap a person to delete" : "Tap a person to edit"}
        </div>
      )}

      {/* FAB */}
      {!readOnly && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
          {fabOpen && (
            <>
              <FabButton
                onClick={() => { setRowMode((m) => (m === "delete" ? null : "delete")); }}
                active={rowMode === "delete"}
                activeTone="rose"
                label={rowMode === "delete" ? "Exit delete mode" : "Delete"}
              >
                <Trash2 className="h-5 w-5" />
              </FabButton>
              <FabButton
                onClick={() => { setRowMode((m) => (m === "edit" ? null : "edit")); }}
                active={rowMode === "edit"}
                activeTone="forest"
                label={rowMode === "edit" ? "Exit edit mode" : "Edit"}
              >
                <Pencil className="h-5 w-5" />
              </FabButton>
              <FabButton
                onClick={() => { openAdd(); setFabOpen(false); }}
                active={false}
                activeTone="forest"
                label="Add"
              >
                <Plus className="h-5 w-5" />
              </FabButton>
            </>
          )}
          <FabButton
            onClick={() => {
              if (fabOpen) { setFabOpen(false); setRowMode(null); }
              else setFabOpen(true);
            }}
            active={fabOpen}
            activeTone="forest"
            label={fabOpen ? "Close menu" : "Open actions menu"}
          >
            {fabOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </FabButton>
        </div>
      )}


      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this personnel?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel && `${confirmDel.rank || ""} ${confirmDel.name} (${confirmDel.armyNo}) will be removed. You can undo this from the toast.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDel && deletePerson(confirmDel)}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {modal && (
        <PersonModal
          mode={modal.mode}
          initial={modal.person}
          batteryOptions={options.bty}
          rankOptions={options.rank}
          tradeOptions={options.trade}
          classOptions={options.cl}
          sectionOptions={options.section}
          onClose={() => setModal(null)}
          onSave={savePerson}
        />
      )}

    </section>
  );
}

function FabButton({
  children, onClick, active, activeTone, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  activeTone: "rose" | "forest";
  label: string;
}) {
  const activeCls =
    activeTone === "rose"
      ? "bg-rose-500 text-white ring-2 ring-rose-300"
      : "bg-[color:var(--forest)] text-[color:var(--gold-soft)] ring-2 ring-[color:var(--gold)]";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={`h-12 w-12 rounded-full grid place-items-center shadow-lg transition hover:brightness-110 ${
        active ? activeCls : "bg-[color:var(--gold)] text-black"
      }`}
    >
      {children}
    </button>
  );
}


const ALL_SENTINEL = "__all__";

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <UiSelect
      value={value === "" ? ALL_SENTINEL : value}
      onValueChange={(v) => onChange(v === ALL_SENTINEL ? "" : v)}
    >
      <SelectTrigger
        aria-label={label}
        className="w-full h-10 rounded-md bg-black/40 border-white/10 hover:border-[color:var(--gold)]/40 focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/40 text-sm text-white/90 data-[placeholder]:text-white/50"
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent
        className="bg-[hsl(150_40%_6%)] border-[color:var(--gold)]/25 text-white/90"
        position="popper"
      >
        <SelectItem value={ALL_SENTINEL} className="text-white/70 focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">
          All {label.toLowerCase()}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}

function PersonModal({
  mode, initial, onClose, onSave,
  batteryOptions, rankOptions, tradeOptions, classOptions, sectionOptions,
}: {
  mode: "add" | "edit";
  initial: Person;
  onClose: () => void;
  onSave: (p: Person) => void;
  batteryOptions: string[];
  rankOptions: string[];
  tradeOptions: string[];
  classOptions: string[];
  sectionOptions: string[];
}) {
  const [p, setP] = useState<Person>(initial);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadPct !== null;

  const set = <K extends keyof Person>(k: K, v: Person[K]) => setP((s) => ({ ...s, [k]: v }));

  const onPickPhoto = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Photo too large", { description: "Please choose an image under 4 MB." });
      return;
    }
    const reader = new FileReader();
    setUploadPct(0);
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
    };
    reader.onerror = () => {
      setUploadPct(null);
      toast.error("Upload failed", { description: "Could not read the selected image." });
    };
    reader.onload = () => {
      set("photo", String(reader.result));
      setUploadPct(100);
      setTimeout(() => setUploadPct(null), 350);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (isUploading) return;
    onSave(p);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[color:var(--gold)]/30 bg-[hsl(150_40%_6%)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[color:var(--gold)]/20 bg-[hsl(150_40%_6%)]">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-gold-gradient">
            {mode === "add" ? "Add New Personnel" : "Edit Personnel"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={p.photo || defaultAvatarSrc}
                alt=""
                className={`h-20 w-20 rounded-full object-cover ring-2 ring-[color:var(--gold)]/50 transition ${isUploading ? "opacity-60" : ""}`}
              />
              {isUploading && (
                <div className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-[10px] font-bold text-[color:var(--gold-soft)]">
                  {uploadPct}%
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[color:var(--gold)] text-black grid place-items-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onPickPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="flex-1 text-xs text-white/60 space-y-1.5">
              <div className="uppercase tracking-widest text-[color:var(--gold-soft)] font-semibold">Profile Photo</div>
              {isUploading ? (
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--gold)] transition-all duration-150"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-white/70">Uploading… {uploadPct}%</p>
                </div>
              ) : (
                <>
                  <p>PNG or JPG, up to 4 MB.</p>
                  {p.photo && (
                    <button
                      type="button"
                      onClick={() => set("photo", null)}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </>
              )}
            </div>
          </div>


          <Field label="Fighting / Non-Fighting *">
            <NativeSelect
              value={p.fighting || ""}
              onChange={(v) => set("fighting", (v as "Fighting" | "Non-Fighting") || undefined)}
              placeholder="Select…"
              options={FIGHTING_OPTS as unknown as string[]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Army Number *">
              <TextInput value={p.armyNo} onChange={(v) => set("armyNo", v)} placeholder="e.g. PA-61131" />
            </Field>
            <Field label="Battery *">
              <NativeSelect
                value={p.bty}
                onChange={(v) => set("bty", v)}
                placeholder="Select battery…"
                options={batteryOptions}
              />
            </Field>
          </div>

          <Field label="Full Name *">
            <TextInput value={p.name} onChange={(v) => set("name", v)} placeholder="Enter full name" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Trade *">
              <NativeSelect value={p.trade} onChange={(v) => set("trade", v)} placeholder="Select…" options={tradeOptions} />
            </Field>
            <Field label="Rank *">
              <NativeSelect value={p.rank} onChange={(v) => set("rank", v)} placeholder="Select…" options={rankOptions} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <NativeSelect
                value={p.category || ""}
                onChange={(v) => set("category", v)}
                placeholder="Select…"
                options={Array.from(new Set([...CATEGORIES, ...sectionOptions]))}
              />
            </Field>
            <Field label="Class *">
              <NativeSelect value={p.cl} onChange={(v) => set("cl", v)} placeholder="Select…" options={classOptions} />
            </Field>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone Number">
              <TextInput value={p.phone || ""} onChange={(v) => set("phone", v)} placeholder="Enter phone…" />
            </Field>
            <Field label="City">
              <TextInput value={p.city || ""} onChange={(v) => set("city", v)} placeholder="Enter city…" />
            </Field>
          </div>

          <Field label="Remarks / Observations">
            <textarea
              value={p.remarks || ""}
              onChange={(e) => set("remarks", e.target.value || null)}
              placeholder="Enter remarks…"
              rows={2}
              className="w-full rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm text-white/90 px-3 py-2 placeholder:text-white/30"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 px-5 py-3 border-t border-[color:var(--gold)]/20 bg-[hsl(150_40%_6%)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs uppercase tracking-widest text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            aria-busy={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[color:var(--gold)] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading && (
              <span className="h-3 w-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            )}
            {isUploading ? `Uploading ${uploadPct}%` : mode === "add" ? "Add Personnel" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-soft)]">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md bg-black/40 border border-white/10 focus:border-[color:var(--gold)] focus:outline-none text-sm text-white/90 px-3 py-2 placeholder:text-white/30"
    />
  );
}

function NativeSelect({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <UiSelect value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        aria-label={placeholder}
        className="w-full h-10 rounded-md bg-black/40 border-white/10 hover:border-[color:var(--gold)]/40 focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/40 text-sm text-white/90 data-[placeholder]:text-white/50"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="bg-[hsl(150_40%_6%)] border-[color:var(--gold)]/25 text-white/90 max-h-64"
        position="popper"
      >
        {options.map((o) => (
          <SelectItem
            key={o}
            value={o}
            className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]"
          >
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}


export function ProfileModal({
  person, onClose, onEdit, readOnly = false,
}: {
  person: Person;
  onClose: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}) {
  useMarkProfileOpen();
  const p = person;
  const [showHistory, setShowHistory] = useState(false);
  const [editAssignment, setEditAssignment] = useState(false);
  const [assignment, setAssignment] = useState({
    category: "Trg",
    subcategory: "Guns",
    startDate: "16 Jul 26",
    endDate: "Infinite",
  });

  const fighting =
    p.fighting ??
    (["Officers", "JCOs", "NCOs", "Gnrs"].includes(p.section) ? "Fighting" : "Non-Fighting");

  // Deterministic fallbacks so every profile shows Phone / Home City / Remarks / Battery.
  const derived = (() => {
    let h = 0;
    const key = `${p.armyNo}:${p.id}`;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    const cities = ["Rawalpindi", "Lahore", "Karachi", "Peshawar", "Quetta", "Multan", "Sialkot", "Gujranwala", "Faisalabad", "Abbottabad", "Mardan", "Bahawalpur"];
    const remarksList = ["Duty", "Office", "Standby", "P/Lve", "C/Lve", "Trg - Guns", "Att - HQ", "Course - JNAC"];
    const batteries = ["P", "Q", "R", "HQ"];
    const city = cities[h % cities.length];
    const phone = `+92 3${((h >>> 3) % 5) + 0}${((h >>> 7) % 10)} ${String(1000000 + (h % 8999999)).padStart(7, "0")}`;
    const remarks = remarksList[(h >>> 5) % remarksList.length];
    const bty = batteries[(h >>> 2) % batteries.length];
    return { city, phone, remarks, bty };
  })();

  const displayPhone = p.phone || derived.phone;
  const displayCity = p.city || derived.city;
  const displayRemarks = p.remarks || derived.remarks;
  const displayBty = p.bty || derived.bty;

  const Row = ({
    icon: Icon, label, value,
  }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-b-0">
      <span className="grid place-items-center h-8 w-8 shrink-0 rounded-md bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 text-[color:var(--gold-soft)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{label}</div>
        <div className="text-sm text-white mt-0.5 truncate">{value || <span className="text-white/40 italic">—</span>}</div>
      </div>
    </div>
  );

  if (showHistory) {
    return <MovementHistoryModal person={p} onClose={() => setShowHistory(false)} />;
  }



  return (
    <section className="animate-fade-in">
      <div className="relative w-full rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--gold)]/20">
          <button
            onClick={onClose}
            aria-label="Back"
            className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
            Military Identification Card
          </h2>
          {readOnly ? (
            <span className="p-1.5 w-7" aria-hidden />
          ) : (
            <button
              onClick={onEdit}
              aria-label="Edit"
              className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10"
              title="Edit profile"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* ID Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#f5efe0] via-[#f8f2e4] to-[#ece0c4] border-2 border-[color:var(--gold)]/60 shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full border-[16px] border-[color:var(--gold)]" />
            </div>
            <div className="relative px-4 pt-3 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">
                    Zarb-Ul-Hadeed
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-black/60">
                    117 SP Regiment (Artillery)
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[color:var(--gold)]/20 border border-[color:var(--gold)]/60 text-[color:var(--gold)] rounded px-2 py-0.5">
                  Official ID
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-[color:var(--gold)] via-[color:var(--gold)]/60 to-transparent my-2.5" />
              <div className="flex items-center gap-3">
                <img
                  src={p.photo || defaultAvatarSrc}
                  alt={p.name}
                  className="h-20 w-20 rounded-lg object-cover object-top ring-2 ring-[color:var(--gold)]/70 bg-black/70"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold uppercase tracking-wide text-black truncate">
                    {p.name}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold text-black bg-white border border-[color:var(--gold)]/50 rounded px-1.5 py-0.5">
                    {p.armyNo}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">Rank</div>
                      <div className="text-sm font-bold text-[color:var(--gold)]">{p.rank || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">Trade</div>
                      <div className="text-sm font-bold text-[color:var(--gold)]">{p.trade || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div className="h-6 w-10 rounded-sm bg-gradient-to-br from-[color:var(--gold)] to-yellow-700 border border-[color:var(--gold)]/70" />
                <div className="flex flex-col items-end">
                  <div className="flex gap-[2px]">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span
                        key={i}
                        className="block bg-black"
                        style={{ width: i % 3 === 0 ? 2 : 1, height: 22 }}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] font-mono text-black/70 tracking-widest mt-0.5">
                    {p.armyNo}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Battery Highlight */}
          <div className={`rounded-xl border-2 px-4 py-3 flex items-center gap-3 ${batteryTone(p.bty)}`}>
            <div className="grid place-items-center h-11 w-11 rounded-full bg-black/40 border border-current/40">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">Battery Assignment</div>
              <div className="text-base font-bold uppercase tracking-wider truncate">
                {p.bty ? `${p.bty} — ${batteryFullName(p.bty)}` : "Unassigned"}
              </div>
            </div>
          </div>

          {/* Data Entry Fields */}
          <div className="rounded-xl bg-black/30 border border-[color:var(--gold)]/20 px-4 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)] py-2 border-b border-[color:var(--gold)]/20">
              Data Entry Information Fields
            </div>
            <Row icon={Shield} label="Combat Classification" value={`${fighting} Division`} />
            <button
              type="button"
              onClick={() => { if (!readOnly) setEditAssignment(true); }}
              disabled={readOnly}
              className="w-full text-left group disabled:cursor-default"
            >
              <div className={`flex items-start gap-3 py-2.5 border-b border-white/5 rounded-md transition-colors ${readOnly ? "" : "group-hover:bg-[color:var(--gold)]/5"}`}>
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-md bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 text-[color:var(--gold-soft)]">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Current Assignment / Location</div>
                    {!readOnly && <Pencil className="h-3 w-3 text-[color:var(--gold)]/70 group-hover:text-[color:var(--gold)]" />}
                  </div>
                  <div className="text-sm font-semibold text-[color:var(--gold-soft)] mt-0.5 truncate">
                    {assignment.category} → {assignment.subcategory}
                  </div>
                </div>
              </div>
            </button>
            <Row icon={Calendar} label="Assignment Period" value={`${assignment.startDate} to ${assignment.endDate}`} />

            <Row icon={Hash} label="Army Number" value={p.armyNo} />
            <Row icon={User} label="Full Name" value={p.name} />
            <Row icon={Briefcase} label="Trade / Role" value={p.trade} />
            <Row icon={Award} label="Rank" value={p.rank} />
            <Row icon={UsersIcon} label="Section" value={p.section} />
            <Row icon={Shield} label="Battery" value={`${displayBty} (${batteryFullName(displayBty)})`} />
            <Row icon={ClipboardList} label="Class Group" value={p.cl} />
            <Row icon={Phone} label="Phone Number" value={displayPhone} />
            <Row icon={Home} label="Home City" value={displayCity} />
            <Row icon={ClipboardList} label="Remarks / Observations" value={displayRemarks} />
          </div>

          {/* Movement History CTA */}
          <button
            onClick={() => setShowHistory(true)}
            className="w-full rounded-xl bg-gradient-to-r from-[color:var(--gold)] to-yellow-600 text-black font-bold uppercase tracking-[0.2em] text-xs py-3 shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            See Movement History
          </button>
        </div>
      </div>


      {editAssignment && (
        <AssignmentEditModal
          person={p}
          initial={assignment}
          onClose={() => setEditAssignment(false)}
          onSave={(next) => {
            setAssignment(next);
            setEditAssignment(false);
            toast.success("Assignment updated", {
              description: `${next.category} → ${next.subcategory}`,
            });
          }}
        />
      )}

    </section>

  );
}

type MovementEntry = { from: string; to: string; category: string; detail: string; days: string; tone: "gold" | "forest" };

function buildHistory(p: Person): MovementEntry[] {
  // Deterministic seeded picks
  let seed = 0;
  const key = `${p.armyNo}:${p.id}`;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const pick = <T,>(arr: T[]) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return arr[seed % arr.length];
  };
  const cats: Array<Omit<MovementEntry, "from" | "to" | "days" | "tone">> = [
    { category: "Trg", detail: "Guns" },
    { category: "Regt Emp", detail: "RP" },
    { category: "Courses", detail: "JNAC" },
    { category: "Leave", detail: "C/Lve" },
    { category: "Att", detail: "Arms Br" },
    { category: "Duty", detail: "Office" },
    { category: "Sports", detail: "Volleyball" },
    { category: "Working", detail: "Area Maint" },
  ];
  const picks = new Set<number>();
  while (picks.size < 3) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    picks.add(seed % cats.length);
  }
  const chosen = Array.from(picks).map((i) => cats[i]);

  return [
    { from: "06 Jul 26", to: "Present", days: "-", tone: "gold", category: p.remarks?.split(" ")[0] || "Duty", detail: p.trade || "Office" },
    { from: "16 Jun 26", to: "06 Jul 26", days: "20 Days", tone: "forest", ...chosen[0] },
    { from: "17 May 26", to: "16 Jun 26", days: "30 Days", tone: "forest", ...chosen[1] },
    { from: "17 Apr 26", to: "17 May 26", days: "30 Days", tone: "forest", ...chosen[2] },
  ];
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
function parseHistDate(s: string): Date | null {
  const parts = s.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const m = MONTHS[parts[1]];
  let year = parseInt(parts[2], 10);
  if (isNaN(day) || m === undefined || isNaN(year)) return null;
  if (year < 100) year += 2000;
  return new Date(year, m, day);
}

function MovementHistoryModal({ person, onClose }: { person: Person; onClose: () => void }) {
  const history = useMemo(() => buildHistory(person), [person]);
  const [range, setRange] = useState("All Time");

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.querySelector("main")?.scrollTo?.({ top: 0, behavior: "auto" });
    } catch {}
  }, []);


  const filtered = useMemo(() => {
    const monthsMap: Record<string, number | null> = {
      "Last 1 Month": 1,
      "Last 3 Months": 3,
      "Last 6 Months": 6,
      "All Time": null,
    };
    const months = monthsMap[range];
    const cutoff = months == null ? null : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      return d;
    })();

    return history.filter((h) => {
      if (!cutoff) return true;
      const d = parseHistDate(h.from);
      if (!d) return true;
      return d >= cutoff;
    });
  }, [history, range]);


  return (
    <section className="animate-fade-in">
      <div className="w-full max-w-3xl mx-auto rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl overflow-hidden">
        <div className="bg-[color:var(--forest-deep)]/95 backdrop-blur border-b border-[color:var(--gold)]/20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
                Movement History
              </h2>
              <p className="text-[11px] text-white/60 mt-0.5 truncate">
                {person.rank} {person.name} ({person.armyNo}) · Trade: {person.trade}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Filter bar */}
          <div className="rounded-xl border border-[color:var(--gold)]/25 bg-black/30 px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">
              Total Records:{" "}
              <span className="text-[color:var(--gold-soft)]">{filtered.length}</span>
            </div>
            <UiSelect value={range} onValueChange={setRange}>
              <SelectTrigger className="h-9 w-[150px] rounded-md bg-black/40 border-[color:var(--gold)]/25 text-xs text-white/90">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(150_40%_6%)] border-[color:var(--gold)]/25 text-white/90">
                <SelectItem value="Last 1 Month" className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">Last 1 Month</SelectItem>
                <SelectItem value="Last 3 Months" className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">Last 3 Months</SelectItem>
                <SelectItem value="Last 6 Months" className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">Last 6 Months</SelectItem>
                <SelectItem value="All Time" className="focus:bg-[color:var(--gold)]/10 focus:text-[color:var(--gold-soft)]">All Time</SelectItem>
              </SelectContent>
            </UiSelect>
          </div>


          {filtered.length === 0 ? (
            <div className="text-center text-sm text-white/50 italic py-10">
              No records match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((h, i) => {
                const dotCls = h.tone === "gold" ? "bg-[color:var(--gold)]" : "bg-emerald-500";
                const borderCls = h.tone === "gold"
                  ? "border-[color:var(--gold)]/40"
                  : "border-emerald-500/30";
                return (
                  <div
                    key={i}
                    className={`rounded-xl bg-black/30 border ${borderCls} p-3 hover:bg-black/40 transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${dotCls} shrink-0`} />
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--gold-soft)]">
                        {h.from} to {h.to}
                      </div>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-white">
                      {h.category} <span className="text-white/50">→</span> {h.detail}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span>{h.days}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-lg bg-[color:var(--gold)]/5 border border-[color:var(--gold)]/25 px-3 py-3 flex items-start gap-2.5">
            <span className="grid place-items-center h-6 w-6 shrink-0 rounded-full bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/40 text-[color:var(--gold-soft)] text-[10px] font-bold">
              i
            </span>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Individual movement history is stored for 3 months.
              <br />
              Monthly snapshot reports are stored for 1 month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



type Assignment = {
  category: string;
  subcategory: string;
  startDate: string;
  endDate: string;
};

const PRIMARY_CATEGORIES = ["Trg", "Regt Emp", "Courses", "Leave", "Att", "Duty", "Sports", "Working", "Available"];
const SUBCATEGORY_MAP: Record<string, string[]> = {
  "Trg": ["Guns", "Signals", "Driving", "Radar", "Survey", "Physical"],
  "Regt Emp": ["RP", "MT", "Store", "Cook House", "Lines", "QM"],
  "Courses": ["JNAC", "SNAC", "PT Ins", "Signals", "Gunnery", "Cadre"],
  "Leave": ["Annual", "Casual", "Sick", "Recreation"],
  "Att": ["DIDO", "HQ", "Sister Unit", "Adm"],
  "Duty": ["Guard", "QRF", "Adm", "Escort"],
  "Sports": ["Football", "Volley Ball", "Athletics", "Boxing"],
  "Working": ["Fatigue", "Line Clg", "Maintenance"],
  "Available": ["Aval"],
};

const assignmentInputClass =
  "w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)] focus:ring-1 focus:ring-[color:var(--gold)]/40";

const toIsoDate = (value: string) => {
  if (!value || value.toLowerCase() === "infinite") return "";
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return value;

  const parsed = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2}|\d{4})$/);
  if (!parsed) return "";

  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const month = months[parsed[2].toLowerCase()];
  if (!month) return "";

  const year = parsed[3].length === 2 ? `20${parsed[3]}` : parsed[3];
  return `${year}-${month}-${parsed[1].padStart(2, "0")}`;
};

const toDisplayDate = (value: string) => {
  if (!value) return "";
  const parsed = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parsed) return value;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(parsed[3])} ${months[Number(parsed[2]) - 1]} ${parsed[1].slice(2)}`;
};

function AssignmentEditModal({
  person, initial, onClose, onSave,
}: {
  person: Person;
  initial: Assignment;
  onClose: () => void;
  onSave: (next: Assignment) => void;
}) {
  const [form, setForm] = useState<Assignment>(initial);
  const subOptions = SUBCATEGORY_MAP[form.category] || [];
  const startIsoDate = toIsoDate(form.startDate);
  const endIsoDate = toIsoDate(form.endDate);

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in my-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--gold)]/20">
          <button
            onClick={onClose}
            aria-label="Back"
            className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
            Edit Personnel Assignment
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Person Chip */}
          <div className="rounded-xl border border-[color:var(--gold)]/40 bg-black/40 px-3 py-2.5 flex items-center gap-3">
            <img
              src={person.photo || defaultAvatarSrc}
              alt=""
              className="h-10 w-10 rounded-full object-cover object-top ring-2 ring-[color:var(--gold)]/60"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {person.rank} {person.name}
              </div>
              <span className="inline-block mt-0.5 text-[10px] font-mono font-bold bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/40 text-[color:var(--gold-soft)] rounded px-1.5 py-0.5">
                {person.armyNo}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl bg-black/30 border border-[color:var(--gold)]/20 p-4 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)] pb-2 border-b border-[color:var(--gold)]/20">
              Assignment Details
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Primary Category
              </label>
              <div className="mt-1.5">
                <select
                  value={form.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setForm({
                      ...form,
                      category,
                      subcategory: (SUBCATEGORY_MAP[category] || [""])[0] || "",
                    });
                  }}
                  className={assignmentInputClass}
                >
                  {PRIMARY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Subcategory
              </label>
              <div className="mt-1.5">
                <select
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className={assignmentInputClass}
                >
                  {subOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`${assignmentInputClass} mt-1.5 flex items-center justify-between text-left`}
                    >
                      <span className={startIsoDate ? "text-white" : "text-white/40"}>
                        {form.startDate && form.startDate.toLowerCase() !== "infinite" ? form.startDate : "Select date"}
                      </span>
                      <Calendar className="h-4 w-4 text-[color:var(--gold)]/70" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto p-0 border-[color:var(--gold)]/30 bg-[color:var(--forest-deep)]"
                  >
                    <CalendarUI
                      mode="single"
                      selected={startIsoDate ? new Date(startIsoDate + "T00:00:00") : undefined}
                      onSelect={(d) => {
                        if (!d) return;
                        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        setForm({ ...form, startDate: toDisplayDate(iso) });
                      }}
                      initialFocus
                      className="pointer-events-auto p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`${assignmentInputClass} mt-1.5 flex items-center justify-between text-left`}
                    >
                      <span className={endIsoDate ? "text-white" : "text-white/40"}>
                        {form.endDate && form.endDate.toLowerCase() !== "infinite" ? form.endDate : (form.endDate?.toLowerCase() === "infinite" ? "Infinite" : "Select date")}
                      </span>
                      <Calendar className="h-4 w-4 text-[color:var(--gold)]/70" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto p-0 border-[color:var(--gold)]/30 bg-[color:var(--forest-deep)]"
                  >
                    <CalendarUI
                      mode="single"
                      selected={endIsoDate ? new Date(endIsoDate + "T00:00:00") : undefined}
                      onSelect={(d) => {
                        if (!d) return;
                        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        setForm({ ...form, endDate: toDisplayDate(iso) });
                      }}
                      initialFocus
                      className="pointer-events-auto p-3"
                    />
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, endDate: "Infinite" })}
                  className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
                >
                  Infinite
                </button>
              </div>
            </div>


            <button
              type="button"
              onClick={() => {
                if (!form.category.trim() || !form.subcategory.trim()) {
                  toast.error("Please select category and subcategory");
                  return;
                }
                onSave(form);
              }}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-[color:var(--forest)] to-emerald-700 text-white font-bold uppercase tracking-[0.2em] text-xs py-3 shadow-lg hover:brightness-110 transition"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
