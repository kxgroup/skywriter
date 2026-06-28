import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AirlineProfile, Generation } from "../types";

export function blankProfile(): AirlineProfile {
  return {
    id: crypto.randomUUID(),
    name: "New Airline",
    icao: "",
    vibe: "Professional",
    hubs: "",
    fleet: "",
    destinations: "",
    livery: null,
    logo: null,
    allianceName: "",
    allianceLogo: null,
    cabinColors: "",
    cabinDescription: "",
  };
}

interface AppState {
  // profiles
  profiles: AirlineProfile[];
  activeProfileId: string | null;
  activeProfile: AirlineProfile | null;
  setActiveProfileId: (id: string) => void;
  addProfile: () => void;
  updateProfile: (id: string, patch: Partial<AirlineProfile>) => void;
  deleteProfile: (id: string) => void;
  replaceAllProfiles: (profiles: AirlineProfile[]) => void;
  importProfiles: (profiles: AirlineProfile[]) => void;

  // generations / timeline
  generations: Generation[];
  addGeneration: (g: Generation) => void;
  deleteGeneration: (id: string) => void;

  // context chaining
  activeChainId: string | null;
  setActiveChainId: (id: string | null) => void;

  // dirty / save reminder
  dirty: boolean;
  markSaved: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<AirlineProfile[]>(() => [blankProfile()]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    () => null
  );
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // default the active profile to the first one
  const resolvedActiveId = activeProfileId ?? profiles[0]?.id ?? null;
  const activeProfile =
    profiles.find((p) => p.id === resolvedActiveId) ?? null;

  const addProfile = useCallback(() => {
    const p = blankProfile();
    setProfiles((prev) => [...prev, p]);
    setActiveProfileId(p.id);
    setDirty(true);
  }, []);

  const updateProfile = useCallback(
    (id: string, patch: Partial<AirlineProfile>) => {
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      setDirty(true);
    },
    []
  );

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length ? next : [blankProfile()];
    });
    setActiveProfileId(null);
    setDirty(true);
  }, []);

  const replaceAllProfiles = useCallback((next: AirlineProfile[]) => {
    setProfiles(next.length ? next : [blankProfile()]);
    setActiveProfileId(next[0]?.id ?? null);
    setDirty(true);
  }, []);

  const importProfiles = useCallback((incoming: AirlineProfile[]) => {
    setProfiles((prev) => [...prev, ...incoming]);
    if (incoming[0]) setActiveProfileId(incoming[0].id);
    setDirty(true);
  }, []);

  const addGeneration = useCallback((g: Generation) => {
    setGenerations((prev) => [g, ...prev]);
    setDirty(true);
  }, []);

  const deleteGeneration = useCallback((id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      profiles,
      activeProfileId: resolvedActiveId,
      activeProfile,
      setActiveProfileId,
      addProfile,
      updateProfile,
      deleteProfile,
      replaceAllProfiles,
      importProfiles,
      generations,
      addGeneration,
      deleteGeneration,
      activeChainId,
      setActiveChainId,
      dirty,
      markSaved: () => setDirty(false),
    }),
    [
      profiles,
      resolvedActiveId,
      activeProfile,
      addProfile,
      updateProfile,
      deleteProfile,
      replaceAllProfiles,
      importProfiles,
      generations,
      addGeneration,
      deleteGeneration,
      activeChainId,
      dirty,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
