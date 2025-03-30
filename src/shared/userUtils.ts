import { firebaseService } from "src/utils/firebaseService";

async function getUserId() {
  const result: { [key: string]: string | undefined } =
    await chrome.storage.local.get("userId");
  const userId = result.userId;
  if (!userId) {
    const docId = firebaseService.getDocId(["users"]);
    return docId;
  }
  return userId;
}

export default getUserId;
