import { createApp } from 'vue'
import { createPinia } from 'pinia' // 添加这行
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia() // 添加这行

app.use(pinia) // 添加这行
app.use(ElementPlus)
app.use(router)
app.mount('#app')

// 访问环境变量
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('App Title:', import.meta.env.VITE_APP_TITLE);
console.log('Upload URL:', import.meta.env.VITE_APP_UPLOAD_URL);