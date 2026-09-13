import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export interface ProviderConfig {
  id: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface AppSettings {
  providers: ProviderConfig[];
  activeProvider: string;
  theme: "dark" | "light";
}

interface SettingsState extends AppSettings {
  load: () => Promise<void>;
  save: () => Promise<void>;
  setActiveProvider: (id: string) => void;
  updateProvider: (id: ProviderConfig["id"], patch: Partial<ProviderConfig>) => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  providers: [
    { id: "openai", apiKey: "", model: "gpt-4o", enabled: false },
    { id: "anthropic", apiKey: "", model: "claude-sonnet-4-20250514", enabled: false },
    { id: "gemini", apiKey: "", model: "gemini-2.5-pro", enabled: false },
  ],
  activeProvider: "openai",
  theme: "dark",

  load: async () => {
    try {
      const raw = await SecureStore.getItemAsync("sonderr-settings");
      if (raw) {
        const parsed = JSON.parse(raw) as AppSettings;
        set(parsed);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  },

  save: async () => {
    try {
      const { providers, activeProvider, theme } = get();
      await SecureStore.setItemAsync("sonderr-settings", JSON.stringify({ providers, activeProvider, theme }));
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  },

  setActiveProvider: (id) => set({ activeProvider: id }),
  updateProvider: (id, patch) =>
    set((state) => ({
      providers: state.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  setTheme: (theme) => set({ theme }),
}));
