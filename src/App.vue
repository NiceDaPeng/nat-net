<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 应用状态
const mode = ref('server') // 'server' 或 'client'
const isConnected = ref(false)
const connectionStatus = ref('未连接')
const statusClass = ref('status-disconnected')
const connectionInfo = ref(null)
const activeConnections = ref([])
const logs = ref(['应用已启动'])  // 日志信息

// 服务器配置
const serverConfig = ref({
  port: 8080
})

// 客户端配置
const clientConfig = ref({
  serverHost: 'localhost',
  serverPort: 8080,
  localHost: 'localhost',
  localPort: 3000
})

// 添加日志
function addLog(message) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  // 限制日志数量，避免内存占用过多
  if (logs.value.length > 100) {
    logs.value.pop()
  }
}

// 模式切换
function switchMode(newMode) {
  mode.value = newMode
  addLog(`已切换到${newMode === 'server' ? '服务器' : '客户端'}模式`)
}

// 启动服务器
function startServer() {
  if (typeof window.electronAPI === 'undefined') {
    addLog('错误: 无法连接到Electron主进程')
    return
  }
  
  addLog(`正在启动服务器，监听端口: ${serverConfig.value.port}`)
  window.electronAPI.startServer(serverConfig.value)
}

// 启动客户端
function startClient() {
  if (typeof window.electronAPI === 'undefined') {
    addLog('错误: 无法连接到Electron主进程')
    return
  }
  
  addLog(`正在连接到服务器: ${clientConfig.value.serverHost}:${clientConfig.value.serverPort}`)
  addLog(`本地服务: ${clientConfig.value.localHost}:${clientConfig.value.localPort}`)
  window.electronAPI.startClient(clientConfig.value)
}

// 停止连接
function stopConnection() {
  if (typeof window.electronAPI === 'undefined' || !connectionInfo.value) {
    return
  }
  
  addLog(`正在停止连接: ${connectionInfo.value.id}`)
  window.electronAPI.stopConnection(connectionInfo.value.id)
}

// 停止所有连接
function stopAll() {
  if (typeof window.electronAPI === 'undefined') {
    return
  }
  
  addLog('正在停止所有连接')
  window.electronAPI.stopAll()
}

// 事件监听器设置
function setupEventListeners() {
  if (typeof window.electronAPI === 'undefined') {
    return
  }
  
  // 服务器事件
  window.electronAPI.onServerStarted((result) => {
    addLog(`服务器已成功启动，监听端口: ${result.port}`)
    connectionInfo.value = result
    isConnected.value = true
    connectionStatus.value = '服务器运行中'
    statusClass.value = 'status-connected'
  })
  
  window.electronAPI.onServerError((error) => {
    addLog(`服务器启动失败: ${error.message}`)
    isConnected.value = false
    connectionStatus.value = '启动失败'
    statusClass.value = 'status-error'
  })
  
  // 客户端事件
  window.electronAPI.onClientStarted((result) => {
    addLog(`客户端已成功连接到服务器`)
    connectionInfo.value = result
    isConnected.value = true
    connectionStatus.value = '客户端已连接'
    statusClass.value = 'status-connected'
  })
  
  window.electronAPI.onClientError((error) => {
    addLog(`客户端连接失败: ${error.message}`)
    isConnected.value = false
    connectionStatus.value = '连接失败'
    statusClass.value = 'status-error'
  })
  
  // 连接停止事件
  window.electronAPI.onConnectionStopped((result) => {
    addLog(`连接已停止: ${result.id}`)
    isConnected.value = false
    connectionStatus.value = '已停止'
    statusClass.value = 'status-disconnected'
    connectionInfo.value = null
  })
  
  window.electronAPI.onConnectionError((error) => {
    addLog(`停止连接时出错: ${error.message}`)
  })
  
  // 停止所有连接事件
  window.electronAPI.onAllStopped((result) => {
    addLog(`所有连接已停止，共 ${result.count} 个连接`)
    isConnected.value = false
    connectionStatus.value = '已停止'
    statusClass.value = 'status-disconnected'
    connectionInfo.value = null
  })
  
  window.electronAPI.onStopAllError((error) => {
    addLog(`停止所有连接时出错: ${error.message}`)
  })
}

// 移除所有事件监听器
function removeEventListeners() {
  if (typeof window.electronAPI !== 'undefined') {
    window.electronAPI.removeAllListeners()
  }
}

// 组件挂载时设置事件监听器
onMounted(() => {
  setupEventListeners()
  addLog('界面已加载完成')
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  removeEventListeners()
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Nat-Net</h1>
      <div class="status-indicator">
        <span class="status-label">状态:</span>
        <span :class="['status-badge', statusClass]">{{ connectionStatus }}</span>
      </div>
    </header>

    <main class="app-main">
      <!-- 模式切换 -->
      <div class="mode-switcher">
        <button 
          :class="['mode-btn', { active: mode === 'server' }]"
          @click="switchMode('server')"
        >
          服务器模式
        </button>
        <button 
          :class="['mode-btn', { active: mode === 'client' }]"
          @click="switchMode('client')"
        >
          客户端模式
        </button>
      </div>

      <!-- 配置表单 -->
      <div class="config-form">
        <!-- 服务器配置 -->
        <div v-if="mode === 'server'" class="config-section">
          <h3>服务器配置</h3>
          <div class="form-group">
            <label for="server-port">监听端口:</label>
            <input 
              id="server-port"
              v-model.number="serverConfig.port"
              type="number"
              min="1"
              max="65535"
              placeholder="8080"
            />
          </div>
          <div class="action-buttons">
            <button 
              class="btn-primary"
              @click="startServer"
              :disabled="isConnected"
            >
              启动服务器
            </button>
          </div>
        </div>

        <!-- 客户端配置 -->
        <div v-else class="config-section">
          <h3>客户端配置</h3>
          <div class="form-group">
            <label for="server-host">服务器地址:</label>
            <input 
              id="server-host"
              v-model="clientConfig.serverHost"
              type="text"
              placeholder="服务器IP或域名"
            />
          </div>
          <div class="form-group">
            <label for="server-port">服务器端口:</label>
            <input 
              id="server-port"
              v-model.number="clientConfig.serverPort"
              type="number"
              min="1"
              max="65535"
              placeholder="8080"
            />
          </div>
          <div class="form-group">
            <label for="local-host">本地服务地址:</label>
            <input 
              id="local-host"
              v-model="clientConfig.localHost"
              type="text"
              placeholder="localhost"
            />
          </div>
          <div class="form-group">
            <label for="local-port">本地服务端口:</label>
            <input 
              id="local-port"
              v-model.number="clientConfig.localPort"
              type="number"
              min="1"
              max="65535"
              placeholder="3000"
            />
          </div>
          <div class="action-buttons">
            <button 
              class="btn-primary"
              @click="startClient"
              :disabled="isConnected"
            >
              连接服务器
            </button>
          </div>
        </div>

        <!-- 连接控制 -->
        <div v-if="isConnected" class="connection-control">
          <button class="btn-danger" @click="stopConnection">
            停止当前连接
          </button>
          <button class="btn-warning" @click="stopAll">
            停止所有连接
          </button>
        </div>
      </div>

      <!-- 日志区域 -->
      <div class="logs-section">
        <h3>操作日志</h3>
        <div class="logs-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>DPW：Nat-Net@{{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.app-header {
  background-color: #1e40af;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-weight: bold;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-connected {
  background-color: #10b981;
  color: white;
}

.status-disconnected {
  background-color: #6b7280;
  color: white;
}

.status-error {
  background-color: #ef4444;
  color: white;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.mode-switcher {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: transparent;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background-color: #f3f4f6;
}

.mode-btn.active {
  background-color: #1e40af;
  color: white;
}

.config-form {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.config-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.connection-control {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-warning {
  padding: 0.75rem 1.5rem;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-warning:hover {
  background-color: #d97706;
}

.logs-section {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 300px;
  display: flex;
  flex-direction: column;
}

.logs-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.25rem;
}

.logs-container {
  flex: 1;
  overflow-y: auto;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.log-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-family: monospace;
  font-size: 0.875rem;
  color: #374151;
}

.log-item:last-child {
  border-bottom: none;
}

.app-footer {
  background-color: #1f2937;
  color: #9ca3af;
  padding: 1rem 2rem;
  text-align: center;
}

.app-footer p {
  margin: 0;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .mode-switcher {
    flex-direction: column;
  }
  
  .action-buttons,
  .connection-control {
    flex-direction: column;
  }
  
  .logs-section {
    height: 200px;
  }
}
</style>
