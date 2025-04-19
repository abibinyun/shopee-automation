document.addEventListener("DOMContentLoaded", async () => {
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

  window.electronAPI?.onConfigUpdated?.(() => {
    window.electronAPI.loadConfig().then((config) => {
      const startBtn = document.getElementById("start-btn");
      if (config?.token) {
        startBtn?.removeAttribute("disabled");
      }
    });
  });

  try {
    const config = await window.electronAPI.loadConfig();
    if (config && config.token) {
      startBtn.removeAttribute("disabled");
    } else {
      startBtn.setAttribute("disabled", "true");
    }
  } catch (error) {
    console.error("Gagal load config:", error);
    startBtn.setAttribute("disabled", "true");
  }
});
