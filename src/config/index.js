// 基础配置
const config = {
  // 开发环境配置
  development: {
    baseURL: 'http://127.0.0.1:5000',
    timeout: 5000
  },
  // 测试环境配置
  test: {
    baseURL: 'http://test-api.example.com',
    timeout: 5000
  },
  // 生产环境配置
  production: {
    baseURL: 'http://api.example.com',
    timeout: 5000
  }
}

// 获取当前环境
const env = import.meta.env.MODE || 'development'

// 导出当前环境的配置
export default {
  env,
  ...config[env],
  // 其他通用配置
  tokenKey: 'token',
  userInfoKey: 'userInfo'
} 