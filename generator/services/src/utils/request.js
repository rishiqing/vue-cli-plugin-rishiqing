import axios from 'axios'

const TIME_OUT = 30000 // 默认 30s的超时时间

// create an axios instance
const service = axios.create({
  baseURL: R_URL.BASE_URL, // api的base_url
  timeout: TIME_OUT, // request timeout
})

// 在请求发送之前，做一些处理
service.interceptors.request.use(config => config, error => Promise.reject(error))

// 在收到响应的时候，做一些处理
service.interceptors.response.use(
  response => response,
  (error) => {
    // 如果报错的时候，服务器返回了错误消息，则把错误消息和错误码都放到errorMessage和errorCode上面
    // 方便获取
    if (error.response && error.response.data) {
      error.errorMessage = error.response.data.message
      error.errorCode = error.response.data.code
    }
    return Promise.reject(error)
  },
)

export default service
