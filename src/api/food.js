import request from '@/utils/request'

export const foodApi = {
  getFood(params) {
    return request({
      url: '/food',
      method: 'get',
      params
    })
  },
  createFood(data) {
    return request({
      url: '/food/save',
      method: 'post',
      data
    })
  },
  updateFood(data) {
    return request({
      url: `/food/save`,
      method: 'post',
      data
    })
  },
  deleteFood(data) {
    return request({
      url: `/food/del`,
      method: 'post',
      data
    })
  }
} 