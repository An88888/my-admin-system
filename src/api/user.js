import request from '@/utils/request'

export const userApi = {
  getUsers(params) {
    return request({
      url: '/users',
      method: 'get',
      params
    })
  },
  
  createUser(data) {
    return request({
      url: '/users/save',
      method: 'post',
      data
    })
  },
  
  updateUser(data) {
    return request({
      url: '/users/save',
      method: 'post',
      data
    })
  },
  
  deleteUser(data) {
    return request({
      url: `/users/del`,
      method: 'post',
      data
    })
  },

  sendMessage(data){
    return request({
      url: `/msg/send`,
      method: 'post',
      data
    })
  }
}