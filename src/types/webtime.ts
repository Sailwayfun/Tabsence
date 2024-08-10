import type { FieldValue } from "firebase/firestore";
export interface UrlDuration {
  id: string;
  url: string;
  faviconUrl: string;
  durationBySecond: number;
  lastVisitTime: FieldValue;
  visitCounts: number;
}
