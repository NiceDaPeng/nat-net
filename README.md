# Nat-Net 内网穿透工具

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/)
[![Electron](https://img.shields.io/badge/Electron-v32.0.0-blue.svg)](https://www.electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-v3.5.18-green.svg)](https://vuejs.org/)

一个基于 Node.js、Vue 3 和 Electron 开发的跨平台内网穿透工具，让您轻松实现本地服务的外网访问。

## ⚠️ 免责声明

使用本工具请严格遵守您所在地的法律法规。对于因使用本工具而产生的任何直接或间接损失、数据泄露、安全问题等，开发者不承担任何责任。本工具仅用于学习和技术研究目的，请勿用于任何非法用途。

## 🚀 功能特点

- **双模式支持**：提供服务器模式和客户端模式
- **可视化界面**：基于 Vue 3 构建的现代化用户界面
- **跨平台兼容**：支持 Windows、macOS 和 Linux 操作系统
- **实时日志**：显示详细的连接状态和操作日志
- **简单配置**：只需几步即可完成内网穿透设置

## 📋 系统要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- 支持的操作系统：Windows 10/11、macOS 10.15+、Ubuntu 20.04+ 等

## 🛠️ 安装步骤

1. 克隆仓库（如适用）或下载源代码

2. 安装依赖
   
   ```bash
   npm install
   ```

3. 开发模式运行
   
   ```bash
   npm run electron:dev
   ```

4. 构建应用程序
   
   ```bash
   npm run electron:build
   ```

构建后的应用程序将位于 `dist-electron` 目录中。

## 📖 使用指南

### 服务器模式

1. 选择"服务器模式"选项卡
2. 输入要监听的端口号（默认为 8080）
3. 点击"启动服务器"按钮
4. 服务器启动后，您将看到"服务器运行中"的状态提示

### 客户端模式

1. 选择"客户端模式"选项卡
2. 输入服务器地址和端口号（为公网服务器的地址和端口）
3. 输入本地服务地址和端口号（为您想要穿透的本地服务地址和端口）
4. 点击"连接服务器"按钮
5. 连接成功后，您将看到"客户端已连接"的状态提示

### 连接管理

- 点击"停止当前连接"按钮可以停止当前活动的连接
- 点击"停止所有连接"按钮可以停止所有活动的连接

## 📁 项目结构

```
├── electron/            # Electron 主进程代码
│   ├── main.js          # 主进程入口文件
│   ├── preload.js       # 预加载脚本
│   └── nat-service.js   # 内网穿透核心服务
├── src/                 # Vue 前端代码
│   ├── App.vue          # 主应用组件
│   ├── main.js          # Vue 入口文件
│   └── style.css        # 全局样式
├── package.json         # 项目配置和依赖
└── vite.config.js       # Vite 配置文件
```

## 🔧 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **桌面应用框架**：Electron
- **网络通信**：Node.js net 模块
- **UI 样式**：自定义 CSS

## 🤝 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

如有任何问题或建议，请随时联系我们。

## ⚠️ 注意事项

- 请确保您的服务器有公网 IP 地址，否则无法实现内网穿透
- 生产环境中，请配置适当的防火墙规则和安全措施
- 长时间运行可能会消耗较多网络带宽，请合理配置

---

116| Made with ❤️ by DPW
