import axios from 'axios'

const service = axios.create({
  timeout: 30000,
})

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
