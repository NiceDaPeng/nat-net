import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import { resolve, join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/main.js',
      vite: {
        build: {
          rollupOptions: {
            external: ['electron', join(__dirname, 'electron/nat-service.js')],
          }
        }
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      external: ['electron']
    }
  },
  // 添加一个构建钩子来复制nat-service.js文件
  optimizeDeps: {
    include: ['uuid']
  }
})
