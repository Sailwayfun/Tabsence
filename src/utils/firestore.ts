import {
  setDoc,
  collection,
  doc,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";

async function updateOldTabOrderDoc(
  userId: string,
  originalSpaceId: string,
  tabId: number,
) {
  const tabOrdersCollectionRef = collection(db, "users", userId, "tabOrders");
  const spaceId = originalSpaceId || "global";
  const oldTabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
  await updateDoc(oldTabOrderDocRef, { tabOrder: arrayRemove(tabId) });
}

async function updateNewTabOrderDoc(
  userId: string,
  spaceId: string,
  tabId: number,
  windowId: number,
) {
  const tabOrdersCollectionRef = collection(db, "users", userId, "tabOrders");
  const newTabOrderDocRef = doc(tabOrdersCollectionRef, spaceId);
  await setDoc(
    newTabOrderDocRef,
    { tabOrder: arrayUnion(tabId), windowId },
    { merge: true },
  );
}

async function updateSpaceOfTab(
  tabId: number,
  spaceId: string,
  userId: string,
) {
  const tabDocRef = doc(db, "users", userId, "tabs", tabId.toString());
  try {
    await updateDoc(tabDocRef, { spaceId });
  } catch (error) {
    console.error(error);
  }
}

export { updateOldTabOrderDoc, updateNewTabOrderDoc, updateSpaceOfTab };
