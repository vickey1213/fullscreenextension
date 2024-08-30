let originalState = {};
let originalTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case "startAlarm":
      chrome.alarms.clear("reminderAlarm", () => {
        chrome.alarms.create("reminderAlarm", { periodInMinutes: 1 });
        sendResponse({ status: "Alarm started for all tabs" });
      });
      break;

    case "stopAlarm":
      chrome.alarms.clear("reminderAlarm", () => {
        sendResponse({ status: "Alarm stopped for all tabs" });
      });
      break;

    case "restoreWindow":
      chrome.tabs.remove(sender.tab.id);
      if (originalState.id) {
        chrome.windows.update(originalState.id, {
          state: originalState.state,
          focused: originalState.focused,
        });
      }
      chrome.tabs.update(originalTabId, { active: true });
      sendResponse({ status: "Tab closed and original tab focused" });
      break;

    default:
      console.warn("Unknown command received:", message.command);
  }
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reminderAlarm") {
    chrome.windows.getLastFocused((focusedWindow) => {
      if (focusedWindow.focused) {
        originalState = {
          id: focusedWindow.id,
          state: focusedWindow.state,
          focused: focusedWindow.focused,
        };

        chrome.tabs.query(
          { active: true, windowId: focusedWindow.id },
          (tabs) => {
            originalTabId = tabs[0].id;
            chrome.tabs.create(
              { url: chrome.runtime.getURL("reminder.html") },
              (newTab) => {
                chrome.windows.update(newTab.windowId, {
                  state: "fullscreen",
                  focused: true,
                });
              }
            );
          }
        );
      } else {
        console.log(
          "Chrome is not the active application. Skipping full-screen trigger."
        );
      }
    });
  }
});
