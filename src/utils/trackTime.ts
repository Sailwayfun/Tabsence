import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import debounce from "lodash.debounce";

import { db } from "../../firebase-config";

async function getUserId(): Promise<string | undefined> {
  return await chrome.storage.local.get("userId").then((res) => res.userId);
}

interface TabInfo {
  startTime: number;
  url: string;
}

export const tabTimes: Record<number, TabInfo> = {};

export function trackTabTime(url: string, tabId?: number): void {
  if (!tabId) return;
  tabTimes[tabId] = {
    startTime: Date.now(),
    url,
  };
  console.log("tabTimes", tabTimes);
}

export async function updateTabDuration(tabId?: number): Promise<void> {
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
    const myDomain: string = "icdbgchingbnboklhnagfckgjpdfjfeg";
    if (domain === myDomain) return;
    const debouncedWriteToFirestore = getDebouncedWrite(userId, domain);
    debouncedWriteToFirestore(durationBySecond, url);
    console.log("writeToFirestore", domain, durationBySecond, url);
  } catch (error) {
    console.error("Error updating tab duration: ", error);
  }
}

type DebouncedFunction = (durationBySecond: number, url: string) => void;

const debouncedWrites: Record<string, DebouncedFunction> = {};

function getDebouncedWrite(userId: string, domain: string): DebouncedFunction {
  if (!debouncedWrites[domain]) {
    debouncedWrites[domain] = debounce(async (durationBySecond, url) => {
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
    }, 1000);
  }
  return debouncedWrites[domain];
}
