chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.action == "getTabs") {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      sendResponse({ tabs });
    });
    return true;
  }
});