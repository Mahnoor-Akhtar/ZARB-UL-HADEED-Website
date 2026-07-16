import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, X, ArrowLeft, Pencil, Trash2, UserPlus, User as UserIcon,
  MapPin, Users as UsersIcon, Check, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import personnel from "@/data/personnel.json";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";

type Person = {
  id: number;
  armyNo: string;
  rank: string;
  name: string;
  trade?: string;
  cl?: string;
  section?: string;
};

const PERSONNEL = personnel as Person[];

const CATEGORIES = ["Travel", "Training", "Sports", "Working Party"] as const;
type Category = (typeof CATEGORIES)[number];

type Group = {
  id: string;
  name: string;
  location: string;
  category: Category;
  leaderId: number | null;
  untilDate: string; // ISO yyyy-mm-dd
  memberIds: number[];
};

const STORAGE_KEY = "group-management-v1";

const seedGroups = (): Group[] => {
  const findId = (needle: string) =>
    PERSONNEL.find((p) => p.name.toLowerCase().includes(needle.toLowerCase()))?.id ?? null;
  return [
    {
      id: crypto.randomUUID(),
      name: "PMA Visit Team",
      location: "Kakul Abbottabad",
      category: "Travel",
      leaderId: findId("Tayyab") ?? PERSONNEL[0]?.id ?? null,
      untilDate: "2026-07-15",
      memberIds: PERSONNEL.slice(0, 4).map((p) => p.id),
    },
    {
      id: crypto.randomUUID(),
      name: "Assault Course Prep A",
      location: "Training Area Sector 4",
      category: "Training",
      leaderId: findId("Naeem") ?? PERSONNEL[1]?.id ?? null,
      untilDate: "2026-07-12",
      memberIds: PERSONNEL.slice(4, 7).map((p) => p.id),
    },
    {
      id: crypto.randomUUID(),
      name: "Kitchen Working Party",
      location: "Mess Hall Cookhouse",
      category: "Working Party",
      leaderId: findId("Usman Anwar") ?? PERSONNEL[2]?.id ?? null,
      untilDate: "2026-07-10",
      memberIds: PERSONNEL.slice(7, 11).map((p) => p.id),
    },
  ];
};

const loadGroups = (): Group[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedGroups();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedGroups();
    return parsed;
  } catch {
    return seedGroups();
  }
};

const categoryBadge: Record<Category, string> = {
  Travel: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  Training: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Sports: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  "Working Party": "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>(() => loadGroups());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [fabOpen, setFabOpen] = useState(false);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editPickerOpen, setEditPickerOpen] = useState(false);
  const [deletePickerOpen, setDeletePickerOpen] = useState(false);
  const [addPersonPickerOpen, setAddPersonPickerOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [managingMembers, setManagingMembers] = useState<Group | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Group | null>(null);
  const [viewing, setViewing] = useState<Group | null>(null);
  

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch {}
  }, [groups]);

  const personById = useMemo(() => {
    const m = new Map<number, Person>();
    PERSONNEL.forEach((p) => m.set(p.id, p));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (filter !== "All" && g.category !== filter) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    });
  }, [groups, query, filter]);

  const addGroup = (g: Group) => {
    setGroups((prev) => [g, ...prev]);
    toast.success(`Group "${g.name}" created`);
  };
  const saveGroup = (g: Group) => {
    setGroups((prev) => prev.map((x) => (x.id === g.id ? g : x)));
    toast.success(`Group "${g.name}" updated`);
  };
  const deleteGroup = (id: string) => {
    const g = groups.find((x) => x.id === id);
    setGroups((prev) => prev.filter((x) => x.id !== id));
    if (g) toast.success(`Group "${g.name}" deleted`);
  };

  return (
    <section className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--forest-deep)] px-4 py-4">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-base font-bold text-gold-gradient uppercase tracking-widest">
            Group Management
          </h2>
        </div>
        <div className="mt-3 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups by name or destination..."
            className="w-full rounded-full bg-black/40 border border-[color:var(--gold)]/25 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(["All", ...CATEGORIES] as const).map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "bg-[color:var(--gold)]/15 border-[color:var(--gold)] text-[color:var(--gold)]"
                  : "bg-black/30 border-white/15 text-white/70 hover:border-white/30"
              }`}
            >
              {active && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />}
              {c}
            </button>
          );
        })}
      </div>


      {/* Group cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-10 text-center text-sm text-white/50">
            No groups match your search.
          </div>
        ) : (
          filtered.map((g) => {
            const leader = g.leaderId ? personById.get(g.leaderId) : null;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setViewing(g)}
                className="w-full text-left rounded-xl border border-[color:var(--gold)]/20 bg-black/30 hover:bg-black/40 hover:border-[color:var(--gold)]/40 transition-colors px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-white">{g.name}</h3>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryBadge[g.category]}`}
                  >
                    {g.category}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-[color:var(--gold)]/70" />
                    <span className="text-white/60">Leader:</span>
                    <span className="font-semibold text-white truncate">
                      {leader ? `${leader.rank} ${leader.name}` : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[color:var(--gold)]/70" />
                    <span className="text-white/60">Location:</span>
                    <span className="font-semibold text-white truncate">{g.location}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                    <UsersIcon className="h-3.5 w-3.5" />
                    {g.memberIds.length} Personnel Assigned
                  </span>
                  <span className="text-white/50">Until: {g.untilDate}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
        {fabOpen && (
          <>
            <FabAction
              label="Add Person"
              icon={<UserPlus className="h-5 w-5" />}
              onClick={() => {
                setAddPersonPickerOpen(true);
                setFabOpen(false);
              }}
            />
            <FabAction
              label="Delete Group"
              icon={<Trash2 className="h-5 w-5" />}
              onClick={() => {
                setDeletePickerOpen(true);
                setFabOpen(false);
              }}
            />
            <FabAction
              label="Edit Group"
              icon={<Pencil className="h-5 w-5" />}
              onClick={() => {
                setEditPickerOpen(true);
                setFabOpen(false);
              }}
            />
            <FabAction
              label="Add Group"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => {
                setCreateOpen(true);
                setFabOpen(false);
              }}
            />
          </>
        )}
        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label={fabOpen ? "Close" : "Open group actions"}
          className="h-12 w-12 rounded-full bg-[color:var(--gold)] text-black shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
        >
          {fabOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Modals */}
      {createOpen && (
        <GroupFormModal
          title="Create Group"
          submitLabel="Create"
          initial={null}
          onClose={() => setCreateOpen(false)}
          onSubmit={(g) => {
            addGroup(g);
            setCreateOpen(false);
          }}
        />
      )}

      {editPickerOpen && (
        <PickerModal
          title="Select Group to Edit"
          groups={groups}
          icon={(g) => <Pencil className="h-4 w-4 text-amber-400" />}
          subtitle={(g) => g.category}
          onClose={() => setEditPickerOpen(false)}
          onPick={(g) => {
            setEditPickerOpen(false);
            setEditing(g);
          }}
        />
      )}

      {editing && (
        <GroupFormModal
          title="Edit Group"
          submitLabel="Save Changes"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(g) => {
            saveGroup(g);
            setEditing(null);
          }}
        />
      )}

      {deletePickerOpen && (
        <PickerModal
          title="Select Group to Delete"
          groups={groups}
          icon={() => <Trash2 className="h-4 w-4 text-rose-400" />}
          subtitle={(g) => g.category}
          onClose={() => setDeletePickerOpen(false)}
          onPick={(g) => {
            setDeletePickerOpen(false);
            setConfirmDelete(g);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Group?"
          message={`This will permanently delete "${confirmDelete.name}".`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteGroup(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}

      {addPersonPickerOpen && (
        <PickerModal
          title="Select Group to Add Person"
          groups={groups}
          icon={() => <UsersIcon className="h-4 w-4 text-[color:var(--gold)]" />}
          subtitle={(g) => `${g.memberIds.length} personnel`}
          onClose={() => setAddPersonPickerOpen(false)}
          onPick={(g) => {
            setAddPersonPickerOpen(false);
            setManagingMembers(g);
          }}
        />
      )}

      {managingMembers && (
        <ManageMembersModal
          group={managingMembers}
          onClose={() => setManagingMembers(null)}
          onSave={(next) => {
            saveGroup(next);
            setManagingMembers(null);
          }}
        />
      )}

      {viewing && (
        <GroupDetailsModal
          group={groups.find((g) => g.id === viewing.id) ?? viewing}
          personById={personById}
          onClose={() => setViewing(null)}
          onManageMembers={(g) => {
            setViewing(null);
            setManagingMembers(g);
          }}
          onEdit={(g) => {
            setViewing(null);
            setEditing(g);
          }}
        />
      )}
      
    </section>
  );
}

/* ---------- Sub-components ---------- */

function FabAction({
  label, icon, onClick,
}: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <span className="rounded-md bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/40 text-[color:var(--gold)] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-lg">
        {label}
      </span>
      <button
        onClick={onClick}
        aria-label={label}
        className="h-10 w-10 rounded-full bg-[color:var(--gold)] text-black shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {icon}
      </button>
    </div>
  );
}

function ModalShell({
  children, onClose, maxWidth = "max-w-sm",
}: { children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in my-4`}>
        {children}
      </div>
    </div>
  );
}

function GroupFormModal({
  title, submitLabel, initial, onClose, onSubmit,
}: {
  title: string;
  submitLabel: string;
  initial: Group | null;
  onClose: () => void;
  onSubmit: (g: Group) => void;
}) {
  const [form, setForm] = useState<Group>(
    initial ?? {
      id: crypto.randomUUID(),
      name: "",
      location: "",
      category: "Travel",
      leaderId: PERSONNEL[0]?.id ?? null,
      untilDate: new Date().toISOString().slice(0, 10),
      memberIds: [],
    },
  );

  const inputCls =
    "w-full rounded-md bg-black/40 border border-[color:var(--gold)]/25 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]";

  const submit = () => {
    if (!form.name.trim()) return toast.error("Group name required");
    if (!form.location.trim()) return toast.error("Location required");
    onSubmit({ ...form, name: form.name.trim(), location: form.location.trim() });
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="px-4 py-3 border-b border-[color:var(--gold)]/20">
        <h3 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
          {title}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">Group Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">Location</span>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={`mt-1 ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className={`mt-1 ${inputCls}`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">Group Leader</span>
          <select
            value={form.leaderId ?? ""}
            onChange={(e) => setForm({ ...form, leaderId: e.target.value ? Number(e.target.value) : null })}
            className={`mt-1 ${inputCls}`}
          >
            <option value="">Unassigned</option>
            {PERSONNEL.map((p) => (
              <option key={p.id} value={p.id}>{p.rank} {p.name} ({p.armyNo})</option>
            ))}
          </select>
        </label>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">Until Date</div>
            <div className="mt-1 text-sm font-semibold text-white">{form.untilDate}</div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[color:var(--gold)] text-black text-xs font-bold uppercase tracking-widest px-3 py-2 hover:opacity-90"
              >
                <CalendarDays className="h-4 w-4" />
                Select Date
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0 border-[color:var(--gold)]/30 bg-[color:var(--forest-deep)]">
              <CalendarUI
                mode="single"
                selected={form.untilDate ? new Date(form.untilDate + "T00:00:00") : undefined}
                onSelect={(d) => {
                  if (!d) return;
                  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setForm({ ...form, untilDate: iso });
                }}
                initialFocus
                className="pointer-events-auto p-3"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-4 py-3 border-t border-[color:var(--gold)]/20">
        <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white px-2 py-1">
          Cancel
        </button>
        <button
          onClick={submit}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5"
        >
          {submitLabel}
        </button>
      </div>
    </ModalShell>
  );
}

function PickerModal({
  title, groups, icon, subtitle, onClose, onPick,
}: {
  title: string;
  groups: Group[];
  icon: (g: Group) => React.ReactNode;
  subtitle: (g: Group) => string;
  onClose: () => void;
  onPick: (g: Group) => void;
}) {
  return (
    <ModalShell onClose={onClose}>
      <div className="px-4 py-3 border-b border-[color:var(--gold)]/20 text-center">
        <h3 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
          {title}
        </h3>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {groups.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-white/50">No groups yet.</div>
        ) : (
          groups.map((g) => (
            <button
              key={g.id}
              onClick={() => onPick(g)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left"
            >
              <div className="shrink-0 h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center">
                {icon(g)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{g.name}</div>
                <div className="text-[11px] text-white/50 truncate">{subtitle(g)}</div>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="flex justify-end px-4 py-3 border-t border-[color:var(--gold)]/20">
        <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--gold-soft)] px-2 py-1">
          Close
        </button>
      </div>
    </ModalShell>
  );
}

function ManageMembersModal({
  group, onClose, onSave,
}: {
  group: Group;
  onClose: () => void;
  onSave: (g: Group) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(group.memberIds));
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PERSONNEL.slice(0, 200);
    return PERSONNEL.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.rank.toLowerCase().includes(term) ||
        p.armyNo.toLowerCase().includes(term),
    ).slice(0, 200);
  }, [q]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--gold)]/20">
        <div>
          <h3 className="text-sm font-bold text-white">Manage Members</h3>
          <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-[color:var(--gold)]">
            {group.name}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search personnel..."
            className="w-full rounded-md bg-black/40 border border-[color:var(--gold)]/25 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]"
          />
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto px-4 pb-3 space-y-1.5">
        {results.map((p) => {
          const on = selected.has(p.id);
          return (
            <label
              key={p.id}
              className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 cursor-pointer hover:bg-white/[0.06]"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{p.rank} {p.name}</div>
                <div className="text-[11px] text-white/50">{p.armyNo}</div>
              </div>
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 accent-emerald-500"
              />
            </label>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 px-4 py-3 border-t border-[color:var(--gold)]/20">
        <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white px-2 py-1">
          Cancel
        </button>
        <button
          onClick={() => onSave({ ...group, memberIds: Array.from(selected) })}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title, message, confirmLabel, danger, onCancel, onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell onClose={onCancel}>
      <div className="p-5">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/70">{message}</p>
      </div>
      <div className="flex justify-end gap-3 px-4 py-3 border-t border-[color:var(--gold)]/20">
        <button onClick={onCancel} className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white px-2 py-1">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-md text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 ${
            danger ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

function GroupDetailsModal({
  group, personById, onClose, onManageMembers, onEdit,
}: {
  group: Group;
  personById: Map<number, Person>;
  onClose: () => void;
  onManageMembers: (g: Group) => void;
  onEdit: (g: Group) => void;
}) {
  const leader = group.leaderId ? personById.get(group.leaderId) : null;
  const members = group.memberIds
    .map((id) => personById.get(id))
    .filter((p): p is Person => !!p);

  const uniqueCategories = new Set(members.map((m) => m.cl).filter(Boolean));

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in my-4 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-4 bg-gradient-to-b from-[color:var(--forest)] to-[color:var(--forest-deep)] border-b border-[color:var(--gold)]/20">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex items-center gap-2 text-[color:var(--gold)] hover:text-[color:var(--gold-soft)]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Group Details</span>
            </button>
            <button
              onClick={() => onEdit(group)}
              aria-label="Edit"
              className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-white">{group.name}</h2>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryBadge[group.category]}`}
            >
              {group.category}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs text-white/80">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-[color:var(--gold)]/70" />
                {leader ? `${leader.rank} ${leader.name}` : "Unassigned"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[color:var(--gold)]/70" />
                {group.location}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-white/70">
              <CalendarDays className="h-3.5 w-3.5 text-[color:var(--gold)]/70" />
              Until {formatDate(group.untilDate)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4 mt-4 rounded-xl bg-white/[0.04] border border-white/10 grid grid-cols-3 divide-x divide-white/10">
          <Stat icon={<UsersIcon className="h-4 w-4 text-[color:var(--gold)]" />} value={String(members.length)} label="Total Personnel" tone="gold" />
          <Stat icon={<UsersIcon className="h-4 w-4 text-amber-400" />} value={String(uniqueCategories.size)} label="Categories" tone="amber" />
          <Stat icon={<UserIcon className="h-4 w-4 text-sky-400" />} value={leader?.rank ?? "—"} label="Leader Rank" tone="sky" />
        </div>

        {/* Assigned personnel */}
        <div className="px-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[color:var(--gold)]">
            <UsersIcon className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Assigned Personnel</span>
          </div>
          <button
            onClick={() => onManageMembers(group)}
            className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--gold-soft)]"
          >
            Manage
          </button>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-4 py-3 space-y-2">
          {members.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-6 text-center text-sm text-white/50">
              No personnel assigned yet.
            </div>
          ) : (
            members.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5"
              >
                <div className="shrink-0 h-9 w-9 rounded-full bg-[color:var(--forest)] border border-[color:var(--gold)]/40 text-[color:var(--gold)] grid place-items-center text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {p.rank} {p.name}
                  </div>
                  <div className="text-[11px] text-white/50">{p.armyNo}</div>
                </div>
                {(p.cl || p.trade) && (
                  <div className="text-right shrink-0">
                    {p.cl && (
                      <div className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        {p.cl}
                      </div>
                    )}
                    {p.trade && (
                      <div className="mt-0.5 text-[10px] text-white/50">{p.trade}s</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-4 py-3 border-t border-[color:var(--gold)]/20">
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--gold-soft)] px-2 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon, value, label,
}: { icon: React.ReactNode; value: string; label: string; tone?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-2">
      <div className="mb-1">{icon}</div>
      <div className="text-lg font-bold text-white leading-none">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/60 text-center">{label}</div>
    </div>
  );
}
