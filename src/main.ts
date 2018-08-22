import { app, BrowserWindow } from 'electron'
import {enableLiveReload} from 'electron-compile';
import * as isDev from 'electron-is-dev';

if (isDev) {
  enableLiveReload();
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 900,
    height: 900
  })

  if (isDev) {
    window.webContents.openDevTools()
  }

  //Pass in any variables needed 
  (window as any).documentsPath = app.getPath('documents');
  
  window.loadFile('src/index.html');

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
