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
  },
  upload(file) {
    const formData = new FormData(); // 创建一个 FormData 对象
    formData.append('file', file); // 将文件添加到 FormData 中

    return request({
      url: '/image/upload',
      method: 'post',
      formData

    });
  }
} 
