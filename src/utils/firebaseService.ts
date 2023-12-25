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
} from "firebase/firestore";

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
    currentPath: string = "",
  ): Query => {
    const windowIds = [
      currentWindowId,
      sharedWindowId ? parseInt(sharedWindowId) : 0,
    ];
    if (currentPath) {
      return query(
        tabsCollectionRef,
        where("windowId", "in", windowIds),
        where("spaceId", "==", currentPath),
      );
    }
    return query(tabsCollectionRef, where("windowId", "in", windowIds));
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
};
