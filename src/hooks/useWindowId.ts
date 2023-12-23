import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function useWindowId(): number {
  const [windowId, setWindowId] = useState<number>(0);

  useEffect(() => {
    let active = true;
    async function getCurrentWindowId(): Promise<number | undefined> {
      try {
        const window = await chrome.windows.getCurrent();
        if (!active || !window.id) throw new Error("Window id not found");
        return window.id;
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message, {
            className: "w-52 text-lg rounded-md shadow",
            duration: 2000,
          });
        }
      }
    }
    getCurrentWindowId().then((id) => setWindowId(id || 0));
    return () => {
      active = false;
    };
  }, []);

  return windowId;
}
