import axios from 'axios'
import {
  getToken,
  getFreshTime,
} from 'rishiqing/single-spa-data'

const service = axios.create({
  timeout: 30000,
})

service.interceptors.request.use((config) => {
  config.headers.token = getToken()
  config.headers.freshTime = getFreshTime()
  return config
}, error => Promise.reject(error))

const createAxiosRequest = (option, payload) => {
  if (!/^(get|post|put|delete|patch|options|head)$/.test(option.method)) {
    throw new Error(`AxiosError:${option.method}不是合法的请求方法`)
  }

  let requestParamsOpt = {}

  if (payload) {
    if (option.method === 'get' || option.method === 'delete') {
      requestParamsOpt = {
        params: {
          ...payload,
        },
      }
    }

    if (option.method === 'post' || option.method === 'put') {
      requestParamsOpt = {
        data: {
          ...payload,
        },
      }
    }
  }

  return service.request({
    ...Object.assign({}, option, requestParamsOpt),
  })
}

export default createAxiosRequest
