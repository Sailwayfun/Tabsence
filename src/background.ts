import { db } from "../firebase-config";
import { Tab } from "./components/NewTab";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";

import {
  getTabs,
  getSpaces,
  saveTabInfo,
  upDateTabBySpace,
} from "./utils/firestore";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action == "getTabs") {
    getTabs(request.query)
      .then((tabs) => sendResponse(tabs))
      .catch((error) => console.error("Error getting tabs: ", error));
  }
  if (request.action == "getSpaces") {
    getSpaces()
      .then((spaces) => sendResponse(spaces))
      .catch((error) => console.error("Error getting spaces: ", error));
  }
  return true;
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // const spaceId: string = await saveSpaceInfo();
    const tabData = await saveTabInfo(tab);
    chrome.runtime.sendMessage(
      {
        action: "tabUpdated",
        updatedTab: { ...tab, ...tabData },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      },
    );
  }
  return true;
});

chrome.runtime.onMessage.addListener(
  (
    request: {
      action: string;
      updatedTab: Tab;
      spaceId: string;
      spaceName: string;
      newSpaceTitle: string;
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
          upDateTabBySpace(request, tabDocRef)
            .then((updatedTab) => {
              sendResponse(updatedTab);
            })
            .catch((error) => {
              console.error("Error updating tab: ", error);
              sendResponse(null);
            });
        });
      });
    }
    if (request.action === "addSpace") {
      const spaceCollectionRef = collection(db, "spaces");
      const spaceId: string = doc(spaceCollectionRef).id;
      const spaceData = {
        title: request.newSpaceTitle,
        spaceId: spaceId,
      };
      setDoc(doc(spaceCollectionRef, spaceId), spaceData, {
        merge: true,
      })
        .then(() => {
          sendResponse({ id: spaceId });
        })
        .catch((error) => {
          console.error("Error adding space: ", error);
          sendResponse(null);
        });
    }
    return true;
  },
);

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
    }
    return true;
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
