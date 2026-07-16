import { useEffect, useSyncExternalStore } from "react";

let openCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  return openCount > 0;
}

function getServerSnapshot() {
  return false;
}

export function useProfileViewOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Call inside a component that only mounts while a profile is being viewed. */
export function useMarkProfileOpen() {
  useEffect(() => {
    openCount += 1;
    emit();
    return () => {
      openCount -= 1;
      emit();
    };
  }, []);
}
