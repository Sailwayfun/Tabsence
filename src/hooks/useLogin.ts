import { useState, useEffect } from "react";

export default function useLogin(): {
  currentUserId: string;
  isLoggedin: boolean;
} {
  const [userId, setUserId] = useState<string>("");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  useEffect(() => {
    async function getUserId() {
      try {
        const result = await chrome.storage.local.get(["userId"]);
        if (result.userId) {
          return result.userId;
        }
        throw new Error("Failed to get userId");
      } catch (error) {
        console.error(error);
      }
    }
    getUserId()
      .then((userId) => {
        setUserId(userId);
        setIsLoggedin(true);
      })
      .catch((error) => console.error(error));
  }, []);
  return { currentUserId: userId, isLoggedin };
}
