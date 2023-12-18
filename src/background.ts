import { db } from "../firebase-config";
import { Tab } from "./types/tab";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  setDoc,
  getDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

import { urlsStore } from "./store/tabUrlMap";

import { saveTabInfo, upDateTabBySpace } from "./utils/firestore";

import { tabTimes, trackTabTime, updateTabDuration } from "./utils/trackTime";

interface RuntimeMessage {
  action: string;
  currentPath: string;
  updatedTab: Tab;
  spaceId: string;
  spaceName: string;
  newSpaceTitle: string;
  tabId: number;
  newTabs: Tab[];
  userId?: string;
  isPinned: boolean;
  windowId: number;
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    urlsStore.getState().updateTabUrl(tabId, changeInfo.url);
    const tabTimeTracked = trackTabTime(changeInfo.url);
    console.log(1, "tracktabtime", tabTimeTracked);
    return true;
  }
  if (changeInfo.status === "complete" && tab.title !== "Tabsence") {
    if (tab.url?.includes("newtab")) return true;
    const userId = await chrome.storage.local
      .get("userId")
      .then((res) => res.userId);
    const tabData = await saveTabInfo(tab, userId);
    console.log("tabinfo saved", tabData);
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
  async (message: RuntimeMessage, _, sendResponse) => {
    if (!message.userId) return true;
    if (message.action === "moveTabToSpace") {
      const tabOrdersCollectionRef = collection(
        db,
        "users",
        message.userId,
        "tabOrders",
      );
      const tabOrderDocRef = doc(tabOrdersCollectionRef, message.spaceId);
      const tabsCollectionRef = collection(db, "users", message.userId, "tabs");
      const tabId = message.updatedTab.tabId;
      await setDoc(
        tabOrderDocRef,
        { tabOrder: arrayUnion(tabId) },
        { merge: true },
      );
      const q = query(tabsCollectionRef, where("tabId", "==", tabId));
      const tabsQuerySnapshot = await getDocs(q);
      tabsQuerySnapshot.forEach((doc) => {
        const tabDocRef = doc.ref;
        upDateTabBySpace(message, tabDocRef)
          .then((updatedTab) => {
            sendResponse(updatedTab);
          })
          .catch((error) => {
            console.error("Error updating tab: ", error);
            sendResponse(null);
          });
      });
      return true;
    }
    if (message.action === "addSpace") {
      const spaceCollectionRef = collection(
        db,
        "users",
        message.userId,
        "spaces",
      );
      const spaceId: string = doc(spaceCollectionRef).id;
      const spaceData = {
        title: message.newSpaceTitle,
        spaceId: spaceId,
        createdAt: serverTimestamp(),
        isArchived: false,
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
      return true;
    }
    return true;
  },
);

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "closeTab" && message.userId) {
      closeTabAndRemoveFromFirestore(message.tabId, message.userId)
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
  async (message: RuntimeMessage, _, sendResponse) => {
    if (!message.userId || !message.windowId) return;
    switch (message.action) {
      case "updateTabOrder":
        {
          try {
            const tabOrdersCollectionRef = collection(
              db,
              "users",
              message.userId,
              "tabOrders",
            );
            const spaceId = message.spaceId || "global";
            const tabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
            const newTabOrderData = message.newTabs
              .map((tab) => tab.tabId)
              .filter(Boolean);
            await setDoc(
              tabOrderDocRef,
              {
                tabOrder: newTabOrderData,
                windowId: message.newTabs[0].windowId,
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

async function closeTabAndRemoveFromFirestore(tabId: number, userId?: string) {
  if (!userId) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab) {
      await closeTab(tabId);
    }
  } catch (error) {
    console.log(`Tab with id ${tabId} does not exist in the current window.`);
  }
  await removeTabFromFirestore(tabId, userId);
}

async function closeTab(tabId: number) {
  await chrome.tabs.remove(tabId);
}

async function removeTabFromFirestore(tabId: number, userId: string) {
  const tabDocRef = doc(db, "users", userId, "tabs", tabId.toString());
  console.log("removeTabFromFirestore", tabDocRef);
  await deleteDoc(tabDocRef);
}

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  const closedTabUrl: string = urlsStore.getState().getTabUrl(tabId);
  const userId: string | undefined = await chrome.storage.local
    .get("userId")
    .then((res) => res.userId);
  if (!userId) return;
  await removeTabFromFirestore(tabId, userId);
  await updateTabDuration(closedTabUrl);
  console.log(3, "updateTabDuration", tabTimes);
  chrome.runtime.sendMessage({ action: "tabClosed", tabId });
  return true;
});

async function getUserId() {
  const result: { [key: string]: string | undefined } =
    await chrome.storage.local.get("userId");
  const userId = result.userId;
  if (!userId) {
    const userCollectionRef = collection(db, "users");
    const userId: string = doc(userCollectionRef).id;
    return userId;
  }
  return userId;
}

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "signIn") {
      const userId = await getUserId();
      await chrome.storage.local.set({ userId });
      sendResponse({ success: true, userId });
      return true;
    }
  },
);

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    const result = await chrome.storage.local.get("userId");
    if (!result.userId) return;
    if (message.action === "toggleTabPin" && message.tabId) {
      await chrome.tabs.update(message.tabId, { pinned: !message.isPinned });
      const tabDocRef = doc(
        db,
        "users",
        result.userId,
        "tabs",
        message.tabId.toString(),
      );
      const tabOrderDocRef = doc(
        db,
        "users",
        result.userId,
        "tabOrders",
        message.spaceId,
      );
      const newTabOrder = message.newTabs
        .map((tab) => tab.tabId)
        .filter(Boolean);
      await setDoc(tabOrderDocRef, { tabOrder: newTabOrder }, { merge: true });
      await updateDoc(tabDocRef, { isPinned: !message.isPinned });
      sendResponse({ success: true });
    }
    return true;
  },
);

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    const result = await chrome.storage.local.get("userId");
    if (!result.userId) return sendResponse({ success: false });
    if (message.action === "archiveSpace" && message.spaceId) {
      const spaceDocRef = doc(
        db,
        "users",
        result.userId,
        "spaces",
        message.spaceId,
      );
      await updateDoc(spaceDocRef, { isArchived: true });
      sendResponse({ success: true });
    }
    if (message.action === "restoreSpace" && message.spaceId) {
      const spaceDocRef = doc(
        db,
        "users",
        result.userId,
        "spaces",
        message.spaceId,
      );
      await updateDoc(spaceDocRef, { isArchived: false });
      sendResponse({ success: true });
    }
    return true;
  },
);

async function handleRemoveSpace(message: RuntimeMessage) {
  if (!message.userId || !message.spaceId) {
    return { success: false };
  }

  const spaceDocRef = doc(
    db,
    "users",
    message.userId,
    "spaces",
    message.spaceId,
  );
  const tabCollectionRef = collection(db, "users", message.userId, "tabs");

  await deleteDoc(spaceDocRef);

  const tabQuery = query(
    tabCollectionRef,
    where("spaceId", "==", message.spaceId),
  );

  const tabOrderDocRef = doc(
    db,
    "users",
    message.userId,
    "tabOrders",
    message.spaceId,
  );
  const tabOrderSnapshot = await getDoc(tabOrderDocRef);
  if (!tabOrderSnapshot.exists()) {
    return { success: false };
  }
  await deleteDoc(tabOrderSnapshot.ref);

  const deletedTabsSnapshot = await getDocs(tabQuery);
  if (deletedTabsSnapshot.empty) {
    return { success: false };
  }
  await Promise.all(deletedTabsSnapshot.docs.map((doc) => deleteDoc(doc.ref)));
  await chrome.tabs.remove(
    deletedTabsSnapshot.docs.map((doc) => doc.data().tabId),
  );
  return { success: true };
}

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "removeSpace") {
      const result = await handleRemoveSpace(message);
      sendResponse(result);
    }
    return true;
  },
);

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "updateSpaceTitle") {
      if (!message.userId || !message.spaceId || !message.newSpaceTitle) return;
      const spaceDocRef = doc(
        db,
        "users",
        message.userId,
        "spaces",
        message.spaceId,
      );
      await updateDoc(spaceDocRef, { title: message.newSpaceTitle });
      sendResponse({ success: true });
    }
    return true;
  },
);

chrome.windows.onCreated.addListener(async (window) => {
  const userId = await chrome.storage.local
    .get("userId")
    .then((res) => res.userId);
  if (!userId) return;
  const tabOrdersCollectionRef = collection(db, "users", userId, "tabOrders");
  const tabOrderDocRef = doc(tabOrdersCollectionRef, "global");
  await setDoc(
    tabOrderDocRef,
    {
      tabOrder: [],
      windowId: window.id,
    },
    { merge: true },
  );
  return true;
});
