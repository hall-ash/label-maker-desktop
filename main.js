import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import Store from 'electron-store';
import defaultSettings from './defaultSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({ defaults: defaultSettings });

const regeneratePDF = async (formData) => {
   return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, 'backend', '.venv', 'Scripts', 'python.exe');
    const pythonProcess = spawn(pythonPath, [
      path.join(__dirname, 'backend', 'src', 'generate_pdf.py'),
      JSON.stringify({ ...formData, save_path: store.get('lastSavePath') }),
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`stderr: ${error}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && result.startsWith('success')) {
        resolve({ status: 'success' });
      } else {
        resolve({ status: 'error', message: error.trim() || result });
      }
    });
   });
};

const generatePDF = async (formData) => {
  const autosaveEnabled = store.get('autosaveEnabled');
  const lastSavePath = store.get('lastSavePath');

  const savePath = (!autosaveEnabled || !lastSavePath) ? await showSavePDFDialog() : lastSavePath;
  if (!savePath) {
    return { status: 'canceled' };
  }

  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.send('pdf-generation-started');
  }

  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, 'backend', '.venv', 'Scripts', 'python.exe');
    const pythonProcess = spawn(pythonPath, [
      path.join(__dirname, 'backend', 'src', 'generate_pdf.py'),
      JSON.stringify({ ...formData, save_path: savePath }),
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`stderr: ${error}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && result.startsWith('success')) {
        resolve({ status: 'success' });
      } else {
        resolve({ status: 'error', message: error.trim() || result });
      }
    });
  });
};

const showSavePDFDialog = async () => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Change save location',
    defaultPath: store.get('lastSavePath'),
    filters: [ { name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) {
    return null;
  }
  const savePath = filePath.endsWith('.pdf') ? filePath : filePath + '.pdf'
  store.set('lastSavePath', savePath);

  return savePath;
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

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
              filters: [ { name: 'PDF Files', extensions: ['pdf'] }],
            });

            console.log('file dialog opened')

            if (canceled || !filePath) {
              return null;
            }
            store.set('lastSavePath', filePath.endsWith('.pdf') ? filePath : filePath + '.pdf');

            win.webContents.send('regenerate-pdf-trigger');

          }
        },
        {
          label: 'Remember last save location', // previously named autosave
          type: 'checkbox',
          checked: store.get('autosaveEnabled', false),
          click: (menuItem) => {
            store.set('autosaveEnabled', menuItem.checked);
            const win = BrowserWindow.getFocusedWindow();
            if (win) {
              win.webContents.send('autosave-updated', menuItem.checked);
            }
          }
        },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          },
        }
      ]
    },
    {
      label: 'Home',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents.send('navigate-to-home');
        }
      }
    },
    {
      label: 'Label Settings',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents.send('open-settings-modal');
        }
      }
    },
    {
      label: 'About',
      click: () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents.send('navigate-to-about');
        }
      }
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  ipcMain.handle('generate-pdf', async (event, formData) => await generatePDF(formData));

  ipcMain.handle('regenerate-pdf-invoke', async (event, formData) => await regeneratePDF(formData));

  ipcMain.handle('get-label-settings', () => {
    return store.get('labelSettings');
  });
  
  ipcMain.handle('set-label-settings', (_event, newSettings) => {
    store.set('labelSettings', newSettings);
  });

  ipcMain.handle('get-autosave-enabled', () => {
    return store.get('autosaveEnabled');
  });

  ipcMain.handle('get-last-save-path', () => {
    return store.get('lastSavePath');
  });

  ipcMain.handle('set-last-save-path', (_event, newSavePath) => {
    store.set('lastSavePath', newSavePath);
  });

  ipcMain.on('write-to-electron-store', (event, settings) => {
    store.set(settings);
  })

};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

