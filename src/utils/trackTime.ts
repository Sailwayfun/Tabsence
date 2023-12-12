import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { getFaviconUrl } from "./firestore";

import debounce from "lodash.debounce";

import { db } from "../../firebase-config";

async function getUserId(): Promise<string | undefined> {
  return await chrome.storage.local.get("userId").then((res) => res.userId);
}

function getCurrentDate(): string {
  const today = new Date();
  return today.toLocaleDateString();
}

interface TabInfo {
  startTime: number;
  url: string;
  date: string;
}

export const tabTimes: Record<string, Record<number, TabInfo>> = {};

export function trackTabTime(url: string, tabId?: number): void {
  if (!tabId) return;
  const today = getCurrentDate();
  if (!tabTimes[today]) tabTimes[today] = {};
  tabTimes[today][tabId] = {
    startTime: Date.now(),
    url,
    date: today,
  };
  // tabTimes[tabId] = {
  //   startTime: Date.now(),
  //   url,
  // };
  console.log("tabTimes", tabTimes);
}

export async function updateTabDuration(tabId?: number): Promise<void> {
  if (!tabId) return;
  const userId = await getUserId();
  const today = getCurrentDate();
  if (!tabTimes[today]) tabTimes[today] = {};
  const tabInfo = tabTimes[today][tabId];
  console.log("tabInfo", tabInfo);
  if (!tabInfo) {
    return;
  }
  const { startTime, url, date } = tabInfo;
  const duration = Date.now() - startTime;
  const durationBySecond = Math.floor(duration / 1000);
  console.log("durationBySecond", durationBySecond);
  if (!userId) return;
  try {
    const domain = new URL(url).hostname;
    const myDomain: string = "icdbgchingbnboklhnagfckgjpdfjfeg";
    if (domain === myDomain) return;
    const debouncedWriteToFirestore = getDebouncedWrite(userId, domain);
    debouncedWriteToFirestore(durationBySecond, url, date);
    console.log("writeToFirestore", domain, durationBySecond, url, date);
  } catch (error) {
    console.error("Error updating tab duration: ", error);
  }
}

type DebouncedFunction = (
  durationBySecond: number,
  url: string,
  date: string,
) => void;

const debouncedWrites: Record<string, DebouncedFunction> = {};

function getDebouncedWrite(userId: string, domain: string): DebouncedFunction {
  if (!debouncedWrites[domain]) {
    debouncedWrites[domain] = debounce(async (durationBySecond, url, date) => {
      const urlRef = doc(db, "users", userId, "urlDurations", domain);
      const urlSnapShot = await getDoc(urlRef);

      if (urlSnapShot.exists() && urlSnapShot.data().date === date) {
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
            date,
          },
          { merge: true },
        );
      }
    }, 1000);
  }
  return debouncedWrites[domain];
}
