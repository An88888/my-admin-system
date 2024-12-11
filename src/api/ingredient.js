import request from '@/utils/request'

export const ingredientApi = {
  getIngredient(params) {
    return request({
      url: '/ingredient',
      method: 'get',
      params
    })
  },
  createIngredient(data) {
    return request({
      url: '/ingredient/save',
      method: 'post',
      data
    })
  },
  updateIngredient(data) {
    return request({
      url: `/ingredient/save`,
      method: 'post',
      data
    })
  },
  deleteIngredient(data) {
    return request({
      url: `/ingredient/del`,
      method: 'post',
      data
    })
  }
} 