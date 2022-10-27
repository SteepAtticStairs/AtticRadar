const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let win

function createWindow() {
    // Create the browser window.
    //win = new BrowserWindow({ width: 800, height: 600 })
    win = new BrowserWindow({
        show: false,
        //icon: path.join(__dirname, 'logo.png'),
    });
    win.maximize();
    win.on('shown', () => { win.focus() });
    win.show();
    //win.webContents.openDevTools()

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
}
app.on('ready', createWindow)