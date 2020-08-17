import Axios from 'axios'

const axios = Axios.create()

const checkCode = (response) => response

axios.interceptors.response.use((res) => checkCode(res.data), (err) => checkCode(err.response.data))

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
