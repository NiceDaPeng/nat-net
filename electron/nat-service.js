const net = require('net')
const { v4: uuidv4 } = require('uuid')

// 存储所有活跃的连接
const activeConnections = new Map()

/**
 * 创建内网穿透服务器
 * @param {Object} config - 服务器配置
 * @param {number} config.port - 服务器监听端口
 * @returns {Object} - 服务器信息
 */
exports.createNatServer = async function createNatServer(config) {
  return new Promise((resolve, reject) => {
    try {
      const serverId = uuidv4()
      const port = config.port || 8080
      
      const server = net.createServer((clientSocket) => {
        console.log(`客户端连接到服务器: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`)
        
        // 这里可以实现服务器的逻辑，例如解析客户端发送的数据，建立到目标服务器的连接等
        // 为了简化示例，我们只是回显客户端发送的数据
        clientSocket.on('data', (data) => {
          console.log(`从客户端接收数据: ${data.toString()}`)
          clientSocket.write(`服务器已接收您的数据: ${data.toString()}`)
        })
        
        clientSocket.on('end', () => {
          console.log('客户端断开连接')
        })
        
        clientSocket.on('error', (error) => {
          console.error(`客户端错误: ${error.message}`)
        })
      })
      
      server.listen(port, () => {
        console.log(`内网穿透服务器已启动，监听端口: ${port}`)
        
        const serverInfo = {
          id: serverId,
          type: 'server',
          port: port,
          status: 'running',
          startTime: new Date().toISOString()
        }
        
        activeConnections.set(serverId, {
          id: serverId,
          type: 'server',
          instance: server,
          config: config
        })
        
        resolve(serverInfo)
      })
      
      server.on('error', (error) => {
        console.error(`服务器错误: ${error.message}`)
        reject(error)
      })
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 创建内网穿透客户端
 * @param {Object} config - 客户端配置
 * @param {string} config.serverHost - 服务器主机地址
 * @param {number} config.serverPort - 服务器端口
 * @param {string} config.localHost - 本地服务主机地址
 * @param {number} config.localPort - 本地服务端口
 * @returns {Object} - 客户端信息
 */
exports.createNatClient = async function createNatClient(config) {
  return new Promise((resolve, reject) => {
    try {
      const clientId = uuidv4()
      const { serverHost, serverPort, localHost, localPort } = config
      
      if (!serverHost || !serverPort || !localHost || !localPort) {
        throw new Error('服务器地址、服务器端口、本地地址和本地端口是必需的')
      }
      
      // 连接到远程服务器
      const serverSocket = net.connect(serverPort, serverHost, () => {
        console.log(`客户端已连接到服务器: ${serverHost}:${serverPort}`)
        
        // 向服务器发送客户端信息
        serverSocket.write(JSON.stringify({
          type: 'client-connect',
          localHost: localHost,
          localPort: localPort
        }))
        
        const clientInfo = {
          id: clientId,
          type: 'client',
          serverHost: serverHost,
          serverPort: serverPort,
          localHost: localHost,
          localPort: localPort,
          status: 'connected',
          startTime: new Date().toISOString()
        }
        
        activeConnections.set(clientId, {
          id: clientId,
          type: 'client',
          instance: serverSocket,
          config: config
        })
        
        resolve(clientInfo)
      })
      
      serverSocket.on('data', (data) => {
        console.log(`从服务器接收数据: ${data.toString()}`)
        
        // 这里可以实现客户端的逻辑，例如将服务器发送的数据转发到本地服务
        // 为了简化示例，我们只是打印接收到的数据
      })
      
      serverSocket.on('end', () => {
        console.log('与服务器的连接已断开')
        activeConnections.delete(clientId)
      })
      
      serverSocket.on('error', (error) => {
        console.error(`客户端错误: ${error.message}`)
        activeConnections.delete(clientId)
        reject(error)
      })
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 停止特定的连接
 * @param {string} id - 连接ID
 * @returns {Object} - 停止结果
 */
exports.stopConnection = async function stopConnection(id) {
  return new Promise((resolve, reject) => {
    try {
      const connection = activeConnections.get(id)
      
      if (!connection) {
        throw new Error(`未找到ID为 ${id} 的连接`)
      }
      
      if (connection.type === 'server') {
        connection.instance.close(() => {
          console.log(`服务器连接已停止: ${id}`)
          activeConnections.delete(id)
          resolve({ success: true, id: id, message: '连接已成功停止' })
        })
      } else if (connection.type === 'client') {
        connection.instance.end(() => {
          console.log(`客户端连接已停止: ${id}`)
          activeConnections.delete(id)
          resolve({ success: true, id: id, message: '连接已成功停止' })
        })
      }
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 停止所有连接
 * @returns {Object} - 停止结果
 */
exports.stopAllConnections = async function stopAllConnections() {
  return new Promise((resolve) => {
    try {
      const connectionIds = Array.from(activeConnections.keys())
      
      connectionIds.forEach(id => {
        const connection = activeConnections.get(id)
        if (connection) {
          if (connection.type === 'server') {
            connection.instance.close()
          } else if (connection.type === 'client') {
            connection.instance.end()
          }
          activeConnections.delete(id)
        }
      })
      
      console.log(`已停止所有连接，共 ${connectionIds.length} 个连接`)
      resolve({
        success: true,
        count: connectionIds.length,
        message: `已成功停止所有 ${connectionIds.length} 个连接`
      })
      
    } catch (error) {
      console.error(`停止所有连接时出错: ${error.message}`)
      resolve({
        success: false,
        message: error.message
      })
    }
  })
}

/**
 * 获取所有活跃连接
 * @returns {Array} - 活跃连接列表
 */
exports.getActiveConnections = function getActiveConnections() {
  const connections = []
  
  activeConnections.forEach((connection, id) => {
    connections.push({
      id: id,
      type: connection.type,
      config: connection.config,
      status: connection.type === 'server' ? 'running' : 'connected'
    })
  })
  
  return connections
}