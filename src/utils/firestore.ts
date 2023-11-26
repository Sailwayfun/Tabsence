import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  DocumentReference,
  DocumentData,
  orderBy,
} from "firebase/firestore";
import { Tab } from "../components/NewTab";
import { db } from "../../firebase-config";
interface FirebaseTabDoc extends DocumentData {
  id: string;
}
async function getDocFromFirestore(
  collectionName: string,
  queryString?: string,
) {
  const collectionRef = collection(db, collectionName);
  switch (collectionName) {
    case "spaces": {
      const q = query(collectionRef, orderBy("createdAt"));
      const spacesSnapshot = await getDocs(q);
      if (spacesSnapshot.empty) {
        return [];
      }
      const spaces = spacesSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return spaces;
    }
    case "tabs": {
      const tabOrdersCollectionRef = collection(db, "tabOrders");
      const tabQuery =
        queryString === ""
          ? collectionRef
          : query(collectionRef, where("spaceId", "==", queryString));
      const tabsSnapshot = await getDocs(tabQuery);
      if (queryString === "") {
        let tabOrder;
        const tabOrderDocRef = doc(tabOrdersCollectionRef, "global");
        const tabsWithoutSpace = tabsSnapshot.docs.reduce(
          (accumulator: FirebaseTabDoc[], doc) => {
            if (!doc.data().spaceId) {
              accumulator.push({ id: doc.id, ...doc.data() });
            }
            return accumulator;
          },
          [],
        );
        if (tabOrderDocRef) {
          const tabOrderSnapshot = await getDoc(tabOrderDocRef);
          if (tabOrderSnapshot.exists())
            tabOrder = tabOrderSnapshot.data()?.tabOrder;
        }
        return sortTabs(tabsWithoutSpace, tabOrder);
      }
      const tabOrderDocRef = doc(tabOrdersCollectionRef, queryString);
      const tabOrderSnapshot = await getDoc(tabOrderDocRef);
      const tabOrder: number[] | undefined =
        tabOrderSnapshot.exists() && tabOrderSnapshot.data()?.tabOrder;
      if (tabsSnapshot.empty) {
        return [];
      }
      const tabs = tabsSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      return sortTabs(tabs, tabOrder);
    }
  }
}

function sortTabs(tabs: FirebaseTabDoc[], tabOrder?: number[]) {
  if (!tabOrder) return tabs;
  const tabMap = new Map(tabs.map((tab) => [tab.tabId, tab]));
  const sortByOrder = (index: number) => tabMap.get(tabOrder[index]);
  console.log({ tabOrder });
  return tabOrder.map((_, index) => sortByOrder(index)).filter(Boolean);
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

async function saveTabInfo(tab: chrome.tabs.Tab) {
  if (tab.url && tab.title && tab.id) {
    const tabData = {
      tabId: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: _getFaviconUrl(tab.url) || tab.favIconUrl || "",
      lastAccessed: serverTimestamp(),
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
    await updateDoc(tabDocRef, { spaceId: request.spaceId });
    const updatedTab = { ...request.updatedTab, spaceId: request.spaceId };
    return updatedTab;
  } catch (error) {
    console.error("Error updating tabs: ", error);
  }
}

export { getTabs, getSpaces, saveTabInfo, upDateTabBySpace };
