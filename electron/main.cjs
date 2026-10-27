const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  const iconPngPath = path.join(__dirname, '../build/icon.png');
  const hasIcon = fs.existsSync(iconPngPath);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'PrivaPDF — Studio Konversi & Manipulasi PDF Offline',
    backgroundColor: '#0f172a',
    ...(hasIcon ? { icon: iconPngPath } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (process.platform === 'darwin' && app.dock && hasIcon) {
    try {
      app.dock.setIcon(iconPngPath);
    } catch (e) {
      // Ignore if dock setIcon fails
    }
  }

  // Load the production build
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath);

  // Set standard application menu
  const menuTemplate = [
    {
      label: 'PrivaPDF',
      submenu: [
        { label: 'Tentang PrivaPDF', role: 'about' },
        { type: 'separator' },
        { label: 'Keluar', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        { label: 'Select All', role: 'selectAll' },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { label: 'Reload', role: 'reload' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
