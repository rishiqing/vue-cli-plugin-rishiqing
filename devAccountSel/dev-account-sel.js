/*
 * @Author: TimZhang 
 * @Date: 2018-12-26 20:50:29 
 * @Last Modified by:   TimZhang 
 * @Last Modified time: 2018-12-26 20:50:29 
 */
import './dev-account-sel.scss';

const LOCALSTORAGE_ACCOUNT_KEY = 'dev-account-username';
const LOCALSTORAGE_PASSWORD_KEY = 'dev-account-password';
const LOCALSTORAGE_SERVER_KEY = 'dev-server-path';
const LOCALSTORAGE_COOKIE_KEY = 'dev-cookie';

const theContainerHtml =
  `<div id="accout-serve-sel-container">
    <div class="server-container">
      <span>请选择WEB服务器</span>
      <ul class="server-ul">
      </ul>
    </div>
    <div class="account-container">
      <span>请选择调试账号</span>
      <ul class="account-ul">
      </ul>
    </div>
    <div class="cookie-container">
      <span>设置调试用cookie</span>
      <input type="text" class="cookie-input" placeholder="cookie键名为 debuggingCookie ,请填入cookie值。如果无法生效，请清除一下cookie，再刷新!" />
    </div>
    <button id="confirm-btn">关闭</button>
</div>`;

class AccountServeSelector {
  constructor() {
    this.isOpen = false;

    // 插入选择界面
    document.body.innerHTML += theContainerHtml;
    // 最外层容器DOM
    this.dMainContainer =  document.getElementById('accout-serve-sel-container');
    // 关闭按钮DOM
    this.dConfirmBtn = document.getElementById('confirm-btn');
    // 服务器 ul
    this.dServerUl = document.querySelector('.server-ul');
    // 账户 ul
    this.dAccountUl = document.querySelector('.account-ul');
    // cookie 输入框
    this.dCookieInput = document.querySelector('.cookie-input');

    this.initEventBind();
  }

  initEventBind() {
    this.domBind(document, 'keydown', (e) => {
      // 同时按下 ctrl/command + shift + l 键，触发多账号选择弹窗
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ((e.which === 76) || (e.which === 85))) {
        if (this.isOpen) {
          this.hideSurface();
          return;
        }
        
        // 显示界面
        this.isOpen = true;
        this.domAddClass(this.dMainContainer, 'show-it');

        // 读取 cookie 的设值
        let cookiFromLocal = this.getDevCookieFromLocal();
        if (cookiFromLocal){
          this.dCookieInput.value = cookiFromLocal;
          this.setCookie('debuggingCookie', cookiFromLocal, 5);
        }

        // 读取配置数据，每次调出界面都会重写读取配置文件
        this.getConfigData().then(data => {
          // 添加账户可选项
          if (data.accounts.length) {
            this.addAccountLi(data.accounts);
          }
          // 添加服务器可选项
          if (data.servers.length) {
            this.addServeLi(data.servers);
          }

          // 根据 localStorage 内容标亮已选项目
          this.hightlightSelected();
        });
      }

      // 上下键选择账号
      if (e.which === 38) { // 上方向键
        this.prevAccount();
      }
      if (e.which === 40) { // 下方向键
        this.nextAccount();
      }
      // 左右键选择服务器
      if (e.which === 37) { // 左方向键
        this.prevServe();
      }
      if (e.which === 39) { // 右方向键
        this.nextServe();
      }

      // 回车
      if (e.which === 13) { 
        this.hideSurface();
      }

      // Esc键，隐藏界面
      if (e.which === 27) {
        this.hideSurface();
      }
    });

    // cookie 操作绑定
    this.domBind(this.dCookieInput, 'input', (e) => {
      let theCookieValStr = e.currentTarget.value;
      this.setCookie('debuggingCookie', theCookieValStr, 5);
      this.setDevCookieToLocal(theCookieValStr);
    });

    // 确认按钮事件
    this.domBind(this.dConfirmBtn, 'click' ,(e) => {
      this.hideSurface();
    });
  }

  hideSurface () {
    this.domRemoveClass(this.dMainContainer, 'show-it');
    this.isOpen = false;
  }

  // 获取 配置文件 配置数据
  getConfigData() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('get', 'rsq-dev-account.json');
      xhr.onload = function () {
        resolve(JSON.parse(xhr.response));
      };
      xhr.onerror = function () {
        reject();
      };
      xhr.send();
    });
  }

  // 添加账户可选项目
  addAccountLi(dataArr) {
    // 生成HTML
    let theHtml = dataArr.map((item) => {
      return `<li class="item-li account-li" data-username="${item.username}" data-password="${item.password}">
                <span class="account-username">${item.username}</span>
                <small class="account-desc">${item.desc}</small>
              </li>`
    }).join('');
    
    this.dAccountUl.innerHTML = theHtml;

    // 绑定点击事件
    let theCollection = document.querySelectorAll('.account-li');
    for(let i = 0; i < theCollection.length; i++){
      theCollection[i].addEventListener('click', (e) => {
        this.setSelectedAccItem(e.currentTarget);
      }, false);
    }
  }

  // 高亮选中项，写入 localStorage,账户
  setSelectedAccItem (theDom) {
    let theAccName = theDom.getAttribute('data-username');
    let theAccPassword = theDom.getAttribute('data-password');
    // 将选中项写入 localStorage
    this.setAccountToLocal(theAccName);
    this.setPasswordToLocal(theAccPassword);
    // 添加选中样式
    let dSelectedOne = document.querySelector('.account-li.selected-li');
    dSelectedOne && this.domRemoveClass(dSelectedOne, 'selected-li');
    this.domAddClass(theDom, 'selected-li');
  }

  // 添加服务器可选项目
  addServeLi(dataArr) {
    let theHtml = dataArr.map((item) => {
      return `<li class="item-li server-li" data-path="${item.path}">
                <span class="server-path">${item.path}</span>
                <small class="server-desc">${item.desc}</small>
              </li>`
    }).join('');

    this.dServerUl.innerHTML = theHtml;

    // 绑定点击事件
    let theCollection = document.querySelectorAll('.server-li');
    for (let i = 0; i < theCollection.length; i++) {
      theCollection[i].addEventListener('click', (e) => {
        this.setSelectedServeItem(e.currentTarget);
      }, false);
    }
  }

  // 高亮选中项，写入 localStorage,账户
  setSelectedServeItem(theDom) {
    let thePath = theDom.getAttribute('data-path');
    // 将选中项写入 localStorage
    this.setServerPathToLocal(thePath);
    // 添加选中样式
    let dSelectedOne = document.querySelector('.server-li.selected-li');
    dSelectedOne && this.domRemoveClass(dSelectedOne, 'selected-li');
    this.domAddClass(theDom, 'selected-li');
  }

  // 高亮 localStorage 中的已选项
  hightlightSelected () {
    let accSelected = this.getAccountFromLocal();
    if (accSelected) {
      let theDom = document.querySelector('li.account-li[data-username="' + accSelected + '"]');
      theDom && this.domAddClass(theDom, 'selected-li');
    }

    let serveSelected = this.getServerPathFromLocal();
    if (serveSelected) {
      let theDom = document.querySelector('li.server-li[data-path="' + serveSelected + '"]');
      theDom && this.domAddClass(theDom, 'selected-li');
    }
  }

  // 账号上下键选择
  prevAccount () {
    let preDom = this.getCurrentAccountItem().previousElementSibling;
    preDom && this.setSelectedAccItem(preDom);
  }
  nextAccount () {
    let nextDom = this.getCurrentAccountItem().nextElementSibling;
    nextDom && this.setSelectedAccItem(nextDom);
  }
  getCurrentAccountItem() {
    let dCurrentOne = document.querySelector('.account-li.selected-li');
    if (!dCurrentOne) {
      // 没有已选中的,就选第一个
      dCurrentOne = document.querySelector('.account-li');
      dCurrentOne && this.setSelectedAccItem(dCurrentOne);
    }
    if (dCurrentOne) {
      return dCurrentOne;
    }
  }
  
  // 服务器左右按键选择
  prevServe () {
    let preDom = this.getCurrentServeItem().previousElementSibling;
    preDom && this.setSelectedServeItem(preDom);
  }
  nextServe () {
    let nextDom = this.getCurrentServeItem().nextElementSibling;
    nextDom && this.setSelectedServeItem(nextDom);
  }
  getCurrentServeItem () {
    let dCurrentOne = document.querySelector('.server-li.selected-li');
    if (!dCurrentOne) {
      // 没有已选中的,就选第一个
      dCurrentOne = document.querySelector('.server-li');
      dCurrentOne && this.setSelectedServeItem(dCurrentOne);
    }
    if (dCurrentOne) {
      return dCurrentOne;
    }
  }





  //localStorage 操作
  setAccountToLocal(username) {
    window.localStorage.setItem(LOCALSTORAGE_ACCOUNT_KEY, username);
  }
  getAccountFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_ACCOUNT_KEY);
  }
  setPasswordToLocal(password) {
    window.localStorage.setItem(LOCALSTORAGE_PASSWORD_KEY, password);
  }
  getPasswordFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_PASSWORD_KEY);
  }

  setServerPathToLocal(server) {
    window.localStorage.setItem(LOCALSTORAGE_SERVER_KEY, server);
  }
  getServerPathFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_SERVER_KEY);
  }

  setDevCookieToLocal(theCookie) {
    window.localStorage.setItem(LOCALSTORAGE_COOKIE_KEY, theCookie);
  }
  getDevCookieFromLocal() {
    return window.localStorage.getItem(LOCALSTORAGE_COOKIE_KEY);
  }

  // DOM 操作函数
  domBind(obj, ev, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(ev, fn, false);
    } else {
      obj.attachEvent('on' + ev, function () {
        fn.call(obj);
      });
    }
  }

  domAddClass(obj, addClass) {
    if (!obj.className) {
      obj.className = addClass;
      return;
    }
    
    let originClass = obj.className.split(' ');
    for (let i = 0; i < originClass.length; i++) {
      if (originClass[i] === addClass) return;
    }
    obj.className += ' ' + addClass;
  }

  domRemoveClass(obj, removeClass) {
    if (!obj.className) return;

    let orginClass = obj.className.split(' ');
    for (let i = 0; i < orginClass.length; i++) {
      if (orginClass[i] === removeClass) {
        orginClass.splice(i, 1);
        obj.className = orginClass.join(' ');
        break;
      }
    }
  }

  setCookie(name, value, days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    document.cookie = name + '=' + value + ';expires=' + date;
  }

  removeCookie(name) {
    setCookie(name, '1', -1);
  }
}

new AccountServeSelector();
