import Vue from 'vue'

const vm = new Vue()
export default class UploadAdapter {
  constructor(loader, url) {
    this.loader = loader
    this.url = url
  }

  // Starts the upload process.
  upload() {
    return new Promise((resolve, reject) => {
      const { file } = this.loader
      const data = { type: `.${file.type.split('/')[1]}` }
      const getData = (imgData) => {
      // Send the request.
        vm.$post(this.url, [{
          ...data,
          data: imgData,
        }]).then((res) => {
          const { extend, msg } = res || { extend: [], msg: '网络错误' }
          if (extend && extend.length) {
            resolve({ default: extend[0] })
          } else {
            reject(msg)
          }
        })
      }
      this._file2Base64(getData)
    })
  }

  // Aborts the upload process.
  abort() {}

  // file转base64
  _file2Base64(cb) {
    const { file } = this.loader
    const reader = new FileReader()
    reader.addEventListener('load', () => cb(reader.result))
    reader.readAsDataURL(file)
  }
}
