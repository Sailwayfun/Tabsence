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
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

import {
  getTabs,
  getSpaces,
  saveTabInfo,
  upDateTabBySpace,
} from "./utils/firestore";

interface RuntimeMessage {
  action: string;
  currentPath: string;
  updatedTab: Tab;
  spaceId: string;
  spaceName: string;
  newSpaceTitle: string;
  tabId: number;
  newTabs: Tab[];
  payload: string;
}

chrome.runtime.onMessage.addListener(
  (request: RuntimeMessage, _, sendResponse) => {
    if (request.action == "getTabs") {
      getTabs(request.currentPath)
        .then((tabs) => sendResponse(tabs))
        .catch((error) => console.error("Error getting tabs: ", error));
    }
    if (request.action == "getSpaces") {
      getSpaces()
        .then((spaces) => sendResponse(spaces))
        .catch((error) => console.error("Error getting spaces: ", error));
    }
    return true;
  },
);

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
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
  async (request: RuntimeMessage, _, sendResponse) => {
    if (request.action === "moveTabToSpace") {
      const tabOrdersCollectionRef = collection(db, "tabOrders");
      const tabOrderDocRef = doc(tabOrdersCollectionRef, request.spaceId);
      const tabsCollectionRef = collection(db, "tabs");
      const tabId = request.updatedTab.tabId;
      await setDoc(
        tabOrderDocRef,
        { tabOrder: arrayUnion(tabId) },
        { merge: true },
      );
      const q = query(tabsCollectionRef, where("tabId", "==", tabId));
      const tabsQuerySnapshot = await getDocs(q);
      tabsQuerySnapshot.forEach((doc) => {
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
    }
    if (request.action === "addSpace") {
      const spaceCollectionRef = collection(db, "spaces");
      const spaceId: string = doc(spaceCollectionRef).id;
      const spaceData = {
        title: request.newSpaceTitle,
        spaceId: spaceId,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(spaceCollectionRef, spaceId), spaceData, {
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
  (request: RuntimeMessage, _, sendResponse) => {
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

chrome.runtime.onMessage.addListener(
  async (request: RuntimeMessage, _, sendResponse) => {
    switch (request.action) {
      case "updateTabOrder":
        {
          try {
            const tabOrdersCollectionRef = collection(db, "tabOrders");
            const spaceId = request.spaceId || "global";
            const tabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
            const newTabOrderData = request.newTabs
              .map((tab) => tab.tabId)
              .filter(Boolean);
            await setDoc(
              tabOrderDocRef,
              {
                tabOrder: newTabOrderData,
              },
              { merge: true },
            );
            sendResponse({ success: true });
          } catch (error) {
            console.error("Error updating tab order: ", error);
            sendResponse({ success: false });
          }
        }
        break;
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

//TODO: 從背景腳本取得auth token
let authToken = "";
chrome.runtime.onMessage.addListener(
  (request: RuntimeMessage, _, sendResponse) => {
    if (request.action === "signIn") {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (!token) sendResponse({ success: false });
        if (token) authToken = token;
        sendResponse({ success: true, token: authToken });
      });
      return true;
    }
    if (request.action === "signOut") {
      chrome.identity.removeCachedAuthToken({ token: authToken }, () => {
        authToken = "";
        sendResponse({ success: true });
      });
      return true;
    }
  },
);
