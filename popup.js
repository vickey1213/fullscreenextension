document.getElementById("startButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "startAlarm" }, (response) => {
      if (response.status === "Alarm started for all tabs") {
          alert("Reminder started!");
      }
  });
});

document.getElementById("stopButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "stopAlarm" }, (response) => {
      if (response.status === "Alarm stopped for all tabs") {
          alert("Reminder stopped!");
      }
  });
});
