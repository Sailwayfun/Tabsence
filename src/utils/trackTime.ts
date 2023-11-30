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

export async function trackTabTime(url: string, tabId?: number) {
  if (!tabId) return;
  tabTimes[tabId] = {
    startTime: Date.now(),
    url,
  };
}

export async function updateTabDuration(tabId?: number) {
  if (!tabId) return;
  const userId = await getUserId();
  const tabInfo = tabTimes[tabId];
  if (!tabInfo) {
    return;
  }
  const { startTime, url } = tabInfo;
  const duration = Date.now() - startTime;
  const durationBySecond = Math.floor(duration / 1000);
  if (!userId) return;
  try {
    const domain = new URL(url).hostname;
    const urlRef = doc(db, "users", userId, "urls", domain);
    const urlSnapShot = await getDoc(urlRef);
    if (urlSnapShot.exists()) {
      await updateDoc(urlRef, {
        duration: increment(durationBySecond),
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
  } catch (error) {
    console.error("Error updating tab duration: ", error);
  }
}
