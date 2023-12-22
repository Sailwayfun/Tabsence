const App = () => {
  function newTab() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "signIn" }, (response) => {
        if (response.success && response.userId) {
          resolve(chrome.tabs.create({ url: "newTab.html" }));
          return;
        }
        reject(console.log("Please sign in to continue"));
        return;
      });
    });
  }
  return (
    <div className="flex h-60 w-80 flex-col gap-10 p-4">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold">Tabsence</h1>
        <img src="/icons/tabs.png" alt="Tabsence" className="ml-4 h-12 w-12" />
      </div>
      <p className="text-2xl leading-8">Organize your tabs, and your life!</p>
      <div className="py-3">
        <button
          className="mb-4 w-full rounded-md border bg-orange-700 px-6 py-2 text-lg text-white opacity-80 hover:bg-orange-900"
          onClick={newTab}
        >
          View tabs
        </button>
      </div>
    </div>
  );
};

export default App;
