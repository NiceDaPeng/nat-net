const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 构建目录路径
const distElectronPath = path.join(__dirname, '..', 'dist-electron');
const natServiceSourcePath = path.join(__dirname, '..', 'electron', 'nat-service.js');
const natServiceDestPath = path.join(distElectronPath, 'nat-service.js');

console.log('开始构建应用程序...');

try {
  // 先执行vite构建
  console.log('执行vite构建...');
  execSync('vite build', { stdio: 'inherit' });
  
  // 确保dist-electron目录存在
  if (!fs.existsSync(distElectronPath)) {
    fs.mkdirSync(distElectronPath, { recursive: true });
  }
  
  // 复制nat-service.js文件到dist-electron目录
  console.log(`复制nat-service.js到${distElectronPath}...`);
  fs.copyFileSync(natServiceSourcePath, natServiceDestPath);
  
  // 执行electron-builder构建
  console.log('执行electron-builder构建...');
  execSync('electron-builder', { stdio: 'inherit' });
  
  console.log('构建成功完成！');
} catch (error) {
  console.error('构建过程中出现错误:', error);
  process.exit(1);
}