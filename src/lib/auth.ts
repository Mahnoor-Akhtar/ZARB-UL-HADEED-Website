import { useSyncExternalStore } from "react";
import personnel from "@/data/personnel.json";

export type AuthUser = {
  armyNo: string;
  name: string;
  rank: string;
  username: string;
  role: "SUPER ADMIN" | "ADMIN" | "USER";
};

const SLOTS_KEY = "cmd-group-slots-v1";
const SESSION_KEY = "zuh.authUser";

type Slot = {
  slot: number;
  role: "SUPER ADMIN" | "ADMIN" | "USER";
  personId: number | null;
  username: string;
  password: string;
};

type Person = { id: number; armyNo: string; name: string; rank: string };

const DEFAULT_SUPER_ADMIN = {
  username: "Haris",
  password: "123456",
} as const;

let cachedSessionRaw: string | null | undefined;
let cachedSessionValue: AuthUser | null = null;

function loadSlots(): Slot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Slot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Validate credentials against Command Group assigned username/password. */
export function login(username: string, password: string): AuthUser | null {
  const u = username.trim();
  if (!u || !password) return null;

  if (u.toLowerCase() === DEFAULT_SUPER_ADMIN.username.toLowerCase() && password === DEFAULT_SUPER_ADMIN.password) {
    const user: AuthUser = {
      armyNo: "SUPER-001",
      name: "Haris",
      rank: "Super Admin",
      username: DEFAULT_SUPER_ADMIN.username,
      role: "SUPER ADMIN",
    };
    try {
      const serialized = JSON.stringify(user);
      localStorage.setItem(SESSION_KEY, serialized);
      cachedSessionRaw = serialized;
      cachedSessionValue = user;
      if (typeof window !== "undefined") window.dispatchEvent(new Event("zuh:auth"));
    } catch {}
    return user;
  }

  const slot = loadSlots().find(
    (s) => s.personId !== null && s.username && s.username.toLowerCase() === u.toLowerCase() && s.password === password,
  );
  if (!slot || slot.personId === null) return null;

  const list = personnel as Person[];
  const person = list.find((p) => p.id === slot.personId);
  if (!person) return null;

  const user: AuthUser = {
    armyNo: person.armyNo,
    name: person.name,
    rank: person.rank,
    username: slot.username,
    role: slot.role,
  };
  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem(SESSION_KEY, serialized);
    cachedSessionRaw = serialized;
    cachedSessionValue = user;
    if (typeof window !== "undefined") window.dispatchEvent(new Event("zuh:auth"));
  } catch {}
  return user;
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      cachedSessionRaw = null;
      cachedSessionValue = null;
      return null;
    }
    if (raw === cachedSessionRaw) return cachedSessionValue;
    cachedSessionRaw = raw;
    cachedSessionValue = JSON.parse(raw) as AuthUser;
    return cachedSessionValue;
  } catch {
    cachedSessionRaw = null;
    cachedSessionValue = null;
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  cachedSessionRaw = null;
  cachedSessionValue = null;
  window.dispatchEvent(new Event("zuh:auth"));
}

const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => { if (e.key === SESSION_KEY) cb(); };
  const onCustom = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("zuh:auth", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zuh:auth", onCustom);
  };
};

export function useSession(): AuthUser | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}

/** True when the current user has read-only access (role === "USER"). */
export function useIsReadOnly(): boolean {
  const s = useSession();
  return s?.role === "USER";
}
