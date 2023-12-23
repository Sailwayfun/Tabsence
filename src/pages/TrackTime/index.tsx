import noData from "./no-data.png";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useEffect, useState } from "react";
import Chart from "./Chart";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { Loader } from "../../components/UI";
import useLogin from "../../hooks/useLogin";
import ToggleOrderBtn from "./ToggleOrderBtn";
import { cn } from "../../utils";
import { UrlDuration } from "../../types";

const TrackTime = () => {
  const [urlDurations, setUrlDurations] = useState<UrlDuration[]>([]);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const { date } = useParams<{ date: string }>();
  const { currentUserId: userId } = useLogin();

  useEffect(() => {
    setIsLoading(true);
    if (userId && date) {
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
        setIsLoading(false);
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

  function toggleDurationsOrder() {
    setIsAscending(!isAscending);
    const sortedDurations = [...urlDurations];
    sortedDurations.sort((a, b) => {
      if (isAscending) {
        return b.durationBySecond - a.durationBySecond;
      }
      return a.durationBySecond - b.durationBySecond;
    });
    setUrlDurations(sortedDurations);
    return setIsLoading(false);
  }

  const labelFields = [
    "Domain Name",
    "Duration (sec)",
    "Visit Counts",
    "Spent Time (%)",
  ];

  function toggleTable() {
    setShowTable(!showTable);
  }

  function resetDurationOrder() {
    setIsAscending(true);
  }
  const showTableAnimation = "transition duration-300 ease-in-out";

  return (
    <>
      <Header onResetOrder={resetDurationOrder} />
      {urlDurations.length > 0 && (
        <div className="relative min-h-screen max-w-full rounded-lg border bg-slate-100 p-8 shadow-md">
          <div className="mb-3 grid auto-cols-min grid-flow-col grid-cols-4 text-lg">
            {labelFields.map((label, index) => (
              <div className="flex justify-center gap-4" key={index}>
                <label
                  className={cn(
                    !showTable && "absolute -translate-y-[999px]",
                    showTable && "my-0",
                    showTableAnimation,
                  )}
                >
                  {label}
                </label>
                {label.includes("Duration") && showTable && (
                  <ToggleOrderBtn
                    onToggleOrder={toggleDurationsOrder}
                    isAscending={isAscending}
                  />
                )}
              </div>
            ))}
            <button
              className="absolute right-2 top-7 ml-4 h-6 w-6 text-2xl"
              onClick={toggleTable}
            >
              {showTable ? "▼" : "▲"}
            </button>
          </div>
          <div>
            <ul
              className={cn(
                showTable && "flex translate-y-0 flex-col gap-3",
                !showTable && "absolute -translate-y-[999px]",
                showTableAnimation,
              )}
            >
              {urlDurations.map((website) => (
                <li
                  key={website.id}
                  className="grid w-full grid-cols-4 rounded-md border border-gray-300 p-3 shadow transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-slate-300 hover:shadow-lg xl:text-2xl"
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
            <div
              className={cn(
                " grid grid-cols-4",
                !showTable && "absolute -translate-y-[999px] transform",
                showTable &&
                  "mx-auto my-3 translate-y-0 border-t-2 border-gray-200 pt-3 text-xl",
              )}
            >
              <span className="col-start-2 flex justify-center pr-2 tracking-wide">
                {`Total Duration: ${getTotalDuration()} s`}
              </span>
            </div>
          </div>
          <Chart durationData={urlDurations} />
        </div>
      )}
      {isLoading && urlDurations.length === 0 && (
        <Loader text="Loading Data..." animateClass="animate-spin" />
      )}
      {!isLoading && urlDurations.length === 0 && (
        <div className="flex min-h-screen max-w-full flex-col items-center gap-4 rounded-lg border bg-slate-100 py-16 shadow-md">
          <img src={noData} alt="no data" className="mx-auto w-1/3" />
          <span className="mr-8 self-end">
            Image by{" "}
            <a href="https://www.freepik.com/free-vector/flat-design-no-data-illustration_47718912.htm#query=not%20data&position=5&from_view=search&track=ais&uuid=7ee5c7a8-e536-4bdb-9331-39411353fc99">
              Freepik
            </a>
          </span>
          <div className="-mt-16 text-3xl">Sorry! There's no data.</div>
        </div>
      )}
    </>
  );
};

export default TrackTime;
