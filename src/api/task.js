import request from '@/utils/request'

export const taskApi = {
  getTasks(params) {
    return request({
      url: '/tasks',
      method: 'get',
      params
    })
  },
  
  createTask(data) {
    return request({
      url: '/tasks/save',
      method: 'post',
      data
    })
  },
  
  updateTask(data) {
    return request({
      url: '/tasks/save',
      method: 'post',
      data
    })
  },
  
  deleteTask(data) {
    return request({
      url: `/tasks/del`,
      method: 'post',
      data
    })
  },
  getTaskList(params) {
    return request({
      url: '/tasks/list',
      method: 'get',
      params
    })
  }
}
