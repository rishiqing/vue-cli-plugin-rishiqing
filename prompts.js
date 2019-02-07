/*
* @Author: qinyang
* @Date:   2018-07-21 22:15:42
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:19:30
*/
const path = require('path')

module.exports = [
  {
    type: 'checkbox',
    // 需要预置哪些代码块
    name: 'presetCodeList',
    message: '请选择需要预置的代码块',
    default: ['constants', 'services', 'devAccountSel'],
    choices: [
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
    name: 'simditorStyleFilePath',
    message: '放置simditor的地方',
    default: 'src/styles/editor.scss',
    // eslint-disable-next-line arrow-body-style
    when: () => {
      // if (answers.presetCodeList.includes('simditor')) {
      //   return true;
      // } else {
      //   return false;
      // }
      return false
    },
  }, {
    type: 'input',
    name: 'domainName',
    message: 'CDN域名',
    default: 'res-front-cdn.timetask.cn',
    // eslint-disable-next-line arrow-body-style
    filter: (input) => {
      return input
    },
  }, {
    type: 'input',
    name: 'baseUrl',
    message: '设置项目地址前缀',
    default: 'test',
    // eslint-disable-next-line arrow-body-style
    filter: (input) => {
      return path.posix.join('/', input, '/')
    },
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
  },
]
