import type { Tab } from "./types/tab";
import { urlsStore } from "./store/tabUrlMap";
import { firebaseService } from "./utils/firebaseService";
import { trackTabTime } from "./utils/trackTime";
import { updateUrlDuration } from "./utils/trackTime";

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
      const { userId, newSpaceTitle } = message;
      try {
        await firebaseService.addSpace(userId, newSpaceTitle);
        sendResponse({ success: true });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
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

function getTabOrderIds(newTabs: Tab[]) {
  return newTabs.reduce((acc: number[], tab: Tab) => {
    if (tab.tabId) {
      acc.push(tab.tabId);
    }
    return acc;
  }, [] as number[]);
}

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (!message.userId || !message.windowId) return;
    switch (message.action) {
      case "updateTabOrder":
        {
          try {
            const { userId, newTabs } = message;
            const spaceId = message.spaceId || "global";
            const windowId = message.newTabs[0].windowId;
            const newTabOrderData = getTabOrderIds(newTabs);
            await firebaseService.updateTabOrder(
              userId,
              spaceId,
              newTabOrderData,
              windowId,
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
  await firebaseService.deleteDoc(["users", userId, "tabs", tabId.toString()]);
}

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  // console.log("tab onRemoved handler triggered");
  const closedTabUrl: string = urlsStore.getState().getTabUrl(tabId);
  const userId = await getUserId();
  await removeTabFromFirestore(tabId, userId);
  await updateUrlDuration(closedTabUrl);
  await chrome.runtime.sendMessage({ action: "tabClosed", tabId });
  return true;
});

export async function getUserId() {
  const result: { [key: string]: string | undefined } =
    await chrome.storage.local.get("userId");
  const userId = result.userId;
  if (!userId) {
    const docId = firebaseService.getDocId(["users"]);
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
    if (message.action === "toggleTabPin" && message.tabId) {
      try {
        const userId = await getUserId();
        const tab = await chrome.tabs.update(message.tabId, {
          pinned: !message.isPinned,
        });
        if (!tab) throw new Error("tab not found");
        const { spaceId, tabId, isPinned, newTabs } = message;
        const newTabOrder = getTabOrderIds(newTabs);
        await firebaseService.pinTab(
          userId,
          spaceId,
          tabId,
          newTabOrder,
          isPinned,
        );
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
    const userId = await getUserId();
    if (message.action === "archiveSpace" && message.spaceId) {
      await firebaseService.archiveSpace(userId, message.spaceId);
      sendResponse({ success: true });
    }
    if (message.action === "restoreSpace" && message.spaceId) {
      await firebaseService.restoreSpace(userId, message.spaceId);
      sendResponse({ success: true });
    }
    return true;
  },
);

async function closeDeletedTabs(deletedSpaceIds?: number[]) {
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
  const deletedTabIds = await firebaseService.removeSpace(
    message.spaceId,
    message.userId,
  );
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

      const { userId, spaceId, newSpaceTitle } = message;
      await firebaseService.updateSpaceTitle(userId, spaceId, newSpaceTitle);
      sendResponse({ success: true });
    }
    return true;
  },
);

chrome.windows.onCreated.addListener(async (window) => {
  const userId = await getUserId();
  if (!window.id) return;
  try {
    await firebaseService.initializeTabOrder(window.id, userId);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
  return true;
});
