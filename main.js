import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { spawn } from "child_process";
import { execSync } from "child_process";
import crypto from "crypto";

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
// const licenseFile = path.join(process.env.APPDATA, "Shopee Automation", "license.json");
// const apiUrl = "http://localhost:5001/api/validate";

// // 🔑 Konfigurasi enkripsi
// const algorithm = "aes-256-cbc";
// const secretKey = "your-secret-key"; // Ganti dengan kunci rahasia yang aman
// const key = crypto.scryptSync(secretKey, "salt", 32); // 32 byte
// const iv = Buffer.alloc(16, 0); // IV harus 16 byte

// const cleanJsonFile = () => {
//   try {
//     let data = fs.readFileSync(licenseFile, "utf-8");

//     data = data.replace(/[\n\r]/g, "");

//     const jsonData = JSON.parse(data);

//     fs.writeFileSync(licenseFile, JSON.stringify(jsonData, null, 4));

//     console.log("license.json berhasil dibersihkan!");
//   } catch (error) {
//     console.error("Gagal membersihkan license.json:", error.message);
//   }
// };

// const encrypt = (text) => {
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return encrypted;
// };

// const decrypt = (text) => {
//   try {
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
//     let decrypted = decipher.update(text, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     return decrypted;
//   } catch (error) {
//     console.error("❌ Gagal mendekripsi:", error.message);
//     return null;
//   }
// };

// const encryptLicenseOnFirstRun = () => {
//   if (!fs.existsSync(licenseFile)) {
//     console.error("❌ license.json tidak ditemukan!");
//     return;
//   }

//   const rawData = fs.readFileSync(licenseFile, "utf-8");

//   try {
//     let jsonData = JSON.parse(rawData);

//     // Cek apakah data sudah terenkripsi sebelumnya
//     if (jsonData.encrypted) {
//       console.log("🔐 Lisensi sudah terenkripsi sebelumnya.");
//       return;
//     }

//     // Enkripsi data
//     const encryptedLicense = encrypt(JSON.stringify(jsonData));
//     fs.writeFileSync(licenseFile, JSON.stringify({ encrypted: true, data: encryptedLicense }, null, 2));
//     console.log("✅ Lisensi berhasil dienkripsi.");
//   } catch (error) {
//     console.error("❌ Gagal membaca atau mengenkripsi lisensi:", error.message);
//   }
// };

// const isOnline = async () => {
//   try {
//     const response = await fetch("https://www.google.com", { method: "HEAD", cache: "no-store" });
//     return response.ok;
//   } catch (error) {
//     return false;
//   }
// };

// const getMotherboardSerial = () => {
//   try {
//     const serial = execSync('powershell -Command "& { (Get-WmiObject Win32_BaseBoard).SerialNumber }"', { encoding: "utf-8" }).trim();
//     return serial;
//   } catch (error) {
//     console.error("Gagal mendapatkan serial motherboard:", error);
//     return null;
//   }
// };

// async function isLicenseValid() {
//   if (!fs.existsSync(licenseFile)) return false;

//   try {
//     // 🔽 Baca file lisensi terenkripsi
//     const licenseContent = fs.readFileSync(licenseFile, "utf-8");
//     const encryptedData = JSON.parse(licenseContent);

//     // 🔄 Dekripsi jika data sudah terenkripsi
//     let licenseData;
//     if (encryptedData.encrypted) {
//       const decryptedText = decrypt(encryptedData.data);
//       if (!decryptedText) {
//         console.error("❌ Gagal mendekripsi lisensi.");
//         return false;
//       }
//       licenseData = JSON.parse(decryptedText);
//     } else {
//       licenseData = encryptedData; // Jika belum dienkripsi, langsung gunakan
//     }

//     // 🔍 Validasi lisensi dengan API
//     const response = await fetch(`${apiUrl}/${licenseData.key}`);

//     if (!response.ok) {
//       console.error("❌ Lisensi tidak ditemukan atau tidak aktif");
//       return false;
//     }

//     const data = await response.json();

//     if (!data.success) {
//       console.error("❌ Lisensi tidak ditemukan atau tidak aktif");
//       return false;
//     }

//     // 🔍 Cek Device ID
//     const deviceId = getMotherboardSerial().trim();
//     if (licenseData.deviceId.trim() !== data.device_id.trim() && licenseData.deviceId.trim() !== deviceId) {
//       console.error("❌ Device ID tidak cocok");
//       return false;
//     }

//     console.log("Lisensi valid dan ditemukan");
//     return true;
//   } catch (error) {
//     console.error("❌ Error membaca atau mem-parsing file lisensi:", error.message);
//     return false;
//   }
// }

// const showLicenseError = () => {
//   dialog.showErrorBox("Lisensi Tidak Valid", "Lisensi Anda tidak valid atau tidak ditemukan. Harap periksa kembali atau hubungi dukungan.");
//   app.quit();
// };

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
  // mainWindow.webContents.on("devtools-opened", () => mainWindow.webContents.closeDevTools());
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
  // configWindow.webContents.on("devtools-opened", () => configWindow.webContents.closeDevTools());
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

      // Setelah config berhasil disimpan
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach((win) => {
        win.webContents.send("config-updated");
      });
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

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// app.on("ready", async () => {
//   cleanJsonFile();
//   encryptLicenseOnFirstRun();

//   let retryCount = 0;
//   while (!(await isOnline())) {
//     retryCount++;
//     const retry = dialog.showMessageBoxSync({
//       type: "error",
//       title: "Koneksi Internet Dibutuhkan",
//       message: "Silakan hubungkan perangkat ke internet untuk menggunakan aplikasi.",
//       buttons: ["Coba Lagi", "Keluar"],
//       defaultId: 0,
//     });

//     if (retry === 1 || retryCount >= 3) {
//       app.quit();
//       return;
//     }
//   }

//   // 🟢 Perbaikan: Tunggu hasil isLicenseValid()
//   const licenseValid = await isLicenseValid();
//   if (licenseValid) {
//     createWindow();
//   } else {
//     showLicenseError();
//   }
// });

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
