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