import { createStore } from "zustand/vanilla";

interface TabUrlMapStoreState {
  urls: string[];
  updateTabUrl: (tabId: number, url: string) => void;
  getTabUrl: (tabId: number) => string;
}

const urlsStore = createStore<TabUrlMapStoreState>((set, get) => ({
  urls: [],
  updateTabUrl: (tabId, url) => {
    set((state) => {
      const urls = [...state.urls];
      urls[tabId] = url;
      return { urls };
    });
  },
  getTabUrl: (tabId) => {
    const urls = get().urls;
    return urls[tabId];
  },
}));

export { urlsStore };
