/*
* @Author: qinyang
* @Date:   2018-07-21 22:15:42
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:19:30
*/
const path = require('path')

// function showWhenInit(answers) {
//   if (answers.presetCodeList.includes('init')) {
//     return true
//   }
//   return false
// }

module.exports = [
  {
    type: 'checkbox',
    // 需要预置哪些代码块
    name: 'presetCodeList',
    message: '请选择需要预置的代码块',
    default: ['init', 'constants', 'services', 'devAccountSel'],
    choices: [
      {
        name: '初始化配置',
        value: 'init',
      },
      {
        name: 'constants',
        value: 'constants',
      },
      {
        name: 'services',
        value: 'services',
      },
      // 账号服务器选择功能
      {
        name: 'devAccountSel',
        value: 'devAccountSel',
      },
      {
        name: 'rishiqingSingleSpa',
        value: 'rishiqingSingleSpa',
      },
      {
        name: 'simditor style',
        value: 'simditor',
      },
      {
        name: 'sprites',
        value: 'sprites',
      },
      {
        name: 'xss',
        value: 'xss',
      },
      {
        name: 'i18n',
        value: 'i18n',
      },
    ],
  }, {
    type: 'input',
    name: 'domainName',
    message: 'CDN域名',
    default: 'res-front-cdn.timetask.cn',
    // eslint-disable-next-line arrow-body-style
    filter: (input) => {
      return input
    },
    // when: showWhenInit,
  }, {
    type: 'input',
    name: 'baseUrl',
    message: '设置项目地址前缀',
    default: 'test',
    // eslint-disable-next-line arrow-body-style
    filter: (input) => {
      return path.posix.join('/', input, '/')
    },
    // when: showWhenInit,
  }, {
    type: 'input',
    name: 'port',
    message: '设置项目调试端口',
    default: 3001,
    validate: (input) => {
      const p = Number(input)
      if (Number.isNaN(p)) {
        return '需要输入正整数'
      }
      return true
    },
    // eslint-disable-next-line arrow-body-style
    filter: (input) => {
      return Number(input)
    },
    // when: showWhenInit,
  },
]
