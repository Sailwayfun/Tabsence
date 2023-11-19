import { db } from "../firebase-config";
import { Tab } from "./components/NewTab";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  Query,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  async function getTabs() {
    const tabsCollection = collection(db, "tabs");
    const tabsSnapshot = await getDocs(tabsCollection);
    if (tabsSnapshot.empty) {
      console.log("No tabs found");
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

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    saveSpaceInfo();
    saveTabInfo(tab);
  });
});

chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    saveSpaceInfo();
    saveTabInfo(tab);
  }
});

function getFaviconUrl(url: string) {
  return `chrome-extension://${
    chrome.runtime.id
  }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
}

const spaceCollectionRef = collection(db, "spaces");
const spaceId = doc(spaceCollectionRef).id;
async function saveSpaceInfo() {
  const spaceName = "unsaved";
  const spaceQuery = query(spaceCollectionRef, where("title", "==", spaceName));
  const spaceSnapshot = await getDocs(spaceQuery);
  const spaceDocRef = !spaceSnapshot.empty
    ? spaceSnapshot.docs[0].ref
    : doc(spaceCollectionRef);
  const spaceData = {
    title: spaceName,
    id: spaceId,
  };
  await setDoc(spaceDocRef, spaceData, { merge: true });
  return;
}

function saveTabInfo(tab: chrome.tabs.Tab) {
  if (tab.url && tab.title) {
    const tabData = {
      title: tab.title,
      url: tab.url,
      favIconUrl: getFaviconUrl(tab.url) || tab.favIconUrl || "",
      lastAccessed: serverTimestamp(),
      spaceId,
      isArchived: false,
    };
    const tabDocRef = doc(db, "tabs", `tab-${tab.id}`);
    setDoc(tabDocRef, tabData, { merge: true }).catch((error) => {
      console.error("Error saving tab info: ", error);
    });
  }
}

chrome.runtime.onMessage.addListener(
  (
    request: { action: string; updatedTab: Tab; spaceName: string },
    _,
    sendResponse,
  ) => {
    if (request.action === "moveTab") {
      const tabDocRef = doc(db, "tabs", `${request.updatedTab.id}`);
      console.log("requestedId", `${request.updatedTab.id}`);
      const spaceCollectionRef = collection(db, "spaces");
      const spaceQuery = query(
        spaceCollectionRef,
        where("title", "==", request.spaceName),
      );
      updateSpaceOfTab(spaceQuery, spaceCollectionRef, request, tabDocRef)
        .then((updatedTab) => {
          sendResponse(updatedTab);
        })
        .catch((error) => {
          console.error("Error updating tab: ", error);
          sendResponse(null);
        });
      return true;
    }
  },
);
async function updateSpaceOfTab(
  spaceQuery: Query<DocumentData, DocumentData>,
  spaceCollectionRef: CollectionReference<DocumentData, DocumentData>,
  request: { action: string; updatedTab: Tab; spaceName: string },
  tabDocRef: DocumentReference<DocumentData, DocumentData>,
) {
  try {
    const spaceSnapshot = await getDocs(spaceQuery);
    const spaceDocRef = !spaceSnapshot.empty
      ? spaceSnapshot.docs[0].ref
      : doc(spaceCollectionRef);
    const spaceData = {
      title: request.spaceName,
      id: spaceDocRef.id,
    };
    await setDoc(spaceDocRef, spaceData, { merge: true });
    const tabData = {
      spaceId: spaceDocRef.id,
    };
    await setDoc(tabDocRef, tabData, { merge: true });
    const updatedTab = { ...request.updatedTab, spaceId: tabData.spaceId };
    return updatedTab;
  } catch (error) {
    console.error("Error getting tabs: ", error);
  }
}
