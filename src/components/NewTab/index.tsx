import { useState, useEffect } from "react";
import { FieldValue } from "firebase/firestore";
import Spaces from "./Spaces";
import MoveToSpace from "./MoveToSpace";
interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
}
const NewTab = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  console.log(tabs);
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getTabs" }, function (response) {
      if (response) setTabs(response);
    });
  }, []);
  function openLink(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) {
    e.preventDefault();
    if (!tab.url) return;
    const newTabUrl = tab.url;
    chrome.tabs.create({ url: newTabUrl });
  }
  return (
    <div className="flex w-full py-8">
      <Spaces />
      <div className="flex flex-col">
        <h1 className="mb-4 text-3xl">Your Tabs</h1>
        <ul className="flex flex-col gap-3">
          {tabs.length > 0 &&
            tabs.map((tab, index) => {
              return (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg hover:bg-slate-300"
                >
                  <img src={tab.favIconUrl} className="h-4 w-4 bg-gray-500" />
                  <a
                    onClick={(e) => openLink(e, tab)}
                    className="cursor-pointer hover:text-gray-500 hover:underline"
                  >
                    {tab.title}
                  </a>
                  <MoveToSpace />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default NewTab;
