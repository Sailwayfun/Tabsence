import { db } from "../firebase-config";
import { Tab } from "./components/NewTab";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
  DocumentReference,
  updateDoc,
  setDoc,
} from "firebase/firestore";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  async function getTabs() {
    const tabsCollection = collection(db, "tabs");
    const tabsSnapshot = await getDocs(tabsCollection);
    if (tabsSnapshot.empty) {
      return [];
    }
    const tabs = tabsSnapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return tabs;
  }
  if (request.action == "getTabs") {
    getTabs()
      .then((tabs) => sendResponse(tabs))
      .catch((error) => console.error("Error getting tabs: ", error));
    return true;
  }
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const spaceId: string = await saveSpaceInfo();
    const tabData = await saveTabInfo(tab, spaceId);
    chrome.runtime.sendMessage({
      action: "tabUpdated",
      updatedTab: { ...tab, ...tabData },
    });
    return true;
  }
});

function getFaviconUrl(url: string) {
  return `chrome-extension://${
    chrome.runtime.id
  }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
}

async function saveSpaceInfo(): Promise<string> {
  const spaceName = "Unsaved";
  const spaceCollectionRef = collection(db, "spaces");
  const spaceId = "OyUOBRt0XlFnQfG5LSdu";
  const spaceData = {
    title: spaceName,
    spaceId: spaceId,
  };
  await setDoc(doc(spaceCollectionRef, spaceId), spaceData, { merge: true });
  return spaceId;
}

async function saveTabInfo(tab: chrome.tabs.Tab, spaceId: string) {
  if (tab.url && tab.title && tab.id) {
    const tabData = {
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: getFaviconUrl(tab.url) || tab.favIconUrl || "",
      lastAccessed: serverTimestamp(),
      spaceId,
      isArchived: false,
    };
    const tabDocRef = doc(db, "tabs", tab.id.toString());
    await setDoc(tabDocRef, tabData, { merge: true });
    return tabData;
  }
}

chrome.runtime.onMessage.addListener(
  (
    request: {
      action: string;
      updatedTab: Tab;
      spaceId: string;
      spaceName: string;
    },
    _,
    sendResponse,
  ) => {
    if (request.action === "moveTab") {
      const tabsCollectionRef = collection(db, "tabs");
      const tabId = request.updatedTab.tabId;
      const q = query(tabsCollectionRef, where("tabId", "==", tabId));
      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const tabDocRef = doc.ref;
          updateSpaceOfTab(request, tabDocRef)
            .then((updatedTab) => {
              sendResponse(updatedTab);
            })
            .catch((error) => {
              console.error("Error updating tab: ", error);
              sendResponse(null);
            });
        });
      });
      return true;
    }
  },
);
async function updateSpaceOfTab(
  request: {
    action: string;
    updatedTab: Tab;
    spaceId: string;
    spaceName: string;
  },
  tabDocRef: DocumentReference<DocumentData, DocumentData>,
) {
  try {
    const spaceCollectionRef = collection(db, "spaces");
    const spaceId = doc(spaceCollectionRef).id;
    const spaceData = {
      title: request.spaceName,
      spaceId,
    };
    await addDoc(spaceCollectionRef, spaceData);
    await updateDoc(tabDocRef, { spaceId });
    const updatedTab = { ...request.updatedTab, spaceId };
    return updatedTab;
  } catch (error) {
    console.error("Error getting tabs: ", error);
  }
}

chrome.runtime.onMessage.addListener(
  (
    request: {
      action: string;
      tabId: number;
    },
    _,
    sendResponse,
  ) => {
    if (request.action === "closeTab") {
      closeTabAndRemoveFromFirestore(request.tabId)
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error("Error closing tab: ", error);
          sendResponse({ success: false });
        });
      return true;
    }
  },
);

async function closeTabAndRemoveFromFirestore(tabId: number) {
  await closeTab(tabId);
  await removeTabFromFirestore(tabId);
}

async function closeTab(tabId: number) {
  await chrome.tabs.remove(tabId);
}

async function removeTabFromFirestore(tabId: number) {
  const tabsCollectionRef = collection(db, "tabs");
  const q = query(tabsCollectionRef, where("tabId", "==", tabId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  });
}

chrome.tabs.onRemoved.addListener((tabId: number) => {
  removeTabFromFirestore(tabId);
  chrome.runtime.sendMessage({ action: "tabClosed", tabId });
  return true;
});
