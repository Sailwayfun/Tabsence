import {
  serverTimestamp,
  setDoc,
  updateDoc,
  doc,
  DocumentReference,
  DocumentData,
  arrayUnion,
} from "firebase/firestore";
import { Tab } from "../types/tab";
import { db } from "../../firebase-config";

export function sortTabs(tabs: Tab[], tabOrder?: number[]) {
  if (!tabOrder || tabOrder.length === 0) return tabs;
  const tabMap = new Map(tabs.map((tab) => [tab.tabId, tab]));
  const sortByOrder = (index: number) => tabMap.get(tabOrder[index]);
  console.log({ tabOrder });
  return tabOrder
    .map((_, index) => sortByOrder(index))
    .filter((tab): tab is Tab => tab !== undefined);
}

export function getFaviconUrl(url: string) {
  return `chrome-extension://${
    chrome.runtime.id
  }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
}

async function saveTabInfo(tab: chrome.tabs.Tab, userId?: string) {
  if (!userId) return;
  if (tab.url && tab.title && tab.id) {
    const tabData = {
      // windowId: tab.windowId,
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: getFaviconUrl(tab.url) || tab.favIconUrl || "",
      lastAccessed: serverTimestamp(),
      isPinned: false,
    };
    const newTabId = tab.id;
    const tabDocRef = doc(db, "users", userId, "tabs", tab.id.toString());
    const tabOrderDocRef = doc(db, "users", userId, "tabOrders", "global");
    await setDoc(
      tabOrderDocRef,
      { tabOrder: arrayUnion(newTabId) },
      { merge: true },
    );
    await setDoc(tabDocRef, tabData, { merge: true });
    return tabData;
  }
}

async function upDateTabBySpace(
  message: {
    action: string;
    updatedTab: Tab;
    spaceId: string;
    spaceName: string;
  },
  tabDocRef: DocumentReference<DocumentData, DocumentData>,
) {
  try {
    await updateDoc(tabDocRef, { spaceId: message.spaceId });
    const updatedTab = { ...message.updatedTab, spaceId: message.spaceId };
    return updatedTab;
  } catch (error) {
    console.error("Error updating tabs: ", error);
  }
}

export { saveTabInfo, upDateTabBySpace };
