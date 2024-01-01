import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  where,
  query,
  CollectionReference,
  Query,
  onSnapshot,
  orderBy,
  OrderByDirection,
  DocumentReference,
  WhereFilterOp,
  getDocs,
  setDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { getFaviconUrl } from "./tabs";

const firebaseConfig = {
  apiKey: "AIzaSyD6FBXo1fXHD25XpBM6notUM7v6U7mt6mU",
  authDomain: "wordle-sail.firebaseapp.com",
  projectId: "wordle-sail",
  messagingSenderId: "194079596933",
  appId: "1:194079596933:web:0037db26cc7663cd0724ec",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const firebaseService = {
  getCollectionRef: (paths: string[]) => {
    const [path, ...rest] = paths;
    return collection(db, path, ...rest);
  },
  getDocRef: (paths: string[]) => {
    const [path, ...rest] = paths;
    return doc(db, path, ...rest);
  },
  createTabsQuery: (
    tabsCollectionRef: CollectionReference,
    currentWindowId: number,
    sharedWindowId?: string,
    currentPath?: string,
  ): Query => {
    const windowIds = [
      currentWindowId,
      sharedWindowId ? parseInt(sharedWindowId) : 0,
    ];
    return query(
      tabsCollectionRef,
      where("windowId", "in", windowIds),
      where("spaceId", "==", currentPath ? currentPath : "global"),
    );
  },
  subscribeToQuery: <T>(query: Query, onData: (data: T[]) => void) => {
    return onSnapshot(query, (snapshot) => {
      const data: T[] = [];
      snapshot.forEach((doc) => {
        const id = doc.id;
        data.push({ id, ...doc.data() } as T);
      });
      onData(data);
    });
  },
  subscribeToDoc: <T>(docRef: DocumentReference, onData: (data: T) => void) => {
    return onSnapshot(docRef, (doc) => {
      if (!doc.exists()) return;
      const id = doc.id;
      const data = { id, ...doc.data() } as T;
      onData(data);
    });
  },
  createSpacesQuery: (
    spacesCollectionRef: CollectionReference,
    field: string,
    direction: OrderByDirection,
  ): Query => {
    return query(spacesCollectionRef, orderBy(field, direction));
  },
  createUrlDurationQuery: (
    urlDurationCollectionRef: CollectionReference,
    field: string,
    operator: WhereFilterOp,
    value: number,
  ) => {
    return query(urlDurationCollectionRef, where(field, operator, value));
  },
  deleteDoc: async function (paths: string[]) {
    const docRef = this.getDocRef(paths);
    await deleteDoc(docRef);
  },
  saveNewTabToFirestore,
  moveTabToSpace,
  removeSpace,
  updateTabOrder,
  addSpace,
};

async function saveNewTabToFirestore(tab: chrome.tabs.Tab, userId?: string) {
  if (!userId || !tab.url || !tab.title || !tab.id) return;

  const tabData = {
    windowId: tab.windowId,
    tabId: tab.id,
    title: tab.title,
    url: tab.url,
    favIconUrl: getFaviconUrl(tab.url) || tab.favIconUrl || "",
    isPinned: false,
    spaceId: "global",
  };
  const newTabId = tab.id;
  const tabDocRef = doc(db, "users", userId, "tabs", tab.id.toString());
  const tabOrderDocRef = doc(db, "users", userId, "tabOrders", "global");
  await setDoc(
    tabOrderDocRef,
    { tabOrder: arrayUnion(newTabId), windowId: tab.windowId },
    { merge: true },
  );
  await setDoc(tabDocRef, tabData, { merge: true });
  return tabData;
}

async function moveTabToSpace(
  userId: string,
  originalSpaceId: string,
  newSpaceId: string,
  tabId: number,
  windowId: number,
) {
  const oldSpaceId = originalSpaceId || "global";
  const oldTabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    oldSpaceId,
  ]);
  const newTabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    newSpaceId,
  ]);

  const tabDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabs",
    tabId.toString(),
  ]);

  const batch = writeBatch(db);
  batch.update(tabDocRef, { spaceId: newSpaceId });
  batch.update(oldTabOrderDocRef, { tabOrder: arrayRemove(tabId) });
  batch.set(
    newTabOrderDocRef,
    { tabOrder: arrayUnion(tabId), windowId },
    { merge: true },
  );

  try {
    await batch.commit();
  } catch (error) {
    console.error(error);
  }
}

async function removeSpace(spaceId: string, userId: string) {
  const spaceDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "spaces",
    spaceId,
  ]);
  const tabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    spaceId,
  ]);

  const deletedTabIds: number[] = [];
  const batch = writeBatch(db);
  const tabCollectionRef = collection(db, "users", userId, "tabs");
  const tabQuery = query(tabCollectionRef, where("spaceId", "==", spaceId));
  const tabsSnapshot = await getDocs(tabQuery);
  if (tabsSnapshot.empty) {
    return;
  }
  batch.delete(spaceDocRef);
  batch.delete(tabOrderDocRef);
  tabsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  tabsSnapshot.forEach((doc) => {
    deletedTabIds.push(doc.data().tabId);
  });
  try {
    await batch.commit();
    return deletedTabIds;
  } catch (error) {
    console.error(error);
  }
}

async function updateTabOrder(
  userId: string,
  spaceId: string,
  tabOrder: number[],
  windowId: number,
) {
  const tabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    spaceId,
  ]);
  await setDoc(tabOrderDocRef, { tabOrder, windowId }, { merge: true });
}

async function addSpace(userId: string, newSpaceTitle: string) {
  const spaceCollectionRef = firebaseService.getCollectionRef([
    "users",
    userId,
    "spaces",
  ]);
  const spaceId: string = doc(spaceCollectionRef).id;
  const spaceData = {
    title: newSpaceTitle,
    spaceId: spaceId,
    createdAt: serverTimestamp(),
    isArchived: false,
  };
  try {
    await setDoc(doc(spaceCollectionRef, spaceId), spaceData, {
      merge: true,
    });
  } catch (error) {
    throw new Error("Error adding space");
  }
}
