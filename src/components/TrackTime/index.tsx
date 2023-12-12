import noData from "./no-data.png";
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
import { useDateStore } from "../../store";
import Header from "./Header";

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
  const date = useDateStore((state) => state.date);

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
        date,
        "domains",
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
  }, [userId, date]);

  function getDurationPercentge(duration: number) {
    const totalDuration = getTotalDuration();
    return ((duration / totalDuration) * 100).toFixed(2);
  }

  function getTotalDuration() {
    return urlDurations.reduce((acc, cur) => acc + cur.durationBySecond, 0);
  }

  const labelFields = [
    "Domain Name",
    "Duration (sec)",
    "Visit Counts",
    "Spent Time (%)",
  ];

  return (
    <>
      <Header />
      {urlDurations.length > 0 && (
        <div className="min-h-screen max-w-full rounded-lg border bg-slate-100 p-8 shadow-md">
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
                  className="grid w-full grid-cols-4 rounded-md border border-gray-300 p-3 shadow transition delay-100 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-slate-300 hover:shadow-lg xl:text-2xl"
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
                  <div className="mx-auto my-0 text-xl">
                    {website.visitCounts}
                  </div>
                  <div className="mx-auto my-0 text-xl">
                    {getDurationPercentge(website.durationBySecond)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mx-auto my-3 border-t-2 border-gray-200 pt-3 text-xl">
              <span className="pl-80 pr-2 tracking-wide">Total Duration:</span>
              <span>{getTotalDuration()} s</span>
            </div>
          </div>
          <Chart durationData={urlDurations} />
        </div>
      )}
      {urlDurations.length === 0 && (
        <div className="flex min-h-screen max-w-full flex-col items-center gap-4 rounded-lg border bg-slate-100 py-16 shadow-md">
          <img src={noData} alt="no data" className="mx-auto w-1/2" />
          <span className="mr-3 self-end">
            Image by{" "}
            <a href="https://www.freepik.com/free-vector/flat-design-no-data-illustration_47718912.htm#query=not%20data&position=5&from_view=search&track=ais&uuid=7ee5c7a8-e536-4bdb-9331-39411353fc99">
              Freepik
            </a>
          </span>
          <div className="text-4xl">Sorry! There's no data.</div>
        </div>
      )}
    </>
  );
};

export default TrackTime;
