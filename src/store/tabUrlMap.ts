import { createStore } from "zustand/vanilla";

interface TabUrlMapStoreState {
  urls: Record<number, string>;
  updateTabUrl: (tabId: number, url: string) => void;
  getTabUrl: (tabId: number) => string;
}

const urlsStore = createStore<TabUrlMapStoreState>((set, get) => ({
  urls: {},
  updateTabUrl: (tabId, url) => {
    set((state) => {
      return {
        urls: {
          ...state.urls,
          [tabId]: url,
        },
      };
    });
  },
  getTabUrl: (tabId) => {
    return get().urls[tabId];
  },
}));

export { urlsStore };
