const { contextBridge, ipcRenderer } = require('electron')

// 在上下文桥中暴露安全的API，供渲染进程使用
contextBridge.exposeInMainWorld('electronAPI', {
  // 服务器相关API
  startServer: (config) => ipcRenderer.send('start-server', config),
  onServerStarted: (callback) => ipcRenderer.on('server-started', (event, result) => callback(result)),
  onServerError: (callback) => ipcRenderer.on('server-error', (event, error) => callback(error)),
  
  // 客户端相关API
  startClient: (config) => ipcRenderer.send('start-client', config),
  onClientStarted: (callback) => ipcRenderer.on('client-started', (event, result) => callback(result)),
  onClientError: (callback) => ipcRenderer.on('client-error', (event, error) => callback(error)),
  
  // 连接管理
  stopConnection: (id) => ipcRenderer.send('stop-connection', id),
  onConnectionStopped: (callback) => ipcRenderer.on('connection-stopped', (event, result) => callback(result)),
  onConnectionError: (callback) => ipcRenderer.on('connection-error', (event, error) => callback(error)),
  
  // 全部停止
  stopAll: () => ipcRenderer.send('stop-all'),
  onAllStopped: (callback) => ipcRenderer.on('all-stopped', (event, result) => callback(result)),
  onStopAllError: (callback) => ipcRenderer.on('stop-all-error', (event, error) => callback(error)),
  
  // 移除监听器
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('server-started')
    ipcRenderer.removeAllListeners('server-error')
    ipcRenderer.removeAllListeners('client-started')
    ipcRenderer.removeAllListeners('client-error')
    ipcRenderer.removeAllListeners('connection-stopped')
    ipcRenderer.removeAllListeners('connection-error')
    ipcRenderer.removeAllListeners('all-stopped')
    ipcRenderer.removeAllListeners('stop-all-error')
  }
})

// 提供一些系统信息
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  version: process.version
})