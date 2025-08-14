const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onOpenSettings: (callback) => ipcRenderer.on('open-settings-modal', callback),
  onOpenAbout: (callback) => ipcRenderer.on('open-about-modal', callback),
  getLabelSettings: () => ipcRenderer.invoke('get-label-settings'),
  setLabelSettings: (settings) => ipcRenderer.invoke('set-label-settings', settings),
  isAutosaveEnabled: () => ipcRenderer.invoke('get-autosave-enabled'),
  getLastSavePath: () => ipcRenderer.invoke('get-last-save-path'),
  setLastSavePath: (newSavePath) => ipcRenderer.invoke('set-last-save-path', newSavePath), 
  generatePDF: (data) => ipcRenderer.invoke('generate-pdf', data),
  regeneratePDF: (data) => ipcRenderer.invoke('regenerate-pdf-invoke', data),
  onRegeneratePDF: (callback) => ipcRenderer.on('regenerate-pdf-trigger', callback),
  offRegeneratePDF: (callback) => ipcRenderer.removeListener('regenerate-pdf-trigger', callback),
  onAutosaveUpdated: (callback) => ipcRenderer.on('autosave-updated', (_, value) => callback(value)),
  offAutosaveUpdated: (callback) => ipcRenderer.removeListener('autosave-updated', callback),
  onPDFGenerationStarted: (callback) => {
    ipcRenderer.on('pdf-generation-started', callback);
  },
  offPDFGenerationStarted: (callback) => {
    ipcRenderer.removeListener('pdf-generation-started', callback);
  },
  writeToElectronStore: (settings) => ipcRenderer.send('write-to-electron-store', settings),
});


