import request from '@/utils/request'

export const authApi = {
  login(data) {
    return request({
      url: '/login',
      method: 'post',
      data
    })
  },
  logout() {
    return request({
      url: '/logout',
      method: 'post'
    })
  }
} 
