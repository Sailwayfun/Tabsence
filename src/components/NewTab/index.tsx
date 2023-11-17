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
    <div>
      <p>This is a new tab</p>
      <ul>
        {tabs &&
          tabs.map((tab, index) => {
            return (
              <li key={index}>
                <a href={tab.url}>{tab.title}</a>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default NewTab;
