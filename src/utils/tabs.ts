import { Tab } from "../types";
export function sortTabs(tabs: Tab[], tabOrder?: number[]) {
  if (!tabOrder || tabOrder.length === 0) return tabs;
  const tabMap = new Map(tabs.map((tab) => [tab.tabId, tab]));
  const sortByOrder = (index: number) => tabMap.get(tabOrder[index]);
  return tabOrder
    .map((_, index) => sortByOrder(index))
    .filter((tab): tab is Tab => tab !== undefined);
}

export function getFaviconUrl(url: string) {
  return `chrome-extension://${
    chrome.runtime.id
  }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
}
