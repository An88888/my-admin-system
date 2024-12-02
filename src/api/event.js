import request from '@/utils/request'

export const eventApi = {
  getEvents(params) {
    return request({
      url: '/events',
      method: 'get',
      params
    })
  },
  createEvent(data) {
    return request({
      url: '/events/save',
      method: 'post',
      data
    })
  },
  updateEvent(data) {
    return request({
      url: `/events/save`,
      method: 'post',
      data
    })
  },
  deleteEvent(data) {
    return request({
      url: `/events/del`,
      method: 'post',
      data
    })
  }
} 