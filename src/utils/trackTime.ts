import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase-config";
async function getUserId(): Promise<string | undefined> {
  return await chrome.storage.local.get("userId").then((res) => res.userId);
}

interface TabInfo {
  startTime: number;
  url: string;
}

export const tabTimes: Record<number, TabInfo> = {};

export function trackTabTime(url: string, tabId?: number) {
  if (!tabId) return;
  tabTimes[tabId] = {
    startTime: Date.now(),
    url,
  };
  console.log("tabTimes", tabTimes);
}

export async function updateTabDuration(tabId?: number) {
  if (!tabId) return;
  const userId = await getUserId();
  console.log("userId", userId);
  const tabInfo = tabTimes[tabId];
  console.log("tabInfo", tabInfo);
  if (!tabInfo) {
    return;
  }
  const { startTime, url } = tabInfo;
  const duration = Date.now() - startTime;
  const durationBySecond = Math.floor(duration / 1000);
  console.log("durationBySecond", durationBySecond);
  if (!userId) return;
  try {
    const domain = new URL(url).hostname;
    writeToFirestore(userId, domain, durationBySecond, url);
    console.log("writeToFirestore", domain, durationBySecond, url);
  } catch (error) {
    console.error("Error updating tab duration: ", error);
  }
}
async function writeToFirestore(
  userId: string,
  domain: string,
  durationBySecond: number,
  url: string,
) {
  const urlRef = doc(db, "users", userId, "urlDurations", domain);
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
        url,
        durationBySecond,
        visitCounts: 1,
        lastVisit: serverTimestamp(),
      },
      { merge: true },
    );
  }
}
