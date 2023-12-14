import { useState, useEffect } from "react";

export default function useLogin(): {
  currentUserId: string;
  isLoggedin: boolean;
} {
  const [userId, setUserId] = useState<string>("");
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);

  useEffect(() => {
    function getUserId(): Promise<void> {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(["userId"], function (result) {
          if (result.userId) {
            setUserId(result.userId);
            setIsLoggedin(true);
            resolve();
            return;
          }
          reject();
        });
      });
    }
    getUserId().catch((err) => console.error(err));
  }, []);

  return { currentUserId: userId, isLoggedin };
}
