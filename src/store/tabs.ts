import { create } from "zustand";
import { Tab, Direction } from "../types";

interface TabStoreState {
  tabs: Tab[];
  tabOrder: number[];
  hideArchivedTabs: (archivedSpaces: string[]) => void;
  sortTabsByTabOrder: (tabsFromFirestore: Tab[]) => void;
  closeTab: (tabId: number) => void;
  updateTab: (tab: Tab) => void;
  moveTabToSpace: (tab: Tab) => void;
  removeTabsFromSpace: (spaceId: string) => void;
  moveTabOrder: (tabId: number, direction: Direction) => void;
  sortTabsByPin: (tabId: number) => void;
  setTabOrder: (tabOrderFromFirestore: number[]) => void;
}

function sortTabs(tabs: Tab[], tabOrder?: number[]) {
  if (!tabOrder || tabOrder.length === 0) return tabs;
  const tabMap = new Map(tabs.map((tab) => [tab.tabId, tab]));
  const sortByOrder = (index: number) => tabMap.get(tabOrder[index]);
  return tabOrder
    .map((_, index) => sortByOrder(index))
    .filter((tab): tab is Tab => tab !== undefined);
}

function sortTabsByPin(tabs: Tab[], tabId?: number) {
  const newTabs = tabs.map((tab) => {
    if (tabId && tab.tabId === tabId) {
      return {
        ...tab,
        isPinned: !tab.isPinned,
      };
    }
    return tab;
  });
  return newTabs.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
}

const useTabStore = create<TabStoreState>((set) => ({
  tabs: [],
  tabOrder: [],
  hideArchivedTabs: (archivedSpaces) =>
    set((state) => ({
      tabs: state.tabs.filter((tab) =>
        archivedSpaces.every((spaceId) => spaceId !== tab.spaceId),
      ),
    })),
  sortTabsByTabOrder: (tabs) =>
    set((state) => ({
      tabs: sortTabs(tabs, state.tabOrder),
    })),
  closeTab: (tabId) =>
    set((state) => ({
      tabs: state.tabs.filter((tab) => tab.tabId !== tabId),
    })),
  updateTab: (tab) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.tabId === tab.tabId ? tab : t)),
    })),
  moveTabToSpace: (tab) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.tabId !== tab.tabId),
    })),
  removeTabsFromSpace: (spaceId) =>
    set((state) => ({
      tabs: state.tabs.filter((tab) => tab.spaceId !== spaceId),
    })),
  moveTabOrder: (tabId, direction) =>
    set((state) => {
      const movedTab = state.tabs.find((tab) => tab.tabId === tabId);
      if (!movedTab) return state;
      const movedTabIndex = state.tabs.indexOf(movedTab);
      const newTabs = [...state.tabs];
      newTabs.splice(movedTabIndex, 1);
      newTabs.splice(
        movedTabIndex + (direction === "up" || direction === "left" ? -1 : 1),
        0,
        movedTab,
      );
      return { ...state, tabs: newTabs };
    }),
  sortTabsByPin: (tabId) =>
    set((state) => ({
      tabs: sortTabsByPin([...state.tabs], tabId),
    })),
  setTabOrder: (tabOrder) => set({ tabOrder }),
}));

export { useTabStore };
