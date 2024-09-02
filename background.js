let originalState = {};
let originalTabId = null;
let isReminderActive = false;

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
      isReminderActive = false;
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
      if (focusedWindow.focused && !isReminderActive) {
        originalState = {
          id: focusedWindow.id,
          state: focusedWindow.state,
          focused: focusedWindow.focused,
        };

        chrome.tabs.query(
          { active: true, windowId: focusedWindow.id },
          (tabs) => {
            if (tabs.length > 0) {
              originalTabId = tabs[0].id;
              chrome.tabs.create(
                { url: chrome.runtime.getURL("reminder.html") },
                (newTab) => {
                  isReminderActive = true;
                  chrome.windows.update(newTab.windowId, {
                    state: "fullscreen",
                    focused: true,
                  });
                }
              );
            }
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

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (isReminderActive && windowId === chrome.windows.WINDOW_ID_NONE) {
    setTimeout(() => {
      chrome.windows.update(originalState.id, {
        state: "fullscreen",
        focused: true,
      });
    }, 1000);
  }
});

chrome.windows.onBoundsChanged.addListener((window) => {
  if (isReminderActive && window.state !== "fullscreen") {
    chrome.windows.update(window.id, {
      state: "fullscreen",
      focused: true,
    });
  }
});
