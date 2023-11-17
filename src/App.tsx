const App = () => {
  function newTab() {
    chrome.tabs.create({ url: "newTab.html" });
  }
  return (
    <>
      <h1 className="text-3xl font-bold underline">Tabsence</h1>
      <button className="w-24 px-4 py-2" onClick={newTab}>
        View tabs
      </button>
    </>
  );
};

export default App;
