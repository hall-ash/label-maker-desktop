// main.js (ESM)
import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import Store from 'electron-store';
import defaultSettings from './defaultSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const store = new Store({ defaults: defaultSettings });

/**
 * Resolve the Python "worker" command and args depending on env:
 *  - Dev: run venv's python with the source script
 *  - Prod: run the bundled PyInstaller binary placed via extraResources at resourcesPath/worker/worker(.exe)
 */
const getWorkerInvocation = (extraArgJsonString) => {
  if (isDev) {
    // Adjust this path if your venv lives elsewhere
    const pyExe = path.join(__dirname, 'backend', '.venv', 'Scripts', 'python.exe'); // Windows venv
    const script = path.join(__dirname, 'backend', 'src', 'generate_pdf.py');
    return { cmd: pyExe, args: [script, extraArgJsonString] };
  } else {
    const bin = process.platform === 'win32' ? 'worker.exe' : 'worker';
    const workerPath = path.join(process.resourcesPath, 'worker', bin);
    return { cmd: workerPath, args: [extraArgJsonString] };
  }
}

/**
 * Spawn helper: runs the worker once, returns { status, message }
 */
const runWorker = (payloadObj) => {
  return new Promise((resolve) => {
    const jsonArg = JSON.stringify(payloadObj ?? {});
    const { cmd, args } = getWorkerInvocation(jsonArg);

    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let out = '';
    let err = '';

    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));

    child.on('close', (code) => {
      // Prints 'success' to stdout on success and exits 0
      if (code === 0 && out.trim().startsWith('success')) {
        resolve({ status: 'success' });
      } else {
        const message = (err || out || '').trim() || `Worker exited with code ${code}`;
        resolve({ status: 'error', message });
      }
    });
  });
}

/**
 * Dialog for selecting a save path (stores normalized *.pdf back to electron-store)
 */
const showSavePDFDialog = async () => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Change save location',
    defaultPath: store.get('lastSavePath'),
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) return null;

  const savePath = filePath.endsWith('.pdf') ? filePath : `${filePath}.pdf`;
  store.set('lastSavePath', savePath);
  return savePath;
}

/**
 * Public API: generate a PDF (prompts for save path if "remember" is off or unset)
 */
const generatePDF = async (formData) => {
  const autosaveEnabled = store.get('autosaveEnabled');
  const lastSavePath = store.get('lastSavePath');

  const savePath = (!autosaveEnabled || !lastSavePath) ? await showSavePDFDialog() : lastSavePath;
  if (!savePath) return { status: 'canceled' };

  const win = BrowserWindow.getFocusedWindow();
  if (win) win.webContents.send('pdf-generation-started');

  // Merge save_path into payload passed to the worker
  return runWorker({ ...formData, save_path: savePath });
}

/**
 * Public API: regenerate using existing lastSavePath without prompting
 */
const regeneratePDF = async (formData) => {
  const savePath = store.get('lastSavePath');
  if (!savePath) {
    // Fallback to normal flow if we somehow don’t have one
    return generatePDF(formData);
  }
  return runWorker({ ...formData, save_path: savePath });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 650,
    icon: path.join(__dirname, 'label-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL || "http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
    mainWindow.removeMenu();
  }

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Save pdf',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;

            const { canceled, filePath } = await dialog.showSaveDialog({
              title: 'Change save location',
              defaultPath: store.get('lastSavePath'),
              filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
            });
            if (canceled || !filePath) return;

            const normalized = filePath.endsWith('.pdf') ? filePath : `${filePath}.pdf`;
            store.set('lastSavePath', normalized);

            // Tell renderer to re-run with the new path
            win.webContents.send('regenerate-pdf-trigger');
          },
        },
        {
          // Renamed for clarity: this just remembers a path; generation still asks renderer to do work
          label: 'Remember last save location',
          type: 'checkbox',
          checked: store.get('autosaveEnabled', false),
          click: (menuItem) => {
            store.set('autosaveEnabled', menuItem.checked);
            const win = BrowserWindow.getFocusedWindow();
            if (win) win.webContents.send('autosave-updated', menuItem.checked);
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Home',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.webContents.send('navigate-to-home');
      },
    },
    {
      label: 'Label Settings',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.webContents.send('open-settings-modal');
      },
    },
    {
      label: 'About',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.webContents.send('navigate-to-about');
      },
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // IPC handlers
  ipcMain.handle('generate-pdf', async (_event, formData) => generatePDF(formData));
  ipcMain.handle('regenerate-pdf-invoke', async (_event, formData) => regeneratePDF(formData));

  ipcMain.handle('get-label-settings', () => store.get('labelSettings'));
  ipcMain.handle('set-label-settings', (_event, newSettings) => {
    store.set('labelSettings', newSettings);
  });

  ipcMain.handle('get-autosave-enabled', () => store.get('autosaveEnabled'));
  ipcMain.handle('get-last-save-path', () => store.get('lastSavePath'));
  ipcMain.handle('set-last-save-path', (_event, newSavePath) => {
    store.set('lastSavePath', newSavePath);
  });

  ipcMain.on('write-to-electron-store', (_event, settings) => {
    // settings should be an object, e.g. { labelSettings: {...} }
    store.set(settings);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
