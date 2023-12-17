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

export function getCurrentDate(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

interface TabInfo {
  startTime: number;
  // url: string;
  durationBySecond: number;
  date: string;
}

export const tabTimes: Record<string, Record<string, TabInfo>> = {};

export function trackTabTime(url: string): void {
  if (!url) return;
  const today = getCurrentDate();
  if (!tabTimes[today]) tabTimes[today] = {};
  if (tabTimes[today][url]) {
    tabTimes[today][url].startTime = Date.now();
    return;
  }
  tabTimes[today][url] = {
    startTime: Date.now(),
    date: today,
    durationBySecond: 0,
  };
  console.log(0, "trackTabTime", tabTimes);
}

export async function updateTabDuration(newUrl?: string): Promise<void> {
  if (!newUrl) return;
  const userId = await getUserId();
  const today = getCurrentDate();
  if (!tabTimes[today]) tabTimes[today] = {};
  const tabInfo = tabTimes[today][newUrl];
  console.log("updateTabDuration", tabInfo);
  if (!tabInfo) {
    return;
  }
  const { startTime, date } = tabInfo;
  const duration = Date.now() - startTime;
  const seconds = Math.floor(duration / 1000);
  console.log("這次加上了多少秒", seconds);
  if (seconds < 1) return;
  tabInfo.durationBySecond += seconds;
  console.log("durationBySecond", tabInfo.durationBySecond);
  if (!userId) return;
  try {
    const domain = new URL(newUrl).hostname;
    const myDomain: string = "icdbgchingbnboklhnagfckgjpdfjfeg";
    if (domain === myDomain || domain === "newtab") return;
    const debouncedWriteToFirestore = getDebouncedWrite(userId, domain);
    debouncedWriteToFirestore(tabInfo.durationBySecond, newUrl, date);
    console.log(
      "writeToFirestore",
      domain,
      tabInfo.durationBySecond,
      newUrl,
      date,
    );
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
      const urlRef = doc(
        db,
        "users",
        userId,
        "urlDurations",
        date,
        "domains",
        domain,
      );
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
          },
          { merge: true },
        );
      }
    }, 1000);
  }
  return debouncedWrites[domain];
}

function setViewDate(date: string, days: number): string {
  const today = new Date(date);
  const newDate = new Date(today.setDate(today.getDate() + days));
  return `${newDate.getFullYear()}-${
    newDate.getMonth() + 1
  }-${newDate.getDate()}`;
}

export function getPrevDate(date: string): string {
  return setViewDate(date, -1);
}

export function getNextDate(date: string): string {
  return setViewDate(date, 1);
}
