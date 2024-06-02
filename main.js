const path = require('path');
const {app, ipcMain, Tray, Menu, BrowserWindow} = require ('electron');

const frequency = 10; // 10hz tone
const interval = 1500; // 25 minutes

let win;
let tray;

function playTone() {
    return win.webContents.executeJavaScript(`playTone(${frequency});`);
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'tray.png'));

    const contextMenu = Menu.buildFromTemplate([
        {label: 'Test', click: () => playTone()},
        {label: 'Exit', click: () => app.quit()}
    ]);

    tray.setContextMenu(contextMenu);
}

function createWindow () {
    win = new BrowserWindow({
        show: false,
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
    `).then(() => {
        playTone();
        setInterval(playTone, interval * 1000);
    });
}

app.whenReady().then(() => {
    createTray();
    createWindow();
})