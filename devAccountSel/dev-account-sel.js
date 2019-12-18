/* eslint-disable class-methods-use-this */
/* global window,document,XMLHttpRequest:true */

/*
 * @Author: TimZhang
 * @Date: 2018-12-26 20:50:29
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-01 16:43:59
 */

import './dev-account-sel.scss'

// 配置文件请求路径, 需要与 index.js 文件中 api.configureDevServer 方法中路径一致
const CONFIG_FILE_URL = '/fetch-local/rsq-dev-account.json'

const LOCALSTORAGE_ACCOUNT_KEY = 'dev-account-username'
const LOCALSTORAGE_PASSWORD_KEY = 'dev-account-password'
const LOCALSTORAGE_TOKEN_KEY = 'dev-account-token'
const LOCALSTORAGE_SERVER_KEY = 'dev-server-path'
const LOCALSTORAGE_COOKIE_KEY = 'dev-cookie'

const theContainerHtml = `<div id="accout-serve-sel-container">
    <div class="server-container">
      <span>请选择WEB服务器&nbsp<small clall="small-tips">(左右键选择回车保存；点击选中直接保存)</small></span>
      <ul class="server-ul">
      </ul>
    </div>
    <div class="account-container">
      <span>请选择调试账号&nbsp<small clall="small-tips">(上下键选择回车保存；点击选中直接保存)</small></span>
      <ul class="account-ul">
      </ul>
    </div>
    <div class="cookie-container">
      <span>设置调试用cookie&nbsp<small clall="small-tips">(填写后回车保存)</small></span>
      <input type="text" class="cookie-input" placeholder="cookie键名为 debuggingCookie ,请填入cookie值。如果无法生效，请清除一下cookie，再刷新!" />
    </div>
    <button id="confirm-btn">关闭</button>
</div>`

class AccountServeSelector {
  constructor() {
    this.isOpen = false

    // 插入选择界面
    document.body.innerHTML += theContainerHtml
    // 最外层容器DOM
    this.dMainContainer = document.getElementById('accout-serve-sel-container')
    // 关闭按钮DOM
    this.dConfirmBtn = document.getElementById('confirm-btn')
    // 服务器 ul
    this.dServerUl = document.querySelector('.server-ul')
    // 账户 ul
    this.dAccountUl = document.querySelector('.account-ul')
    // cookie 输入框
    this.dCookieInput = document.querySelector('.cookie-input')

    this.initEventBind()
  }

  initEventBind() {
    this.domBind(document, 'keydown', (e) => {
      // 同时按下 ctrl/command + shift + l 键，触发多账号选择弹窗
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ((e.which === 76) || (e.which === 85))) {
        if (this.isOpen) {
          this.hideSurface()
          return
        }

        // 显示界面
        this.isOpen = true
        this.domAddClass(this.dMainContainer, 'show-it')
        this.domAddClass(document.body, 'not-scroll')

        // 读取 cookie 的设值
        const cookiFromLocal = this.getDevCookieFromLocal()
        if (cookiFromLocal) {
          this.dCookieInput.value = cookiFromLocal
          this.setCookie('debuggingCookie', cookiFromLocal, 5)
        }

        // 读取配置数据，每次调出界面都会重写读取配置文件
        this.getConfigData().then((data) => {
          // 添加账户可选项
          if (data.accounts.length) {
            this.addAccountLi(data.accounts)
          }
          // 添加服务器可选项
          if (data.servers.length) {
            this.addServeLi(data.servers)
          }

          // 根据 localStorage 内容标亮已选项目
          this.hightlightSelected()
        // eslint-disable-next-line no-console
        }).catch(error => console.error(error))
      }

      // 如果处在关闭状态，就不执行下面的逻辑了
      if (!this.isOpen) return

      // 上下键选择账号
      if (e.which === 38) { // 上方向键
        this.prevAccount()
      }
      if (e.which === 40) { // 下方向键
        this.nextAccount()
      }
      // 左右键选择服务器
      if (e.which === 37) { // 左方向键
        this.prevServe()
      }
      if (e.which === 39) { // 右方向键
        this.nextServe()
      }

      // 回车
      if (e.which === 13) {
        // 保存信息
        this.saveAllToLocal()
      }

      // Esc键，隐藏界面
      if (e.which === 27) {
        this.hideSurface()
      }
    })

    // 关闭按钮事件
    this.domBind(this.dConfirmBtn, 'click', () => {
      this.hideSurface()
    })
  }

  // 关闭界面
  hideSurface() {
    this.domRemoveClass(this.dMainContainer, 'show-it')
    this.domRemoveClass(document.body, 'not-scroll')
    this.isOpen = false
  }

  // 获取 配置文件 配置数据
  getConfigData() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('get', CONFIG_FILE_URL)
      xhr.onload = function ajaxOnLoad() {
        if (xhr.status === 500) {
          reject(JSON.parse(xhr.response).error)
        } else {
          resolve(JSON.parse(xhr.response))
        }
      }
      xhr.onerror = function ajaxOnError() {
        reject()
      }
      xhr.send()
    })
  }

  // 添加账户可选项目DOM
  addAccountLi(dataArr) {
    // 生成HTML
    const theHtml = dataArr.map(item => `<li class="item-li account-li" data-username="${item.username || ''}" data-password="${item.password || ''}" data-token="${item.token || ''}">
                <span class="account-username">${item.username}</span>
                <small class="account-desc">${item.desc}</small>
              </li>`).join('')

    this.dAccountUl.innerHTML = theHtml

    // 点击选中，保存，关闭界面
    const theCollection = this.dAccountUl.querySelectorAll('.account-li')
    for (let i = 0; i < theCollection.length; i++) {
      this.domBind(theCollection[i], 'click', (e) => {
        this.hightlightSelectedAccItem(e.currentTarget)
        this.saveToLocalAccItem(e.currentTarget)
        // 保存后刷新页面
        window.location.reload()
      })
    }
  }

  // 添加服务器可选项目DOM
  addServeLi(dataArr) {
    const theHtml = dataArr.map(item => `<li class="item-li server-li" data-path="${item.path}">
                <span class="server-path">${item.path}</span>
                <small class="server-desc">${item.desc}</small>
              </li>`).join('')

    this.dServerUl.innerHTML = theHtml

    // 点击选中，保存，关闭界面
    const theCollection = this.dServerUl.querySelectorAll('.server-li')
    for (let i = 0; i < theCollection.length; i++) {
      this.domBind(theCollection[i], 'click', (e) => {
        this.hightlightSelectedServeItem(e.currentTarget)
        this.saveToLocalServeItem(e.currentTarget)
        // 保存后刷新页面
        window.location.reload()
      })
    }
  }


  // 写入 localStorage,账户
  saveToLocalAccItem(theDom) {
    const theAccName = theDom.dataset.username
    const theAccPassword = theDom.dataset.password
    const theAccToken = theDom.dataset.token
    // 将选中项写入 localStorage
    this.setAccountToLocal(theAccName)
    this.setPasswordToLocal(theAccPassword)
    this.setTokenToLocal(theAccToken)
  }

  // 写入 localStorage,服务器
  saveToLocalServeItem(theDom) {
    const thePath = theDom.dataset.path
    // 将选中项写入 localStorage
    this.setServerPathToLocal(thePath)
  }

  // 写入 localStorage,cookie
  saveToLocalCookie() {
    const theCookieValStr = this.dCookieInput.value
    this.setCookie('debuggingCookie', theCookieValStr, 5)
    this.setDevCookieToLocal(theCookieValStr)
  }

  // 保存账户选择、服务器选择、cookie到local
  saveAllToLocal() {
    let dSelectedOneAcc = this.dAccountUl.querySelector('.account-li.selected-li')
    // 如果没选则保存第一个
    if (!dSelectedOneAcc) {
      dSelectedOneAcc = this.dAccountUl.querySelector('.account-li')
    }
    this.saveToLocalAccItem(dSelectedOneAcc)

    let dSelectedOneServe = this.dServerUl.querySelector('.server-li.selected-li')
    // 如果没选则保存第一个
    if (!dSelectedOneServe) {
      dSelectedOneServe = this.dServerUl.querySelector('.server-li')
    }
    this.saveToLocalServeItem(dSelectedOneServe)

    this.saveToLocalCookie()
    // 保存后刷新页面
    window.location.reload()
  }

  // 高亮选中项,账户
  hightlightSelectedAccItem(theDom) {
    const dSelectedOne = this.dAccountUl.querySelector('.account-li.selected-li')
    dSelectedOne && this.domRemoveClass(dSelectedOne, 'selected-li')
    this.domAddClass(theDom, 'selected-li')
  }

  // 高亮选中项,服务器
  hightlightSelectedServeItem(theDom) {
    const dSelectedOne = this.dServerUl.querySelector('.server-li.selected-li')
    dSelectedOne && this.domRemoveClass(dSelectedOne, 'selected-li')
    this.domAddClass(theDom, 'selected-li')
  }

  // 高亮 localStorage 中的已选项
  hightlightSelected() {
    const accSelected = this.getAccountFromLocal()
    if (accSelected) {
      const theDom = this.dAccountUl.querySelector(`li.account-li[data-username="${accSelected}"]`)
      theDom && this.domAddClass(theDom, 'selected-li')
    }

    const serveSelected = this.getServerPathFromLocal()
    if (serveSelected) {
      const theDom = this.dServerUl.querySelector(`li.server-li[data-path="${serveSelected}"]`)
      theDom && this.domAddClass(theDom, 'selected-li')
    }
  }


  // 账号上下键选择
  prevAccount() {
    let preDom = this.getCurrentAccountItem().previousElementSibling
    if (!preDom) {
      preDom = this.dAccountUl.querySelector('.account-li:last-child')
    }
    preDom && this.hightlightSelectedAccItem(preDom)
  }

  nextAccount() {
    let nextDom = this.getCurrentAccountItem().nextElementSibling
    if (!nextDom) {
      nextDom = this.dAccountUl.querySelector('.account-li:first-child')
    }
    this.hightlightSelectedAccItem(nextDom)
  }

  getCurrentAccountItem() {
    let dCurrentOne = this.dAccountUl.querySelector('.account-li.selected-li')
    if (!dCurrentOne) {
      // 没有已选中的,就选第一个
      dCurrentOne = this.dAccountUl.querySelector('.account-li')
      dCurrentOne && this.hightlightSelectedAccItem(dCurrentOne)
    }
    if (dCurrentOne) {
      return dCurrentOne
    }
  }

  // 服务器左右按键选择
  prevServe() {
    let preDom = this.getCurrentServeItem().previousElementSibling
    if (!preDom) {
      preDom = this.dServerUl.querySelector('.server-li:last-child')
    }
    this.hightlightSelectedServeItem(preDom)
  }

  nextServe() {
    let nextDom = this.getCurrentServeItem().nextElementSibling
    if (!nextDom) {
      nextDom = this.dServerUl.querySelector('.server-li:first-child')
    }
    this.hightlightSelectedServeItem(nextDom)
  }

  getCurrentServeItem() {
    let dCurrentOne = this.dServerUl.querySelector('.server-li.selected-li')
    if (!dCurrentOne) {
      // 没有已选中的,就选第一个
      dCurrentOne = this.dServerUl.querySelector('.server-li')
      dCurrentOne && this.hightlightSelectedServeItem(dCurrentOne)
    }
    if (dCurrentOne) {
      return dCurrentOne
    }
  }


  // localStorage 操作
  setAccountToLocal(username) {
    window.localStorage.setItem(LOCALSTORAGE_ACCOUNT_KEY, username)
  }

  getAccountFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_ACCOUNT_KEY)
  }

  setPasswordToLocal(password) {
    window.localStorage.setItem(LOCALSTORAGE_PASSWORD_KEY, password)
  }

  getPasswordFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_PASSWORD_KEY)
  }

  setTokenToLocal(token) {
    window.localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, token)
  }

  getTokenFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
  }

  setServerPathToLocal(server) {
    window.localStorage.setItem(LOCALSTORAGE_SERVER_KEY, server)
  }

  getServerPathFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_SERVER_KEY)
  }

  setDevCookieToLocal(theCookie) {
    window.localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, theCookie)
  }

  getDevCookieFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_COOKIE_KEY)
  }


  // DOM 操作函数
  domBind(obj, ev, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(ev, fn)
    } else {
      obj.attachEvent(`on${ev}`, () => {
        fn.call(obj)
      })
    }
  }

  domAddClass(obj, addClass) {
    if (!obj.className) {
      obj.className = addClass
      return
    }

    const originClass = obj.className.split(' ')
    for (let i = 0; i < originClass.length; i++) {
      if (originClass[i] === addClass) return
    }
    obj.className += ` ${addClass}`
  }

  domRemoveClass(obj, removeClass) {
    if (!obj.className) return

    const orginClass = obj.className.split(' ')
    for (let i = 0; i < orginClass.length; i++) {
      if (orginClass[i] === removeClass) {
        orginClass.splice(i, 1)
        obj.className = orginClass.join(' ')
        break
      }
    }
  }

  setCookie(name, value, days) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    document.cookie = `${name}=${value};expires=${date}`
  }

  removeCookie(name) {
    this.setCookie(name, '1', -1)
  }
}

// eslint-disable-next-line no-new
new AccountServeSelector()
