import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  where,
  query,
  type CollectionReference,
  type Query,
  onSnapshot,
  orderBy,
  type OrderByDirection,
  type DocumentReference,
  type WhereFilterOp,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import debounce from "lodash.debounce";
import { getFaviconUrl } from "./tabs";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRESTORE_API_KEY,
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
      sharedWindowId ? Number.parseInt(sharedWindowId) : 0,
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
      for (const doc of snapshot.docs) {
        const id = doc.id;
        data.push({ id, ...doc.data() } as T);
      }
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
  getDocId: function (paths: string[]) {
    const collectionRef = this.getCollectionRef(paths);
    return doc(collectionRef).id;
  },
  saveNewTabToFirestore,
  moveTabToSpace,
  removeSpace,
  updateTabOrder,
  addSpace,
  pinTab,
  archiveSpace,
  restoreSpace,
  updateSpaceTitle,
  initializeTabOrder,
  saveUrlDuration,
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

async function pinTab(
  userId: string,
  spaceId: string,
  tabId: number,
  newTabOrder: number[],
  isPinned: boolean,
) {
  const tabDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabs",
    tabId.toString(),
  ]);
  const tabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    spaceId,
  ]);
  const batch = writeBatch(db);
  batch.update(tabDocRef, { isPinned: !isPinned });
  batch.set(tabOrderDocRef, { tabOrder: newTabOrder }, { merge: true });
  try {
    await batch.commit();
  } catch (error) {
    throw new Error("Error pinning tab");
  }
}

async function archiveSpace(userId: string, spaceId: string) {
  const spaceDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "spaces",
    spaceId,
  ]);
  await updateDoc(spaceDocRef, { isArchived: true });
}

async function restoreSpace(userId: string, spaceId: string) {
  const spaceDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "spaces",
    spaceId,
  ]);
  await updateDoc(spaceDocRef, { isArchived: false });
}

async function updateSpaceTitle(
  userId: string,
  spaceId: string,
  title: string,
) {
  const spaceDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "spaces",
    spaceId,
  ]);
  await updateDoc(spaceDocRef, { title });
}

async function initializeTabOrder(windowId: number, userId: string) {
  const tabOrderDocRef = firebaseService.getDocRef([
    "users",
    userId,
    "tabOrders",
    "global",
  ]);
  try {
    await setDoc(tabOrderDocRef, { tabOrder: [], windowId }, { merge: true });
  } catch (err) {
    throw new Error("Error initializing tab order");
  }
}

type DebouncedFunction = (
  durationBySecond: number,
  url: string,
  date: string,
) => void;

const debouncedWrites: Record<string, DebouncedFunction> = {};

function saveUrlDuration(
  userId: string,
  newUrl: string,
  date: string,
  durationBySecond: number,
) {
  const domain = new URL(newUrl).hostname;
  const myDomain: string = "icdbgchingbnboklhnagfckgjpdfjfeg";
  if (domain === myDomain || domain === "newtab") return;
  const debouncedWriteToFirestore = getDebouncedWrite(userId, domain);
  // console.log("getDebouncedWrite called in fiebaseService");
  debouncedWriteToFirestore(durationBySecond, newUrl, date);
}

function getDebouncedWrite(userId: string, domain: string) {
  if (!debouncedWrites[domain]) {
    debouncedWrites[domain] = debounce(async (durationBySecond, url, date) => {
      const urlRef = firebaseService.getDocRef([
        "users",
        userId,
        "urlDurations",
        date,
        "domains",
        domain,
      ]);
      const urlSnapShot = await getDoc(urlRef);
      if (urlSnapShot.exists()) {
        await updateDoc(urlRef, {
          durationBySecond: increment(durationBySecond),
          visitCounts: increment(1),
          lastVisit: serverTimestamp(),
        });
      } else {
        await setDoc(
          urlRef,
          {
            faviconUrl: getFaviconUrl(url),
            url,
            durationBySecond,
            visitCounts: 1,
            lastVisit: serverTimestamp(),
          },
          { merge: true },
        );
      }
    }, 1000);
  }
  return debouncedWrites[domain];
}
