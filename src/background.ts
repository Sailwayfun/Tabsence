import { db } from "../firebase-config";
import { Tab } from "./types/tab";
import {
  collection,
  doc,
  // getDocs,
  deleteDoc,
  updateDoc,
  // query,
  // where,
  setDoc,
  // QuerySnapshot,
  // DocumentData,
  serverTimestamp,
} from "firebase/firestore";

import { urlsStore } from "./store/tabUrlMap";

import { firebaseService, trackTabTime, updateTabDuration } from "./utils";

interface RuntimeMessage {
  action: string;
  currentPath: string;
  updatedTab: Tab;
  originalSpaceId: string;
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
    trackTabTime(changeInfo.url);
    return true;
  }
  if (changeInfo.status === "complete" && tab.title !== "Tabsence") {
    if (tab.url?.includes("newtab")) return true;
    const userId = await chrome.storage.local
      .get("userId")
      .then((res) => res.userId);
    const tabData = await firebaseService.saveNewTabToFirestore(tab, userId);
    try {
      const response = await chrome.runtime.sendMessage({
        action: "tabUpdated",
        updatedTab: { ...tab, ...tabData },
      });
      if (!response.success) throw new Error("Failed to update tabs state");
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }
  return true;
});

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "signIn" || !message.userId) return;
    if (message.action === "moveTabToSpace") {
      const { tabId, windowId } = message.updatedTab;
      if (!tabId) return sendResponse({ success: false });
      const { userId, originalSpaceId, spaceId } = message;
      await firebaseService.moveTabToSpace(
        userId,
        originalSpaceId,
        spaceId,
        tabId,
        windowId,
      );

      sendResponse({ success: true });
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
      try {
        await setDoc(doc(spaceCollectionRef, spaceId), spaceData, {
          merge: true,
        });
        sendResponse({ success: true });
      } catch (error) {
        console.error("Error adding space: ", error);
        sendResponse({ success: false });
      }
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
      return;
    }
    throw new Error("Failed to close or delete the tab from Firestore.");
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
  await removeTabFromFirestore(tabId, userId);
}

async function closeTab(tabId: number) {
  await chrome.tabs.remove(tabId);
}

async function removeTabFromFirestore(tabId: number, userId: string) {
  const tabDocRef = doc(db, "users", userId, "tabs", tabId.toString());
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
  chrome.runtime.sendMessage({ action: "tabClosed", tabId });
  return true;
});

async function getUserId() {
  const result: { [key: string]: string | undefined } =
    await chrome.storage.local.get("userId");
  const userId = result.userId;
  if (!userId) {
    const userCollectionRef = collection(db, "users");
    const docId: string = doc(userCollectionRef).id;
    return docId;
  }
  return userId;
}

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.action === "signIn") {
      const userId = await getUserId();
      await chrome.storage.local.set({ userId });
      sendResponse({ success: true, userId });
    }
    return true;
  },
);

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    const result = await chrome.storage.local.get("userId");
    if (!result.userId) return sendResponse({ success: false });
    if (message.action === "toggleTabPin" && message.tabId) {
      try {
        const tab = await chrome.tabs.update(message.tabId, {
          pinned: !message.isPinned,
        });
        if (!tab) throw new Error("tab not found");

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

        await setDoc(
          tabOrderDocRef,
          { tabOrder: newTabOrder },
          { merge: true },
        );

        await updateDoc(tabDocRef, { isPinned: !message.isPinned });

        sendResponse({ success: true });
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
          sendResponse({ success: false });
        }
      }
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

// async function deleteSpaceDoc(spaceId: string, userId: string) {
//   try {
//     const spaceDocRef = doc(db, "users", userId, "spaces", spaceId);
//     await deleteDoc(spaceDocRef);
//   } catch (err) {
//     return { success: false };
//   }
// }

// async function deleteTabOrderDoc(spaceId: string, userId: string) {
//   try {
//     const tabOrderDocRef = doc(db, "users", userId, "tabOrders", spaceId);
//     await deleteDoc(tabOrderDocRef);
//   } catch (err) {
//     return { success: false };
//   }
// }

// async function deleteTabDocsOfSpace(spaceId: string, userId: string) {
//   try {
//     const tabCollectionRef = collection(db, "users", userId, "tabs");
//     const tabQuery = query(tabCollectionRef, where("spaceId", "==", spaceId));
//     const deletedTabsSnapshot = await getDocs(tabQuery);
//     if (deletedTabsSnapshot.empty) {
//       return;
//     }
//     await closeDeletedTabs(deletedTabsSnapshot);
//     await Promise.all(
//       deletedTabsSnapshot.docs.map((doc) => deleteDoc(doc.ref)),
//     );
//   } catch (err) {
//     return { success: false };
//   }
// }

async function closeDeletedTabs(
  // deletedTabsSnapshot: QuerySnapshot<DocumentData, DocumentData>,
  deletedSpaceIds?: number[],
) {
  try {
    if (!deletedSpaceIds) return;
    await Promise.all(deletedSpaceIds.map((id) => chrome.tabs.remove(id)));
  } catch (err) {
    return { success: false };
  }
}

async function handleRemoveSpace(message: RuntimeMessage) {
  if (!message.userId || !message.spaceId) {
    return { success: false };
  }
  // await deleteSpaceDoc(message.spaceId, message.userId);
  // await deleteTabOrderDoc(message.spaceId, message.userId);
  const deletedTabIds = await firebaseService.removeSpace(
    message.spaceId,
    message.userId,
  );
  // await deleteTabDocsOfSpace(message.spaceId, message.userId);
  await closeDeletedTabs(deletedTabIds);
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
