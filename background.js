let originalState = {};
let isReminderActive = false;
let reminderTabId = null;

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
      reminderTabId = null;
      chrome.tabs.remove(sender.tab.id);
      if (originalState.id) {
        chrome.windows.update(originalState.id, {
          state: originalState.state,
          focused: originalState.focused,
        });
      }
      sendResponse({ status: "Tab closed and original tab focused" });
      break;

    default:
      console.warn("Unknown command received:", message.command);
  }
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reminderAlarm") {
    chrome.windows.getAll({ populate: true }, (windows) => {
      let reminderTabExists = false;

      for (const window of windows) {
        for (const tab of window.tabs) {
          if (tab.url && tab.url.includes("reminder.html")) {
            reminderTabExists = true;
            reminderTabId = tab.id;
            break;
          }
        }
        if (reminderTabExists) break;
      }

      if (!reminderTabExists) {
        chrome.tabs.create(
          { url: chrome.runtime.getURL("reminder.html") },
          (newTab) => {
            isReminderActive = true;
            reminderTabId = newTab.id;
            chrome.windows.update(newTab.windowId, {
              state: "fullscreen",
              focused: true,
            });
          }
        );
      } else {
        console.log(
          "Reminder tab is already active. No new tab will be created."
        );
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabId === reminderTabId) {
    isReminderActive = false;
    reminderTabId = null;
  }
});
