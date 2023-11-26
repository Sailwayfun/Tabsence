const App = () => {
  function newTab() {
    chrome.tabs.create({ url: "newTab.html" });
  }
  function init() {
    chrome.runtime.sendMessage({ action: "signIn" }, (response) => {
      if (response.success && response.payload) {
        newTab();
        return;
      }
      alert("Please sign in to continue");
      return;
    });
  }
  return (
    <div className="flex h-60 w-80 flex-col gap-10 p-4">
      <h1 className="text-3xl font-bold underline">Tabsence</h1>
      <p className="text-2xl leading-8">Organize your tabs, and your life!</p>
      <div className="flex w-64 gap-3">
        <button
          className="mb-4 w-24 rounded-md border bg-white px-4 py-2 text-black hover:bg-gray-500 hover:text-white"
          onClick={newTab}
        >
          View tabs
        </button>
        <button
          onClick={init}
          className="mb-4 w-24 rounded-md border bg-black px-4 py-2 text-white hover:bg-gray-500 hover:text-white"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default App;
