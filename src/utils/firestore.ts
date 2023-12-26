import {
  serverTimestamp,
  setDoc,
  collection,
  doc,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { getFaviconUrl } from "./tabs";

async function saveTabInfo(tab: chrome.tabs.Tab, userId?: string) {
  if (!userId || !tab.url || !tab.title || !tab.id) return;

  const tabData = {
    windowId: tab.windowId,
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
    { tabOrder: arrayUnion(newTabId), windowId: tab.windowId },
    { merge: true },
  );
  await setDoc(tabDocRef, tabData, { merge: true });
  return tabData;
}

async function updateOldTabOrderDoc(
  userId: string,
  originalSpaceId: string,
  tabId: number,
) {
  const tabOrdersCollectionRef = collection(db, "users", userId, "tabOrders");
  const spaceId = originalSpaceId || "global";
  const oldTabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
  await updateDoc(oldTabOrderDocRef, { tabOrder: arrayRemove(tabId) });
}

async function updateNewTabOrderDoc(
  userId: string,
  spaceId: string,
  tabId: number,
  windowId: number,
) {
  const tabOrdersCollectionRef = collection(db, "users", userId, "tabOrders");
  const newTabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
  await setDoc(
    newTabOrderDocRef,
    { tabOrder: arrayUnion(tabId), windowId },
    { merge: true },
  );
}

async function updateSpaceOfTab(
  tabId: number,
  spaceId: string,
  userId: string,
) {
  const tabDocRef = doc(db, "users", userId, "tabs", tabId.toString());
  try {
    await updateDoc(tabDocRef, { spaceId });
  } catch (error) {
    console.error(error);
  }
}

export {
  saveTabInfo,
  updateOldTabOrderDoc,
  updateNewTabOrderDoc,
  updateSpaceOfTab,
};
