import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/api':{target:'http://127.0.0.1:5174',timeout:660000,proxyTimeout:660000}}},build:{rollupOptions:{output:{manualChunks:{'videojs':['video.js']}}}}});
