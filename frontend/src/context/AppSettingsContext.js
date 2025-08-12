import { createContext, useContext, useEffect, useState } from 'react';

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [labelSettings, setLabelSettings] = useState({
          hasBorder: false,
          fontSize: 12,
          padding: 1.75,
          textAnchor: 'middle',
        });
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [lastSavePath, setLastSavePath] = useState('');

  const {
    getLabelSettings,
    isAutosaveEnabled,
    getLastSavePath,
    onAutosaveUpdated,
    offAutosaveUpdated,
    writeToElectronStore,
  } = window.electron;

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [settings, autosave, savePath] = await Promise.all([
          getLabelSettings(),
          isAutosaveEnabled(),
          getLastSavePath(),
        ]);

        setLabelSettings(settings);
        setAutosaveEnabled(autosave);
        setLastSavePath(savePath);
      } catch (e) {
        console.error("Failed to load settings from Electron.", e);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const handleAutosaveUpdated = (_, value) => setAutosaveEnabled(value);
    onAutosaveUpdated(handleAutosaveUpdated);

    return () => offAutosaveUpdated(handleAutosaveUpdated);
  }, []);



  const updateLabelSettings = (newSettings) => {
    setLabelSettings(newSettings);
    writeToElectronStore({ labelSettings: newSettings });
  };

  return (
    <AppSettingsContext.Provider value={{
      labelSettings,
      updateLabelSettings,
      autosaveEnabled,
      lastSavePath,
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
};


export const useAppSettings = () => useContext(AppSettingsContext);