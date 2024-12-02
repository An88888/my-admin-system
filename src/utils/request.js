import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'x-requested-with': 'XMLHttpRequest',
    
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    let userInfo
    if (localStorage.getItem('userInfo') && localStorage.getItem('userInfo') !== 'undefined'){
      userInfo = JSON.parse(localStorage.getItem('userInfo'))
    }

    if (token && userInfo) {
      config.headers['token'] = token + '_' + userInfo.id
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 判断返回的 code，如果是 1019 说明 token 失效
    if (res.code === 1019) {
      ElMessage.error('登录已过期，请重新登录')
      const userStore = useUserStore()
      userStore.clearUserData()
      router.push('/login')
      return Promise.reject(new Error('Token 失效'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request