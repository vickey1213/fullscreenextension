if (!document.getElementById("restReminderDialog")) {
  let overlay = document.createElement("div");
  overlay.id = "restReminderOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "black";
  overlay.style.zIndex = "9999999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  let dialog = document.createElement("div");
  dialog.id = "restReminderDialog";
  dialog.style.backgroundColor = "#ffffff";
  dialog.style.padding = "30px";
  dialog.style.borderRadius = "8px";
  dialog.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  dialog.style.textAlign = "center";
  dialog.style.maxWidth = "400px";
  dialog.style.width = "80%";

  let message = document.createElement("div");
  message.innerText = "You've been working too long. Time to take a rest!";
  message.style.marginBottom = "20px";
  message.style.color = "#333";
  dialog.appendChild(message);

  let okButton = document.createElement("button");
  okButton.innerText = "OK";
  okButton.style.padding = "10px 20px";
  okButton.style.fontSize = "18px";
  okButton.style.cursor = "pointer";
  okButton.style.border = "none";
  okButton.style.borderRadius = "4px";
  okButton.style.backgroundColor = "#4CAF50";
  okButton.style.color = "#fff";
  okButton.style.transition = "background-color 0.3s";

  okButton.addEventListener("mouseover", function () {
    okButton.style.backgroundColor = "#45a049";
  });

  okButton.addEventListener("mouseout", function () {
    okButton.style.backgroundColor = "#4CAF50";
  });

  okButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "restoreWindow" }, (response) => {
      overlay.remove();
      document.exitFullscreen();
    });
  });

  dialog.appendChild(okButton);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  function ensureFullscreen() {
    if (!document.fullscreenElement) {
      setTimeout(() => {
        enterFullscreen();
      }, 1000);
    }
  }

  document.addEventListener("fullscreenchange", ensureFullscreen);

  enterFullscreen();
}
