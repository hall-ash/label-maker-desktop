import path from 'path';
import os from 'os';

const defaultSettings = {
  autosaveEnabled: false,
  lastSavePath: path.join(os.homedir(), 'Downloads', 'labels.pdf'), // save to downloads folder on user's computer
  labelSettings: {
    hasBorder: false,
    fontSize: 12,
    padding: 1.75,
    textAnchor: 'middle',
  },
};


export default defaultSettings;