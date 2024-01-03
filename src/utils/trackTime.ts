import { subDays, addDays, format } from "date-fns";

import { firebaseService } from "./firebaseService";

import { getUserId } from "../background";

export function getCurrentDate(): string {
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");
  return formattedToday;
}

interface TabInfo {
  startTime: number;
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
}

export async function updateUrlDuration(newUrl?: string): Promise<void> {
  if (!newUrl) return;
  const userId = await getUserId();
  const today = getCurrentDate();
  if (!tabTimes[today]) tabTimes[today] = {};
  const tabInfo = tabTimes[today][newUrl];
  if (!tabInfo) {
    return;
  }
  const { startTime, date, durationBySecond } = tabInfo;
  const duration = Date.now() - startTime;
  const seconds = Math.floor(duration / 1000);
  if (seconds < 1) return;
  const newDuration = durationBySecond + seconds;
  return firebaseService.saveUrlDuration(userId, newUrl, date, newDuration);
}

export function getPrevDate(date: string): string {
  const today = new Date(date);
  const yesterday = subDays(today, 1);
  return format(yesterday, "yyyy-MM-dd");
}

export function getNextDate(date: string): string {
  const today = new Date(date);
  const tomorrow = addDays(today, 1);
  return format(tomorrow, "yyyy-MM-dd");
}
