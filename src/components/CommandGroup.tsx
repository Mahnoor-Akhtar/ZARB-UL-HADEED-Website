import { useEffect, useMemo, useState } from "react";
import { Pencil, MinusCircle, PlusCircle, Search, X, ArrowLeft, Users as UsersIcon, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import personnel from "@/data/personnel.json";

const CATEGORIES = ["Operational", "Administrative", "Training", "Logistics", "Intelligence"] as const;
type Category = (typeof CATEGORIES)[number];

type GroupMeta = {
  category: Category | "";
  leaderId: number | null;
  effectiveFrom: string; // yyyy-mm-dd
  effectiveTo: string;
};

const META_KEY = "cmd-group-meta-v1";
const defaultMeta = (): GroupMeta => ({ category: "", leaderId: null, effectiveFrom: "", effectiveTo: "" });
const loadMeta = (): GroupMeta => {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta();
    return { ...defaultMeta(), ...(JSON.parse(raw) as GroupMeta) };
  } catch {
    return defaultMeta();
  }
};

type Person = {
  id: number;
  section?: string;
  armyNo: string;
  rank: string;
  name: string;
};

type Role = "SUPER ADMIN" | "ADMIN" | "USER";

type Slot = {
  slot: number;
  role: Role;
  personId: number | null;
  username: string;
  password: string;
};

const TOTAL_SLOTS = 12;
const STORAGE_KEY = "cmd-group-slots-v1";

const roleForSlot = (slot: number): Role => {
  if (slot === 1) return "SUPER ADMIN";
  if (slot >= 2 && slot <= 5) return "ADMIN";
  return "USER";
};

const defaultSlots = (): Slot[] =>
  Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
    slot: i + 1,
    role: roleForSlot(i + 1),
    personId: null,
    username: "",
    password: "",
  }));

const loadSlots = (): Slot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSlots();
    const parsed = JSON.parse(raw) as Slot[];
    if (!Array.isArray(parsed) || parsed.length !== TOTAL_SLOTS) return defaultSlots();
    return parsed.map((s, i) => ({ ...s, slot: i + 1, role: roleForSlot(i + 1) }));
  } catch {
    return defaultSlots();
  }
};

const roleAccent: Record<Role, string> = {
  "SUPER ADMIN": "text-[color:var(--gold)]",
  ADMIN: "text-[color:var(--gold)]",
  USER: "text-[color:var(--gold)]",
};

export default function CommandGroup({ onClose }: { onClose: () => void }) {
  const [slots, setSlots] = useState<Slot[]>(() => loadSlots());
  const [editing, setEditing] = useState<Slot | null>(null); // edit credentials
  const [assigning, setAssigning] = useState<number | null>(null); // slot number
  const [creatingFor, setCreatingFor] = useState<{ slot: number; person: Person } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch {}
  }, [slots]);

  const counts = useMemo(() => {
    const filled = slots.filter((s) => s.personId !== null);
    return {
      super: filled.filter((s) => s.role === "SUPER ADMIN").length,
      admins: filled.filter((s) => s.role === "ADMIN").length,
      users: filled.filter((s) => s.role === "USER").length,
    };
  }, [slots]);


  const [meta, setMeta] = useState<GroupMeta>(() => loadMeta());
  const [metaEditing, setMetaEditing] = useState(false);
  const [draft, setDraft] = useState<GroupMeta>(meta);
  const [errors, setErrors] = useState<{ category?: string; leaderId?: string; effectiveFrom?: string; effectiveTo?: string }>({});

  useEffect(() => {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {}
  }, [meta]);

  const personById = useMemo(() => {
    const map = new Map<number, Person>();
    (personnel as Person[]).forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const removeSlot = (slotNumber: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.slot === slotNumber ? { ...s, personId: null, username: "", password: "" } : s,
      ),
    );
    toast.success(`Slot ${slotNumber} cleared`);
  };

  const saveCredentials = (username: string, password: string) => {
    if (!editing) return;
    if (!username.trim()) return toast.error("Username required");
    if (!password.trim()) return toast.error("Password required");
    setSlots((prev) =>
      prev.map((s) => (s.slot === editing.slot ? { ...s, username: username.trim(), password } : s)),
    );
    toast.success(`Slot ${editing.slot} credentials updated`);
    setEditing(null);
  };

  const createAssignment = (username: string, password: string) => {
    if (!creatingFor) return;
    if (!username.trim()) return toast.error("Username required");
    if (!password.trim()) return toast.error("Password required");
    setSlots((prev) =>
      prev.map((s) =>
        s.slot === creatingFor.slot
          ? { ...s, personId: creatingFor.person.id, username: username.trim(), password }
          : s,
      ),
    );
    toast.success(`${creatingFor.person.rank} ${creatingFor.person.name} assigned to Slot ${creatingFor.slot}`);
    setCreatingFor(null);
    setAssigning(null);
  };

  const filledPeople = useMemo(
    () => slots.filter((s) => s.personId !== null).map((s) => ({ slot: s.slot, person: personById.get(s.personId as number)! })).filter((x) => x.person),
    [slots, personById],
  );

  const validateMeta = (d: GroupMeta) => {
    const e: typeof errors = {};
    if (!d.category) e.category = "Select a category";
    if (d.leaderId === null) e.leaderId = "Select a leader";
    else if (!slots.some((s) => s.personId === d.leaderId)) e.leaderId = "Leader must be an assigned member";
    if (!d.effectiveFrom) e.effectiveFrom = "Start date required";
    if (!d.effectiveTo) e.effectiveTo = "End date required";
    if (d.effectiveFrom && d.effectiveTo && d.effectiveFrom > d.effectiveTo) e.effectiveTo = "End must be on or after start";
    return e;
  };

  const startEditMeta = () => {
    setDraft(meta);
    setErrors({});
    setMetaEditing(true);
  };

  const confirmMeta = () => {
    const e = validateMeta(draft);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Fix highlighted fields");
      return;
    }
    setMeta(draft);
    setMetaEditing(false);
    toast.success("Group details updated");
  };

  const cancelMeta = () => {
    setErrors({});
    setMetaEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-xl overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[color:var(--gold)]/20 bg-[color:var(--forest-deep)]/95 backdrop-blur-sm">
          <div className="min-w-0">
            <h2 className="font-display text-sm sm:text-base font-bold text-gold-gradient uppercase tracking-[0.25em] truncate">
              Manage Command Group ({TOTAL_SLOTS} Members)
            </h2>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/60">
              {counts.super} Super Admin · {counts.admins} Admins · {counts.users} Users
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 space-y-2.5">



          {slots.map((s) => {
            const person = s.personId ? personById.get(s.personId) : null;
            const filled = !!person;
            return (
              <div
                key={s.slot}
                className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${roleAccent[s.role]}`}>
                    Slot {s.slot} · {s.role}
                  </div>
                  {filled && person ? (
                    <>
                      <div className="mt-0.5 text-sm font-semibold text-white truncate">
                        {person.rank} {person.name} ({person.armyNo})
                      </div>
                      <div className="text-xs text-white/60 truncate">Login: {s.username || "—"}</div>
                    </>
                  ) : (
                    <div className="mt-0.5 text-sm italic text-white/40">Empty Slot</div>
                  )}
                </div>

                {filled ? (
                  <>
                    <button
                      onClick={() => setEditing(s)}
                      aria-label={`Edit slot ${s.slot} credentials`}
                      className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeSlot(s.slot)}
                      aria-label={`Remove slot ${s.slot}`}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAssigning(s.slot)}
                    aria-label={`Assign to slot ${s.slot}`}
                    className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>


      {/* Edit credentials modal */}
      {editing && (
        <CredentialsModal
          title="Edit Slot Credentials"
          subtitle={`Editing Slot ${editing.slot} credentials.`}
          initialUsername={editing.username}
          initialPassword={editing.password}
          submitLabel="Save"
          onSubmit={saveCredentials}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Assign soldier modal */}
      {assigning !== null && (
        <AssignSoldierModal
          slotNumber={assigning}
          takenIds={new Set(slots.filter((s) => s.personId).map((s) => s.personId as number))}
          onBack={() => setAssigning(null)}
          onSelect={(person) => setCreatingFor({ slot: assigning, person })}
        />
      )}

      {/* Set new credentials modal */}
      {creatingFor && (
        <CredentialsModal
          title={creatingFor.slot === 1 ? "Set Super Admin Credentials" : roleForSlot(creatingFor.slot) === "ADMIN" ? "Set Admin Credentials" : "Set User Credentials"}
          subtitle={`Assign login credentials for ${creatingFor.person.rank} ${creatingFor.person.name} (${creatingFor.person.armyNo}).`}
          initialUsername={creatingFor.person.armyNo}
          initialPassword=""
          submitLabel="Create"
          onSubmit={createAssignment}
          onClose={() => setCreatingFor(null)}
        />
      )}
    </div>
  );
}

/* ------------- Sub modals ------------- */

function CredentialsModal({
  title,
  subtitle,
  initialUsername,
  initialPassword,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  subtitle: string;
  initialUsername: string;
  initialPassword: string;
  submitLabel: string;
  onSubmit: (u: string, p: string) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in">
        <div className="px-4 py-3 border-b border-[color:var(--gold)]/20">
          <h3 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
            {title}
          </h3>
          <p className="mt-1 text-xs text-white/60">{subtitle}</p>
        </div>
        <div className="p-4 space-y-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md bg-black/40 border border-[color:var(--gold)]/30 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">
              Password
            </span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md bg-black/40 border border-[color:var(--gold)]/30 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]"
            />
          </label>
        </div>
        <div className="flex justify-end gap-4 px-4 py-3 border-t border-[color:var(--gold)]/20">
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white px-2 py-1"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(username, password)}
            className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--gold-soft)] px-2 py-1"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignSoldierModal({
  slotNumber,
  takenIds,
  onBack,
  onSelect,
}: {
  slotNumber: number;
  takenIds: Set<number>;
  onBack: () => void;
  onSelect: (p: Person) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = (personnel as Person[]).filter((p) => !takenIds.has(p.id));
    if (!term) return all.slice(0, 100);
    return all
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.rank.toLowerCase().includes(term) ||
          p.armyNo.toLowerCase().includes(term),
      )
      .slice(0, 100);
  }, [q, takenIds]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onBack} />
      <div className="relative w-full max-w-md rounded-2xl bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/30 shadow-2xl animate-scale-in my-4">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--gold)]/20">
          <button
            onClick={onBack}
            aria-label="Back"
            className="p-1.5 rounded-md text-[color:var(--gold)] hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h3 className="font-display text-sm font-bold text-gold-gradient uppercase tracking-[0.25em]">
            Assign Soldier to Slot {slotNumber}
          </h3>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--gold)]/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Name, Rank, or Army No…"
              className="w-full rounded-md bg-black/40 border border-[color:var(--gold)]/30 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-[color:var(--gold)]"
            />
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-4 pb-3 space-y-2">
          {results.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-6 text-sm text-white/50">
              <UsersIcon className="h-4 w-4" /> No personnel match your search.
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {p.rank} {p.name}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80">
                    Army No: {p.armyNo}
                  </div>
                </div>
                <button
                  onClick={() => onSelect(p)}
                  className="rounded-md bg-[color:var(--forest-deep)] border border-[color:var(--gold)]/40 text-[color:var(--gold)] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-[color:var(--gold)]/10"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-4 py-3 border-t border-[color:var(--gold)]/20">
          <button
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)] hover:text-[color:var(--gold-soft)] px-2 py-1"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-soft)]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {error ? (
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-white/40">{hint}</span>
      ) : null}
    </label>
  );
}
