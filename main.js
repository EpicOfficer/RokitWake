const path = require('path');
const {app, ipcMain, Tray, Menu, BrowserWindow} = require ('electron');

const frequency = 10; // 10hz tone
const interval = 1500; // 25 minutes

let win;
let tray;

function createTray() {
    tray = new Tray(path.join(__dirname, 'tray.png'));

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Test', click: () => win.webContents.executeJavaScript(`playTone(${frequency});`)},
        {label: 'Exit', click:  function(){ app.quit(); } }
    ]);

    tray.setContextMenu(contextMenu);
}

function createWindow () {
    win = new BrowserWindow({
        width: 225,
        height: 175,
        show: false,
        resizable: false,
        autoHideMenuBar: true,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            backgroundThrottling: false
        }
    });

    win.loadURL(`data:text/html,
        <script>
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
            function playTone(freq) {
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                setTimeout(() => oscillator.stop(), 1000);
            }
        </script>
  `).then();
}

app.whenReady().then(() => {
    createTray();
    createWindow();

    win.webContents.executeJavaScript(`playTone(${frequency});`);
    setInterval(() => { win.webContents.executeJavaScript(`playTone(${frequency});`); }, interval * 1000);
})