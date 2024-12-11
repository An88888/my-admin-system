import request from '@/utils/request'

export const cateApi = {
  getCate(params) {
    return request({
      url: '/cate',
      method: 'get',
      params
    })
  },
  createCate(data) {
    return request({
      url: '/cate/save',
      method: 'post',
      data
    })
  },
  updateCate(data) {
    return request({
      url: `/cate/save`,
      method: 'post',
      data
    })
  },
  deleteCate(data) {
    return request({
      url: `/cate/del`,
      method: 'post',
      data
    })
  }
} 