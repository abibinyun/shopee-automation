document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const statusElement = document.getElementById("status");
  const btnConfig = document.getElementById("configButton");

  startBtn.addEventListener("click", () => {
    window.electronAPI.startBot();
  });

  stopBtn.addEventListener("click", () => {
    window.electronAPI.stopBot();
  });

  btnConfig.addEventListener("click", () => {
    window.electronAPI.openConfig();
  });

  window.electronAPI.onBotStatus((event, { type, message }) => {
    statusElement.classList.remove("info", "success", "error");
    statusElement.classList.add(type);

    statusElement.innerHTML += `<div class="${type}">${message}</div>`;

    const logItems = statusElement.children;

    if (logItems.length > 1) {
      statusElement.removeChild(logItems[0]);
    }

    statusElement.scrollTop = statusElement.scrollHeight;
  });
});
