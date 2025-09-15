const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
// 使用绝对路径来确保在asar环境下也能正确加载模块
const { createNatServer, createNatClient, stopAllConnections } = require(path.join(__dirname, 'nat-service.js'))

// 保持对窗口对象的全局引用，如果不这样做，当JavaScript对象被垃圾回收时，窗口将会自动关闭
let mainWindow

function createWindow () {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载应用的 index.html
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 打开开发者工具
  // mainWindow.webContents.openDevTools()
}

// Electron 会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，通常会在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都被关闭时退出程序
app.on('window-all-closed', function () {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    stopAllConnections()
    app.quit()
  }
})

// 在这个文件中，你可以包含应用程序剩余的所有主进程代码
// 也可以拆分成几个文件，然后用 require 导入

// 处理来自渲染进程的消息
ipcMain.on('start-server', async (event, config) => {
  try {
    const result = await createNatServer(config)
    event.reply('server-started', result)
  } catch (error) {
    event.reply('server-error', { message: error.message })
  }
})

ipcMain.on('start-client', async (event, config) => {
  try {
    const result = await createNatClient(config)
    event.reply('client-started', result)
  } catch (error) {
    event.reply('client-error', { message: error.message })
  }
})

ipcMain.on('stop-connection', async (event, id) => {
  try {
    const result = await stopConnection(id)
    event.reply('connection-stopped', result)
  } catch (error) {
    event.reply('connection-error', { message: error.message })
  }
})

ipcMain.on('stop-all', async (event) => {
  try {
    const result = await stopAllConnections()
    event.reply('all-stopped', result)
  } catch (error) {
    event.reply('stop-all-error', { message: error.message })
  }
})