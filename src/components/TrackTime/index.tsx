import {
  collection,
  query,
  where,
  onSnapshot,
  FieldValue,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useEffect, useState } from "react";

interface UrlDuration {
  id: string;
  url: string;
  durationBySecond: number;
  lastVisitTime: FieldValue;
  visitCounts: number;
}

const TrackTime = () => {
  const [userId, setUserId] = useState<string>("");
  const [urlDurations, setUrlDurations] = useState<UrlDuration[]>([]);

  useEffect(() => {
    async function getUserId() {
      const userId = await chrome.storage.local
        .get("userId")
        .then((res) => res.userId);
      return userId;
    }

    getUserId()
      .then((userId) => setUserId(userId))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (userId) {
      const urlDurationCollectionRef = collection(
        db,
        "users",
        userId,
        "urlDurations",
      );
      const q = query(
        urlDurationCollectionRef,
        where("durationBySecond", ">", 0),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUrlDurations(data as UrlDuration[]);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [userId]);

  function getDurationPercentge(duration: number) {
    const totalDuration = urlDurations.reduce(
      (acc, cur) => acc + cur.durationBySecond,
      0,
    );
    return ((duration / totalDuration) * 100).toFixed(2);
  }

  return (
    <div className="max-w-6xl border border-red-400 p-5">
      <div className="mb-3 grid grid-cols-4 justify-center text-lg">
        <label>Domain Name</label>
        <label>Total Duration</label>
        <label>Visit Counts</label>
        <label>Spent Time (%)</label>
      </div>
      <div>
        <ul className="flex flex-col gap-3">
          {urlDurations.map((website) => (
            <li
              key={website.id}
              className="grid w-full grid-cols-4 rounded-md border border-gray-300 p-3"
            >
              <div className="text-xl">{website.id}</div>
              <div className="flex justify-center text-lg">
                {website.durationBySecond}
              </div>
              <div className="flex justify-center text-xl">
                {website.visitCounts}
              </div>
              <div className="text-xl">
                {getDurationPercentge(website.durationBySecond)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrackTime;
