export interface Tab extends chrome.tabs.Tab {
  spaceId?: string;
  tabId: number | undefined;
  isPinned: boolean;
}
export interface TabOrder {
  tabOrder: number[];
  windowId: number;
}
