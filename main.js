const path = require('path');
const {app, ipcMain, Tray, Menu, BrowserWindow} = require ('electron');

let win;
let tray;

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false
        }
    });

    win.on('close', function (event) {
        if (app.quitting) {
            win = null
        } else {
            event.preventDefault()
            win.hide()
        }
    })

    win.loadFile(path.join(__dirname, 'index.html')).then();

    win.webContents.once('dom-ready', () => {
        win.webContents.executeJavaScript('playTone(); setToneInterval();');
    });
}

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, 'tray.png'));

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Open', click: function() {win.show();}},
        {label: 'Exit', click: function() {
            app.quitting = true;
            app.quit();
        }}
    ]);
    
    tray.setContextMenu(contextMenu);
    
    createWindow();

    app.on('activate', () => {
        win.show();
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});