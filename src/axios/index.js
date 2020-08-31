import Axios from 'axios'
import { Notification } from 'ant-design-vue'

const axios = Axios.create()

const checkCode = (response) => {
  if (response.status > 199 && response.status < 300) {
    return response.data
  }
  Notification.error({
    message: response.statusText || '网络错误',
  })
  return response
}

axios.interceptors.response.use((res) => checkCode(res), (err) => checkCode(err.response))

const get = (url, params, config) => axios.get(url, { params, ...config })

const post = (url, data, config) => axios.post(url, data, config)

const upload = (url, data, config) => axios.post(url, data, {
  'Content-Type': 'multipart/form-data;charset=UTF-8',
  ...config,
})

export default {
  install(Vue) {
    Vue.prototype.$get = get
    Vue.prototype.$post = post
    Vue.prototype.$upload = upload
  },
}

export {
  post,
  get,
  upload,
}
