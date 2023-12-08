import { db } from "../firebase-config";
import { Tab } from "./components/NewTab";
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

import {
  getTabs,
  getSpaces,
  saveTabInfo,
  upDateTabBySpace,
} from "./utils/firestore";

import { trackTabTime, updateTabDuration } from "./utils/trackTime";

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
  userId?: string;
  isPinned: boolean;
}

chrome.runtime.onMessage.addListener(
  (request: RuntimeMessage, _, sendResponse) => {
    if (request.action == "getTabs" && request.userId) {
      getTabs(request.currentPath, request.userId)
        .then((tabs) => sendResponse(tabs))
        .catch((error) => console.error("Error getting tabs: ", error));
    }
    if (request.action == "getSpaces" && request.userId) {
      getSpaces(request.userId)
        .then((spaces) => sendResponse(spaces))
        .catch((error) => console.error("Error getting spaces: ", error));
    }
    return true;
  },
);

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  if (changeInfo.url) {
    const tabDurationUpdated = await updateTabDuration(tab.id);
    console.log(1, "updateTabDuration", tabDurationUpdated);
    const tabTimeTracked = trackTabTime(changeInfo.url, tab.id);
    console.log(2, "tracktabtime", tabTimeTracked);
    return true;
  }
  if (changeInfo.status === "complete" && tab.title !== "Tabsence") {
    const userId = await chrome.storage.local
      .get("userId")
      .then((res) => res.userId);
    const tabData = await saveTabInfo(tab, userId);
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
    if (!request.userId) return true;
    if (request.action === "moveTabToSpace") {
      const tabOrdersCollectionRef = collection(
        db,
        "users",
        request.userId,
        "tabOrders",
      );
      const tabOrderDocRef = doc(tabOrdersCollectionRef, request.spaceId);
      const tabsCollectionRef = collection(db, "users", request.userId, "tabs");
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
      return true;
    }
    if (request.action === "addSpace") {
      const spaceCollectionRef = collection(
        db,
        "users",
        request.userId,
        "spaces",
      );
      const spaceId: string = doc(spaceCollectionRef).id;
      const spaceData = {
        title: request.newSpaceTitle,
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
  (request: RuntimeMessage, _, sendResponse) => {
    if (request.action === "closeTab" && request.userId) {
      closeTabAndRemoveFromFirestore(request.tabId, request.userId)
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
    if (!request.userId) return;
    switch (request.action) {
      case "updateTabOrder":
        {
          try {
            const tabOrdersCollectionRef = collection(
              db,
              "users",
              request.userId,
              "tabOrders",
            );
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

async function closeTabAndRemoveFromFirestore(tabId: number, userId?: string) {
  if (!userId) return;
  await closeTab(tabId);
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
  const userId: string | undefined = await chrome.storage.local
    .get("userId")
    .then((res) => res.userId);
  if (!userId) return;
  await removeTabFromFirestore(tabId, userId);
  const tabDurationUpdated = await updateTabDuration(tabId);
  console.log(3, "updateTabDuration", tabDurationUpdated);
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

//TODO:從擴充中將使用者登出
let authToken = "";
chrome.runtime.onMessage.addListener(
  async (request: RuntimeMessage, _, sendResponse) => {
    if (request.action === "signIn") {
      const userId = await getUserId();
      await chrome.storage.local.set({ userId });
      sendResponse({ success: true, userId });
      // chrome.identity.getAuthToken({ interactive: true }, (token) => {
      //   if (!token) sendResponse({ success: false });
      //   if (token) authToken = token;
      //   chrome.identity.getProfileUserInfo(async (userInfo) => {
      //     if (!userInfo) return;
      //     const usersCollectionRef = collection(db, "users");
      //     const userDocRef = doc(usersCollectionRef, userInfo.id);
      //     await setDoc(userDocRef, { email: userInfo.email }, { merge: true });
      //     sendResponse({
      //       success: true,
      //       token: authToken,
      //       userId: userInfo.id,
      //     });
      //   });
      // });
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

chrome.runtime.onMessage.addListener(
  async (request: RuntimeMessage, _, sendResponse) => {
    const result = await chrome.storage.local.get("userId");
    if (!result.userId) return;
    if (request.action === "toggleTabPin" && request.tabId) {
      await chrome.tabs.update(request.tabId, { pinned: !request.isPinned });
      const tabDocRef = doc(
        db,
        "users",
        result.userId,
        "tabs",
        request.tabId.toString(),
      );
      const tabOrderDocRef = doc(
        db,
        "users",
        result.userId,
        "tabOrders",
        request.spaceId,
      );
      const newTabOrder = request.newTabs
        .map((tab) => tab.tabId)
        .filter(Boolean);
      await setDoc(tabOrderDocRef, { tabOrder: newTabOrder }, { merge: true });
      await updateDoc(tabDocRef, { isPinned: !request.isPinned });
      sendResponse({ success: true });
    }
    return true;
  },
);

chrome.runtime.onMessage.addListener(
  async (request: RuntimeMessage, _, sendResponse) => {
    const result = await chrome.storage.local.get("userId");
    if (!result.userId) return sendResponse({ success: false });
    if (request.action === "archiveSpace" && request.spaceId) {
      const spaceDocRef = doc(
        db,
        "users",
        result.userId,
        "spaces",
        request.spaceId,
      );
      await updateDoc(spaceDocRef, { isArchived: true });
      sendResponse({ success: true });
    }
    return true;
  },
);

async function handleRemoveSpace(request: RuntimeMessage) {
  if (!request.userId || !request.spaceId) {
    return { success: false };
  }

  const spaceDocRef = doc(
    db,
    "users",
    request.userId,
    "spaces",
    request.spaceId,
  );
  const tabCollectionRef = collection(db, "users", request.userId, "tabs");

  await deleteDoc(spaceDocRef);

  const tabQuery = query(
    tabCollectionRef,
    where("spaceId", "==", request.spaceId),
  );

  const tabOrderDocRef = doc(
    db,
    "users",
    request.userId,
    "tabOrders",
    request.spaceId,
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

  return { success: true };
}

chrome.runtime.onMessage.addListener(
  async (request: RuntimeMessage, _, sendResponse) => {
    if (request.action === "removeSpace") {
      const result = await handleRemoveSpace(request);
      sendResponse(result);
    }
    return true;
  },
);
