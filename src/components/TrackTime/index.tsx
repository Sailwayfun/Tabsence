import {
  collection,
  query,
  where,
  onSnapshot,
  FieldValue,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useEffect, useState } from "react";
import Chart from "./Chart";

export interface UrlDuration {
  id: string;
  url: string;
  faviconUrl: string;
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
    const totalDuration = getTotalDuration();
    return ((duration / totalDuration) * 100).toFixed(2);
  }

  function getTotalDuration() {
    return urlDurations.reduce((acc, cur) => acc + cur.durationBySecond, 0);
  }

  const labelFields = [
    "Domain Name",
    "Total Duration (sec)",
    "Visit Counts",
    "Spent Time (%)",
  ];

  return (
    <div className="max-w-6xl border border-red-400 p-8">
      <div className="mb-3 grid grid-cols-4 text-lg">
        {labelFields.map((label, index) => (
          <label key={index} className="mx-auto my-0">
            {label}
          </label>
        ))}
      </div>
      <div>
        <ul className="flex flex-col gap-3">
          {urlDurations.map((website) => (
            <li
              key={website.id}
              className="grid w-full grid-cols-4 rounded-md border border-gray-300 p-3 shadow hover:scale-105"
            >
              <div className="flex gap-2 text-xl">
                <img
                  className="h-8 w-8"
                  src={website.faviconUrl}
                  alt={website.id}
                />
                <span>{website.id}</span>
              </div>
              <div className="mx-auto my-0 text-lg">
                {website.durationBySecond}
              </div>
              <div className="mx-auto my-0 text-xl">{website.visitCounts}</div>
              <div className="mx-auto my-0 text-xl">
                {getDurationPercentge(website.durationBySecond)}
              </div>
            </li>
          ))}
        </ul>
        <div className="mx-auto my-3 border-t-2 border-gray-200 pl-80 pt-3 text-xl">
          <span className="pr-3 tracking-wide">Total Duration:</span>
          <span>{getTotalDuration()} s</span>
        </div>
      </div>
      <Chart durationData={urlDurations} />
    </div>
  );
};

export default TrackTime;
