import * as path from 'path'

let BASE_URL = '/task'
// eslint-disable-next-line no-undef
if (__DEV__) {
  // eslint-disable-next-line no-undef
  const serverPath = window.localStorage.getItem('dev-server-path')
  BASE_URL = serverPath || '/task'
}

const context = require.context('./api', false, /\.js$/)
const api = {
  BASE_URL,
}
context.keys().forEach((item) => {
  const fileName = item.slice(2, -3)
  const p = path.join('api', item)
  api[fileName] = require(`./${p}`).default // eslint-disable-line
})
export default api
