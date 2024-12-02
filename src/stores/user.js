import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    let userInfo = null
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedUserInfo && storedUserInfo !== 'undefined') {
      try {
        userInfo = JSON.parse(storedUserInfo)
      } catch (error) {
        console.error('解析用户信息时出错:', error)
        localStorage.removeItem('userInfo')
      }
    }

    return {
      token: localStorage.getItem('token') || '',
      userInfo: userInfo
    }
  },

  getters: {
    isAdmin: (state) => state.userInfo?.isAdmin === true,
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    clearUserData() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})