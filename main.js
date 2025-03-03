import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let configWindow = null;
let runningProcess = null;
let mouseTrackingProcess = null;

const isDevelopment = process.env.NODE_ENV === "development";
const resourcesPath = process.resourcesPath;
const dataPath = isDevelopment ? path.join(__dirname, "data") : path.join(resourcesPath, "data");
const configJsonPath = path.join(dataPath, "sys", "config.json");
const appLogPath = path.join(dataPath, "app.log");
const pythonGetCookiesPath = isDevelopment ? path.resolve(__dirname, "./script/get_cookies.py") : path.join(resourcesPath, "bin", "get_cookies", "get_cookies.exe");
const pythonMainPath = isDevelopment ? path.resolve(__dirname, "./script/main.py") : path.join(resourcesPath, "bin", "main", "main.exe");

const logToFile = (message, level = "info") => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] main.js ${message}\n`;
  fs.appendFile(appLogPath, logMessage, (err) => {
    if (err) console.error("Gagal menulis log:", err);
  });
  if (isDevelopment) console.log(logMessage.trim());
};

const createWindow = () => {
  logToFile("Aplikasi dimulai");
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "./script/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, "./view/index.html"));
  mainWindow.on("closed", () => {
    logToFile("Jendela utama ditutup");
    mainWindow = null;
  });
};

const sendBotStatus = (type, message) => {
  if (mainWindow) {
    mainWindow.webContents.send("bot-status", { type, message });
  }
};

const startBot = () => {
  const command = isDevelopment ? "python" : pythonMainPath;
  const args = isDevelopment ? [pythonMainPath] : [dataPath];

  if (!fs.existsSync(pythonMainPath)) {
    return logToFile(`Script tidak ditemukan di: ${pythonMainPath}`, "error");
  }

  runningProcess = spawn(command, args);
  runningProcess.stdout.on("data", (data) => sendBotStatus("info", data.toString().trim()));
  runningProcess.stderr.on("data", (data) => sendBotStatus("error", data.toString().trim()));
  runningProcess.on("close", (code) => {
    sendBotStatus(code === 0 ? "success" : "error", `Bot exited with code ${code}`);
    runningProcess = null;
  });
};

const stopBot = () => {
  if (runningProcess) {
    runningProcess.kill("SIGTERM");
    sendBotStatus("info", "Bot stopped");
    runningProcess = null;
  } else {
    sendBotStatus("info", "No bot running to stop");
  }
};

const openConfigWindow = () => {
  if (configWindow) return;
  configWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "./script/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  configWindow.setMenuBarVisibility(false);
  configWindow.loadFile(path.join(__dirname, "./view/config.html"));
  configWindow.on("closed", () => {
    configWindow = null;
    stopTracking();
  });
};

const loadConfig = () => {
  if (fs.existsSync(configJsonPath)) {
    return JSON.parse(fs.readFileSync(configJsonPath, "utf-8"));
  }
  return {}; // Return objek kosong jika file tidak ditemukan
};

const startTracking = (event, arg) => {
  if (!mouseTrackingProcess) {
    let command;
    let args;

    const pythonMouseTrackerPath = isDevelopment ? path.resolve(__dirname, "./script/mouse_tracker.py") : path.join(resourcesPath, "bin", "mouse_tracker", "mouse_tracker.exe");

    if (isDevelopment) {
      command = "python";
      args = [pythonMouseTrackerPath];
    } else {
      command = pythonMouseTrackerPath;
      args = [dataPath];
    }

    console.log(`Starting process with command: ${command}, args: ${args}`);

    mouseTrackingProcess = spawn(command, args);

    mouseTrackingProcess.stdout.on("data", (data) => {
      try {
        const position = JSON.parse(data.toString());
        if (position && typeof position.x === "number" && typeof position.y === "number") {
          event.reply("mouse-position", position);
        } else {
          console.error("Invalid position data:", position);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    mouseTrackingProcess.on("error", (err) => {
      console.error("Failed to start subprocess:", err);
      mouseTrackingProcess = null;
    });

    mouseTrackingProcess.stdin.write("start\n"); // Kirim perintah "start" ke Python
  }
};

const stopTracking = () => {
  if (mouseTrackingProcess) {
    mouseTrackingProcess.stdin.write("stop\n"); // Kirim perintah "stop" ke Python
    mouseTrackingProcess.kill(); // Hentikan proses
    mouseTrackingProcess = null;
  }
};

const selectFile = async () => {
  const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "Excel Files", extensions: ["xlsx"] }] });
  return result.canceled ? null : result.filePaths[0];
};

const updateConfig = (newData) => {
  fs.readFile(configJsonPath, "utf8", (err, data) => {
    let configData = {};
    if (!err) {
      try {
        configData = JSON.parse(data);
      } catch {
        return sendBotStatus("error", "Error parsing config.json");
      }
    }
    configData = { ...configData, ...newData };
    fs.writeFile(configJsonPath, JSON.stringify(configData, null, 4), (writeErr) => {
      if (writeErr) return sendBotStatus("error", "Error writing config.json");
      sendBotStatus("success", "Config updated successfully!");
    });
  });

  let command;
  let args = [];
  let childProcess;

  if (isDevelopment) {
    command = "python";
    args = [pythonGetCookiesPath];
  } else {
    command = pythonGetCookiesPath;
    args = [dataPath];
  }

  childProcess = spawn(command, args);

  childProcess.stdout.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      logToFile(`get_cookies stdout: ${output}`);
      sendBotStatus("info", `Python Output: ${output}`);
    }
  });

  childProcess.stderr.on("data", (data) => {
    const error = data.toString().trim();
    if (error) {
      logToFile(`get_cookies stderr: ${error}`, "error");
      sendBotStatus("error", `Error Python Output: ${error}`);
    }
  });

  childProcess.on("close", (code) => {
    if (code === 0) {
      logToFile("get_cookies berhasil dijalankan");
      sendBotStatus("success", "Config update successfully!");
    } else {
      const errorMessage = `get_cookies gagal dengan kode: ${code}`;
      logToFile(errorMessage, "error");
      sendBotStatus("error", errorMessage);
    }
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("start-bot", startBot);
ipcMain.on("stop-bot", stopBot);
ipcMain.on("start-tracking", startTracking);
ipcMain.on("stop-tracking", stopTracking);
ipcMain.handle("load-config", loadConfig);
ipcMain.on("open-config", openConfigWindow);
ipcMain.handle("selectFile", selectFile);
ipcMain.on("save-config", (_, configData) => updateConfig(configData));
