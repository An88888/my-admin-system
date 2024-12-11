import request from '@/utils/request'

export const scrapeApi = {
  getScrape(params) {
    return request({
      url: '/scrape',
      method: 'get',
      params
    })
  },
} 