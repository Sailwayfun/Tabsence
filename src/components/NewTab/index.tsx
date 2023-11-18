import { useState, useEffect } from "react";
import { FieldValue } from "firebase/firestore";
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
    <div className="mx-auto w-full px-80 py-8">
      <h1 className="mb-4 text-3xl">Your Tabs</h1>
      <ul className="flex flex-col gap-3">
        {tabs.length > 0 &&
          tabs.map((tab, index) => {
            return (
              <li
                key={index}
                className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg"
              >
                <img src={tab.favIconUrl} className="h-4 w-4" />
                <a
                  onClick={(e) => openLink(e, tab)}
                  className="cursor-pointer hover:text-gray-500 hover:underline"
                >
                  {tab.title}
                </a>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default NewTab;
