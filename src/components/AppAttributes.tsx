import { useState } from "react";
import { Pencil, Trash2, Plus, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Tab = "trades" | "ranks" | "batteries";

type RankCategory = { id: number; name: string; items: { id: number; name: string }[] };

const INIT_TRADES = ["Gnr", "TA", "OCU", "DMT", "DSV", "Svy", "Clk", "Ck", "Engr", "N/A", "LAD"];
const INIT_BATTERIES = ["HQ Bty", "P Bty", "Q Bty", "R Bty"];
const INIT_RANKS: RankCategory[] = [
  { id: 1, name: "Officers", items: [
    { id: 11, name: "Lt Col" }, { id: 12, name: "Maj" }, { id: 13, name: "Capt" },
    { id: 14, name: "Lt" },     { id: 15, name: "2/Lt" },
  ]},
  { id: 2, name: "JCOs", items: [
    { id: 21, name: "SM" }, { id: 22, name: "Sub" }, { id: 23, name: "N/Sub" },
  ]},
  { id: 3, name: "Soldiers", items: [
    { id: 31, name: "Hav" }, { id: 32, name: "Lhav" }, { id: 33, name: "Nk" },
    { id: 34, name: "Lnk" }, { id: 35, name: "Sep" },
  ]},
];

let nextId = 1000;
const uid = () => ++nextId;

export default function AppAttributes() {
  const [tab, setTab] = useState<Tab>("trades");
  const [trades, setTrades] = useState<string[]>(INIT_TRADES);
  const [batteries, setBatteries] = useState<string[]>(INIT_BATTERIES);
  const [ranks, setRanks] = useState<RankCategory[]>(INIT_RANKS);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<{ tab: Tab; kind: "cat" | "item"; catId?: number; id: number; name: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ tab: Tab; kind: "cat" | "item"; catId?: number; id: number; name: string } | null>(null);

  const tabLabel = tab === "trades" ? "Trade" : tab === "ranks" ? "Rank" : "Battery";

  // ---- Trades ----
  const addTrade = (name: string) => {
    setTrades((prev) => [...prev, name]);
    toast.success("Trade added", { description: name });
  };
  const editTrade = (oldName: string, name: string) => {
    setTrades((prev) => prev.map((t) => (t === oldName ? name : t)));
    toast.success("Trade updated");
  };
  const delTrade = (name: string) => {
    setTrades((prev) => prev.filter((t) => t !== name));
    toast.success("Trade deleted", { description: name });
  };

  // ---- Batteries ----
  const addBattery = (name: string) => { setBatteries((p) => [...p, name]); toast.success("Battery added", { description: name }); };
  const editBattery = (oldName: string, name: string) => { setBatteries((p) => p.map((b) => b === oldName ? name : b)); toast.success("Battery updated"); };
  const delBattery = (name: string) => { setBatteries((p) => p.filter((b) => b !== name)); toast.success("Battery deleted", { description: name }); };

  // ---- Ranks ----
  const addRankCategory = (name: string) => {
    setRanks((p) => [...p, { id: uid(), name, items: [] }]);
    toast.success("Rank category added", { description: name });
  };
  const addRankItem = (catId: number, name: string) => {
    setRanks((p) => p.map((c) => c.id === catId ? { ...c, items: [...c.items, { id: uid(), name }] } : c));
    toast.success("Rank added", { description: name });
  };
  const editRankCategory = (id: number, name: string) => {
    setRanks((p) => p.map((c) => c.id === id ? { ...c, name } : c));
    toast.success("Category updated");
  };
  const editRankItem = (catId: number, id: number, name: string) => {
    setRanks((p) => p.map((c) => c.id === catId ? { ...c, items: c.items.map((i) => i.id === id ? { ...i, name } : i) } : c));
    toast.success("Rank updated");
  };
  const delRankCategory = (id: number) => {
    setRanks((p) => p.filter((c) => c.id !== id));
    toast.success("Category deleted");
  };
  const delRankItem = (catId: number, id: number) => {
    setRanks((p) => p.map((c) => c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== id) } : c));
    toast.success("Rank deleted");
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <h2 className="text-center font-display text-lg font-bold text-gold-gradient uppercase tracking-[0.25em]">
        Manage App Attributes
      </h2>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-black/30 border border-[color:var(--gold)]/20 p-1">
        {(["trades", "ranks", "batteries"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "bg-gradient-to-b from-[color:var(--gold)] to-yellow-700 text-black shadow-lg"
                  : "text-white/70 hover:text-[color:var(--gold-soft)] hover:bg-white/5"
              }`}
            >
              {t === "trades" ? "Trades" : t === "ranks" ? "Ranks" : "Batteries"}
            </button>
          );
        })}
      </div>

      {/* All chip */}
      <div className="rounded-xl border border-[color:var(--gold)]/40 bg-black/30 px-4 py-2.5 text-[color:var(--gold-soft)] text-sm font-semibold">
        All
      </div>

      {/* Content */}
      <div className="space-y-2.5">
        {tab === "trades" && trades.map((t) => (
          <Row
            key={t}
            label={t}
            onEdit={() => setEditing({ tab: "trades", kind: "item", id: 0, name: t })}
            onDelete={() => setConfirmDel({ tab: "trades", kind: "item", id: 0, name: t })}
          />
        ))}

        {tab === "batteries" && batteries.map((b) => (
          <Row
            key={b}
            label={b}
            onEdit={() => setEditing({ tab: "batteries", kind: "item", id: 0, name: b })}
            onDelete={() => setConfirmDel({ tab: "batteries", kind: "item", id: 0, name: b })}
          />
        ))}

        {tab === "ranks" && ranks.map((cat) => (
          <div key={cat.id} className="space-y-2">
            <Row
              label={cat.name}
              highlight
              onEdit={() => setEditing({ tab: "ranks", kind: "cat", id: cat.id, name: cat.name })}
              onDelete={() => setConfirmDel({ tab: "ranks", kind: "cat", id: cat.id, name: cat.name })}
            />
            {cat.items.map((it) => (
              <Row
                key={it.id}
                label={it.name}
                nested
                onEdit={() => setEditing({ tab: "ranks", kind: "item", catId: cat.id, id: it.id, name: it.name })}
                onDelete={() => setConfirmDel({ tab: "ranks", kind: "item", catId: cat.id, id: it.id, name: it.name })}
              />
            ))}
          </div>
        ))}
      </div>

      {/* FAB add */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label={`Add ${tabLabel}`}
        className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-2xl bg-gradient-to-b from-[color:var(--gold)] to-yellow-700 text-black shadow-lg hover:brightness-110 flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add dialog */}
      {addOpen && (
        <AddDialog
          tab={tab}
          rankCategories={ranks}
          onClose={() => setAddOpen(false)}
          onSubmit={(payload) => {
            if (tab === "trades") addTrade(payload.name);
            else if (tab === "batteries") addBattery(payload.name);
            else if (tab === "ranks") {
              if (payload.kind === "cat") addRankCategory(payload.name);
              else if (payload.parentId != null) addRankItem(payload.parentId, payload.name);
            }
            setAddOpen(false);
          }}
        />
      )}

      {/* Edit dialog */}
      {editing && (
        <EditDialog
          title={`Edit ${
            editing.tab === "trades" ? "Trade"
            : editing.tab === "batteries" ? "Battery"
            : editing.kind === "cat" ? "Category" : "Rank"
          }`}
          initial={editing.name}
          onClose={() => setEditing(null)}
          onSave={(name) => {
            if (editing.tab === "trades") editTrade(editing.name, name);
            else if (editing.tab === "batteries") editBattery(editing.name, name);
            else if (editing.tab === "ranks") {
              if (editing.kind === "cat") editRankCategory(editing.id, name);
              else if (editing.catId != null) editRankItem(editing.catId, editing.id, name);
            }
            setEditing(null);
          }}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{confirmDel?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel?.tab === "ranks" && confirmDel.kind === "cat"
                ? "This category and all its ranks will be removed."
                : "This item will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDel) return;
                if (confirmDel.tab === "trades") delTrade(confirmDel.name);
                else if (confirmDel.tab === "batteries") delBattery(confirmDel.name);
                else if (confirmDel.tab === "ranks") {
                  if (confirmDel.kind === "cat") delRankCategory(confirmDel.id);
                  else if (confirmDel.catId != null) delRankItem(confirmDel.catId, confirmDel.id);
                }
                setConfirmDel(null);
              }}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function Row({
  label, nested, highlight, onEdit, onDelete,
}: {
  label: string; nested?: boolean; highlight?: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 border transition-colors ${
        highlight
          ? "bg-[color:var(--gold)]/10 border-[color:var(--gold)]/50"
          : nested
            ? "bg-black/25 border-white/10 ml-6"
            : "bg-black/30 border-[color:var(--gold)]/20"
      }`}
    >
      {nested && <CornerDownRight className="h-3.5 w-3.5 text-[color:var(--gold)]/70 shrink-0" />}
      <span className={`flex-1 text-sm font-semibold truncate ${highlight ? "text-[color:var(--gold-soft)]" : "text-white"}`}>
        {label}
      </span>
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddDialog({
  tab, rankCategories, onClose, onSubmit,
}: {
  tab: Tab;
  rankCategories: RankCategory[];
  onClose: () => void;
  onSubmit: (p: { name: string; kind?: "cat" | "sub"; parentId?: number }) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"sub" | "cat">("sub");
  const [parentId, setParentId] = useState<number | null>(rankCategories[0]?.id ?? null);

  const title =
    tab === "trades" ? "Add New Trade"
    : tab === "batteries" ? "Add New Battery"
    : "Add New Rank";

  const submit = () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (tab === "ranks") {
      if (kind === "sub" && parentId == null) { toast.error("Select a parent category"); return; }
      onSubmit({ name: name.trim(), kind, parentId: kind === "sub" ? parentId! : undefined });
    } else {
      onSubmit({ name: name.trim() });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-[color:var(--forest-deep,#0b1210)] text-white border-[color:var(--gold)]/40">
        <DialogHeader>
          <DialogTitle className="text-[color:var(--gold)] font-display uppercase tracking-widest">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {tab === "ranks" && (
            <>
              <div className="flex items-center gap-6">
                <RadioOption checked={kind === "sub"} onClick={() => setKind("sub")} label="Subcategory" />
                <RadioOption checked={kind === "cat"} onClick={() => setKind("cat")} label="Category" />
              </div>
              {kind === "sub" && (
                <div>
                  <div className="text-[11px] font-semibold text-white/60 mb-1">Parent Category:</div>
                  <UiSelect
                    value={parentId != null ? String(parentId) : ""}
                    onValueChange={(v) => setParentId(Number(v))}
                  >
                    <SelectTrigger className="w-full border-white/15 bg-black/40 text-white">
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {rankCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </UiSelect>
                </div>
              )}
            </>
          )}

          <div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder={
                tab === "trades" ? "Enter Trade name"
                : tab === "batteries" ? "Enter Battery name"
                : kind === "cat" ? "Enter Category name" : "Enter Rank name"
              }
              className="w-full border-0 border-b-2 border-white/15 focus:border-[color:var(--gold)] focus:outline-none bg-transparent py-2 text-sm text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <button onClick={onClose} className="text-sm text-white/60 hover:text-white px-4 py-2">
            Cancel
          </button>
          <button
            onClick={submit}
            className="text-sm font-bold uppercase tracking-wider bg-[color:var(--gold)] text-black rounded-full px-6 py-2 hover:brightness-110"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  title, initial, onClose, onSave,
}: {
  title: string; initial: string; onClose: () => void; onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const submit = () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    onSave(name.trim());
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-[color:var(--forest-deep,#0b1210)] text-white border-[color:var(--gold)]/40">
        <DialogHeader>
          <DialogTitle className="text-[color:var(--gold)] font-display uppercase tracking-widest">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className="w-full border-0 border-b-2 border-white/15 focus:border-[color:var(--gold)] focus:outline-none bg-transparent py-2 text-sm text-white"
          />
        </div>
        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <button onClick={onClose} className="text-sm text-white/60 hover:text-white px-4 py-2">
            Cancel
          </button>
          <button
            onClick={submit}
            className="text-sm font-bold uppercase tracking-wider bg-[color:var(--gold)] text-black rounded-full px-6 py-2 hover:brightness-110"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioOption({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-white/85"
    >
      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${checked ? "border-[color:var(--forest)]" : "border-white/30"}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-[color:var(--forest)]" />}
      </span>
      {label}
    </button>
  );
}
