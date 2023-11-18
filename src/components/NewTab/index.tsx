import { useState, useEffect } from "react";
const NewTab = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  console.log(tabs);
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getTabs" }, function (response) {
      if (response && response.tabs) setTabs(response.tabs);
    });
  }, []);
  return (
    <div className="mx-auto w-full px-80 py-8">
      <h1 className="mb-4 text-3xl">Your Tabs</h1>
      <ul className="flex flex-col gap-3">
        {tabs &&
          tabs.map((tab, index) => {
            return (
              <li
                key={index}
                className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg"
              >
                <img src={tab.favIconUrl} className="h-4 w-4" />
                <a
                  href={tab.url}
                  className="hover:text-gray-500 hover:underline"
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
