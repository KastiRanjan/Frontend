import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type DateSystem = "AD" | "BS";

interface DateSystemCtx {
  system: DateSystem;
  setSystem: (s: DateSystem) => void;
  toggle: () => void;
}

const Ctx = createContext<DateSystemCtx>({
  system: "BS",
  setSystem: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "artha.dateSystem";

/**
 * Provides the active date system (Bikram Sambat / Gregorian) to the whole
 * Time Off module. Defaults to BS for Nepali users and persists the choice.
 */
export function DateSystemProvider({ children }: { children: ReactNode }) {
  const [system, setSystemState] = useState<DateSystem>(
    () => (localStorage.getItem(STORAGE_KEY) as DateSystem) || "BS"
  );

  const setSystem = useCallback((s: DateSystem) => {
    setSystemState(s);
    localStorage.setItem(STORAGE_KEY, s);
  }, []);

  const toggle = useCallback(
    () => setSystem(system === "BS" ? "AD" : "BS"),
    [system, setSystem]
  );

  return (
    <Ctx.Provider value={{ system, setSystem, toggle }}>{children}</Ctx.Provider>
  );
}

export const useDateSystem = () => useContext(Ctx);
