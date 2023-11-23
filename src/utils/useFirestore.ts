import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  doc,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { Tab } from "../components/NewTab";
import { db } from "../../firebase-config";
async function getDocFromFirestore(
  collectionName: string,
  queryString?: string,
) {
  const collectionRef = collection(db, collectionName);
  switch (collectionName) {
    case "spaces": {
      const spacesSnapshot = await getDocs(collectionRef);
      if (spacesSnapshot.empty) {
        return [];
      }
      const spaces = spacesSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return spaces;
    }
    case "tabs": {
      if (queryString === "") queryString = "OyUOBRt0XlFnQfG5LSdu"; //TODO: query 沒有spaceId的tabs
      const tabQuery = query(
        collectionRef,
        where("spaceId", "==", queryString),
      );
      const tabsSnapshot = await getDocs(tabQuery);
      if (tabsSnapshot.empty) {
        return [];
      }
      const tabs = tabsSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return tabs;
    }
  }
}

function _getFaviconUrl(url: string) {
  return `chrome-extension://${
    chrome.runtime.id
  }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
}

async function getTabs(queryString: string) {
  const tabs = await getDocFromFirestore("tabs", queryString);
  return tabs;
}
async function getSpaces() {
  const spaces = await getDocFromFirestore("spaces");
  return spaces;
}

async function saveTabInfo(tab: chrome.tabs.Tab, spaceId: string) {
  if (tab.url && tab.title && tab.id) {
    const tabData = {
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: _getFaviconUrl(tab.url) || tab.favIconUrl || "",
      lastAccessed: serverTimestamp(),
      spaceId,
      isArchived: false,
    };
    const tabDocRef = doc(db, "tabs", tab.id.toString());
    await setDoc(tabDocRef, tabData, { merge: true });
    return tabData;
  }
}

async function upDateTabBySpace(
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
    const spaceData = {
      title: request.spaceName,
      spaceId: request.spaceId,
    };
    await setDoc(doc(spaceCollectionRef, request.spaceId), spaceData, {
      merge: true,
    });
    await updateDoc(tabDocRef, { spaceId: request.spaceId });
    const updatedTab = { ...request.updatedTab, spaceId: request.spaceId };
    return updatedTab;
  } catch (error) {
    console.error("Error getting tabs: ", error);
  }
}

export { getTabs, getSpaces, saveTabInfo, upDateTabBySpace };
