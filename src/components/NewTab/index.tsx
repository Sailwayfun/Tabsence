import { useState, useEffect } from "react";
import { FieldValue } from "firebase/firestore";
import Spaces from "./Spaces";
import MoveToSpace from "./MoveToSpace";
interface Tab extends chrome.tabs.Tab {
  lastAccessed: FieldValue;
}
const NewTab = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [spaceNames, setSpaceNames] = useState<string[]>([]);
  const [activePopupId, setActivePopupId] = useState<string | undefined>();
  console.log("activePopupId", activePopupId);
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getTabs" }, function (response) {
      if (response) setTabs(response);
    });
    setSpaceNames([
      "Unsaved",
      "AppWorks School",
      "Family",
      "Game",
      "Trip",
      "Career",
      "Cooking",
      "Sports",
    ]);
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
  function openSpacesPopup(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const id = e.currentTarget.dataset.id;
    console.log("id", id);
    if (id) setActivePopupId(id);
  }
  return (
    <div className="flex w-full py-8">
      <Spaces spaceNames={spaceNames} />
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
                  <MoveToSpace
                    spaces={spaceNames}
                    id={tab.id?.toString()}
                    onOpenSpacesPopup={openSpacesPopup}
                  />
                  {tab.id === activePopupId && (
                    <div className="ml-5 h-14 w-52 rounded-md border px-3">
                      <label htmlFor={tab.id || "spaces"} className="text-xl">
                        Move to space:
                      </label>
                      <select id={tab.id || "spaces"}>
                        {spaceNames.map((spaceName) => (
                          <option value={spaceName} key={spaceName}>
                            {spaceName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default NewTab;
