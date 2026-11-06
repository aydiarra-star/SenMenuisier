"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  emptyWorkspace,
  type WorkshopWorkspace,
} from "@/lib/workshop-workspace";
import { findOsModel } from "@/lib/os-models";
import type { OsSectionId, QuoteDraft } from "./types";

const WORKSPACE_KEY = "senmenuisier-workspace-v1";
const SHELL_KEY = "senmenuisier-os-v1";

type Dimensions = { width: string; height: string; depth: string };

type ShellState = {
  theme: "light" | "dark";
  quotes: QuoteDraft[];
  favorites: string[];
};

const emptyShell: ShellState = { theme: "light", quotes: [], favorites: [] };

type OsContextValue = {
  section: OsSectionId;
  go: (section: OsSectionId) => void;
  workspace: WorkshopWorkspace;
  setWorkspace: Dispatch<SetStateAction<WorkshopWorkspace>>;
  loaded: boolean;
  notice: string;
  notify: (message: string) => void;
  clearNotice: () => void;
  quotes: QuoteDraft[];
  addQuote: (quote: QuoteDraft) => void;
  updateQuote: (id: string, patch: Partial<QuoteDraft>) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  selectedModelId: string;
  selectModel: (id: string) => void;
  dimensions: Dimensions;
  setDimension: (key: keyof Dimensions, value: string) => void;
  material: string;
  setMaterial: (value: string) => void;
  finish: string;
  setFinish: (value: string) => void;
  openExpress: () => void;
  openPasseport: (jobId?: string) => void;
  printTarget: "quote" | "label" | null;
  requestPrint: (target: "quote" | "label") => void;
  expressOpen: boolean;
  setExpressOpen: (value: boolean) => void;
  passportOpen: boolean;
  setPassportOpen: (value: boolean) => void;
  passportJob: string | null;
  setPassportJob: (value: string | null) => void;
};

const OsContext = createContext<OsContextValue | null>(null);

export function useOs(): OsContextValue {
  const value = useContext(OsContext);
  if (!value) throw new Error("useOs doit être utilisé dans OsProvider");
  return value;
}

export function OsProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<OsSectionId>("accueil");
  const [workspace, setWorkspace] = useState<WorkshopWorkspace>(emptyWorkspace);
  const [shell, setShell] = useState<ShellState>(emptyShell);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [expressOpen, setExpressOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [passportJob, setPassportJob] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<"quote" | "label" | null>(null);

  const [selectedModelId, setSelectedModelId] = useState("armoire");
  const [dimensions, setDimensions] = useState<Dimensions>({ width: "120", height: "200", depth: "60" });
  const [material, setMaterial] = useState("Chêne");
  const [finish, setFinish] = useState("Vernis mat");

  /* Lecture du stockage local : les données déjà enregistrées sont réutilisées. */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WORKSPACE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<WorkshopWorkspace>;
        setWorkspace({
          production: Array.isArray(parsed.production) ? parsed.production : [],
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
          prices: Array.isArray(parsed.prices) ? parsed.prices : [],
        });
      }
    } catch {
      setNotice("Les données locales n’ont pas pu être lues. Vérifiez le stockage de ce navigateur.");
    }
    try {
      const savedShell = window.localStorage.getItem(SHELL_KEY);
      if (savedShell) {
        const parsed = JSON.parse(savedShell) as Partial<ShellState>;
        setShell({
          theme: parsed.theme === "dark" ? "dark" : "light",
          quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        });
      }
    } catch {
      /* l'interface reste utilisable sans préférences enregistrées */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
    } catch {
      setNotice("Enregistrement local impossible : espace de stockage indisponible.");
    }
  }, [workspace, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(SHELL_KEY, JSON.stringify(shell));
    } catch {
      /* identique : l'échec est déjà signalé par le stockage de l'atelier */
    }
  }, [shell, loaded]);

  const notify = useCallback((message: string) => setNotice(message), []);
  const clearNotice = useCallback(() => setNotice(""), []);

  const selectModel = useCallback((id: string) => {
    const model = findOsModel(id);
    setSelectedModelId(model.id);
    setDimensions({ width: String(model.width), height: String(model.height), depth: String(model.depth) });
  }, []);

  const setDimension = useCallback((key: keyof Dimensions, value: string) => {
    setDimensions((current) => ({ ...current, [key]: value }));
  }, []);

  const addQuote = useCallback((quote: QuoteDraft) => {
    setShell((current) => ({ ...current, quotes: [quote, ...current.quotes] }));
  }, []);

  const updateQuote = useCallback((id: string, patch: Partial<QuoteDraft>) => {
    setShell((current) => ({
      ...current,
      quotes: current.quotes.map((quote) => (quote.id === id ? { ...quote, ...patch } : quote)),
    }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setShell((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setShell((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }));
  }, []);

  const go = useCallback((next: OsSectionId) => {
    setSection(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openPasseport = useCallback((jobId?: string) => {
    setPassportJob(jobId ?? null);
    setPassportOpen(true);
  }, []);

  /* Impression réelle : seule la cible demandée est rendue visible en CSS print. */
  const requestPrint = useCallback((target: "quote" | "label") => {
    setPrintTarget(target);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintTarget(null), 400);
    }, 60);
  }, []);

  const value = useMemo<OsContextValue>(() => ({
    section,
    go,
    workspace,
    setWorkspace,
    loaded,
    notice,
    notify,
    clearNotice,
    quotes: shell.quotes,
    addQuote,
    updateQuote,
    theme: shell.theme,
    toggleTheme,
    favorites: shell.favorites,
    toggleFavorite,
    selectedModelId,
    selectModel,
    dimensions,
    setDimension,
    material,
    setMaterial,
    finish,
    setFinish,
    openExpress: () => setExpressOpen(true),
    openPasseport,
    printTarget,
    requestPrint,
    expressOpen,
    setExpressOpen,
    passportOpen,
    setPassportOpen,
    passportJob,
    setPassportJob,
  }), [
    section, go, workspace, loaded, notice, notify, clearNotice, shell.quotes, shell.theme,
    shell.favorites, addQuote, updateQuote, toggleTheme, toggleFavorite, selectedModelId,
    selectModel, dimensions, setDimension, material, finish, openPasseport, printTarget,
    requestPrint, expressOpen, passportOpen, passportJob,
  ]);

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>;
}
