import { db } from "../firebase-config.ts";

const App = () => {
  console.log(db);
  function newTab() {
    chrome.tabs.create({ url: "newTab.html" });
  }
  return (
    <div className="flex h-60 w-80 flex-col gap-10 p-4">
      <h1 className="text-3xl font-bold underline">Tabsence</h1>
      <p className="text-2xl leading-8">Organize your tabs, and your life!</p>
      <button
        className="mb-4 w-24 rounded-md border bg-gray-500 px-4 py-2 text-white"
        onClick={newTab}
      >
        View tabs
      </button>
    </div>
  );
};

export default App;
