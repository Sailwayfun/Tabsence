import { FieldValue } from "firebase/firestore";
export interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
  spaceId?: string;
  tabId: number | undefined;
  isPinned: boolean;
}
