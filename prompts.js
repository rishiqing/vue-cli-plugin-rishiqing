/*
* @Author: qinyang
* @Date:   2018-07-21 22:15:42
 * @Last Modified by: caoHao
 * @Last Modified time: 2018-12-12 19:23:25
*/
const path = require('path');

module.exports = [
  {
    type: 'checkbox',
    name: 'presetCodeList', // 需要预置哪些代码块
    message: '需要预置哪些代码',
    default: ['constants', 'services'],
    choices: [
      {
        name: 'constants',
        value: 'constants'
      },
      {
        name: 'services',
        value: 'services'
      },
      {
        name: 'simditor style',
        value: 'simditor'
      },
      {
        name: 'sprites',
        value: 'sprites'
      },
      {
        name: 'xss',
        value: 'xss'
      },
      {
        name:'i18n',
        value:'i18n'
      }
    ]
  }, {
    type: 'input',
    name: 'simditorStyleFilePath',
    message: '放置simditor的地方',
    default: 'src/styles/editor.scss',
    when: (answers) => {
      // if (answers.presetCodeList.includes('simditor')) {
      //   return true;
      // } else {
      //   return false;
      // }
      return false;
    }
  }, {
    type: 'input',
    name: 'baseUrl',
    message: '项目地址前缀',
    default: 'test',
    filter: (input) => {
      return path.posix.join('/', input, '/');
    }
  }, {
    type: 'input',
    name: 'port',
    message: '项目调试端口',
    default: 3001,
    validate: (input) => {
      const p = Number(input);
      if (isNaN(p)) {
        return '需要输入纯数字';
      }
      return true;
    },
    filter: (input) => {
      return Number(input);
    }
  }
]