/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-escape */
/* eslint-disable no-multi-assign */
/* eslint-disable no-undef */
/*
* @Author: apple
* @Date:   2015-12-29 10:41:49
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:12:15
* @用途: 检测客户端的浏览器类型，浏览器引擎，和操作系统
*/

// 浏览器引擎
const engine = {
  ie: 0,
  gecko: 0,
  webkit: 0,
  khtml: 0,
  opera: 0,
  type: null,
  ver: null,
}

// 浏览器
const browser = {
  ie: 0,
  edge: 0,
  firefox: 0,
  safari: 0,
  konq: 0,
  opera: 0,
  chrome: 0,
  type: null,
  ver: null,
}

// platform/device/OS
const system = {
  win: false,
  mac: false,
  x11: false,

  winPhone: false,
  winMobile: false,
  iphone: false,
  ipod: false,
  ipad: false,
  ios: false,
  android: false,
  nokiaN: false,
  type: null,
}

// pc端, 是nw，还是electron
const pc = {
  electron: 0,
  nw: 0,
  type: null,
  version: 0,
}

const ua = navigator.userAgent

// opera
if (window.opera) {
  browser.opera = window.opera.version()
  engine.opera = browser.opera
  browser.type = 'opera'
  engine.type = 'opera'
} else if (/AppleWebKit\/(\S+)/.test(ua)) {
  engine.type = 'webkit'
  engine.webkit = RegExp.$1

  if (/OPR\/(\S+)/.test(ua)) { // 首先排除opera，由于在新版本中使用了webkit内核
    browser.type = 'opera'
    browser.opera = RegExp.$1
  } else if (/Edge\/(\S+)/.test(ua)) {
    browser.type = 'edge'
    browser.edge = RegExp.$1
  } else if (/Chrome\/(\S+)/.test(ua)) {
    browser.type = 'chrome'
    browser.chrome = RegExp.$1
  } else if (/Version\/(\S+)/.test(ua)) {
    browser.type = 'safari'
    browser.safari = RegExp.$1
  } else {
    let safariVersion = 1
    if (engine.webkit < 100) {
      safariVersion = 1
    } else if (engine.webkit < 312) {
      safariVersion = 1.2
    } else if (engine.webkit < 412) {
      safariVersion = 1.3
    } else {
      safariVersion = 2
    }
    browser.type = 'safari'
    browser.safari = safariVersion
  }
} else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
  engine.type = 'khtml'
  engine.khtml = browser.konq = RegExp.$1
} else if (/rv:([^\)]+)\) Gecko\/(\d{8}|\S+)/.test(ua)) {
  engine.type = 'gecko'
  engine.gecko = RegExp.$1

  // 看看是不是firefox
  if (/Firefox\/(\S+)/.test(ua)) {
    browser.type = 'firefox'
    browser.firefox = RegExp.$1
  }
} else if (/MSIE ([^;]+)/.test(ua)) {
  engine.type = browser.type = 'ie'
  engine.ie = browser.ie = RegExp.$1
} else if (/Trident\/([^;]+)/.test(ua)) {
  if (/rv:([^\)]+)\)/.test(ua)) {
    engine.type = browser.type = 'ie'
    engine.ie = browser.ie = RegExp.$1
  }
}

const p = navigator.platform
system.win = p.indexOf('Win') === 0
system.x11 = p === 'X11'
system.mac = p.indexOf('Mac') === 0
system.iphone = p.indexOf('iPhone') === 0
system.ipod = p.indexOf('iPod') === 0
system.ipad = p.indexOf('iPad') === 0

if (system.win) {
  system.type = 'win'
  // detect windows operating systems
  if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
    if (RegExp.$1 === 'NT') {
      switch (RegExp.$2) {
        case '5.0':
          system.win = '2000'
          break
        case '5.1':
          system.win = 'XP'
          break
        case '6.0':
          system.win = 'Vista'
          break
        case '6.1':
          system.win = '7'
          break
        case '6.2':
          system.win = '8'
          break
        case '6.3':
          system.win = '8.1'
          break
        default:
          system.win = 'NT'
          break
      }
    } else if (RegExp.$1 === '9x') {
      system.win = 'ME'
    } else if (RegExp.$1 === 'Ph') {
      system.type = 'winPhone'
      if (/Windows Phone OS (\d+.\d+)/.test(ua) || /Windows Phone (\d+.\d+)/.test(ua)) {
        system.winPhone = RegExp.$1
      }
    } else {
      system.win = RegExp.$1
    }
  }

  // windows mobile
  if (system.win === 'CE') {
    system.winMobile = system.win
  } else if (system.win === 'Ph') {
    if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
      system.type = 'winMobile'
      system.winMobile = RegExp.$1
    }
  }
} else if (system.x11 || p.indexOf('Linux') === 0) {
  system.type = 'x11'

  // determine android version
  if (/Android (\d+\.\d+)/.test(ua)) {
    system.type = 'android'
    system.android = RegExp.$1
  }
} else if (system.mac) {
  system.type = 'mac'
} else if (system.iphone || system.ipod || system.ipad) {
  if (system.iphone) {
    system.type = 'iphone'
  } else if (system.ipod) {
    system.type = 'ipod'
  } else if (system.ipad) {
    system.type = 'ipad'
  }

  // determine iOS version
  if (ua.indexOf('Mobile') > -1) {
    if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
      system.ios = parseFloat(RegExp.$1.replace('_', '.'))
    } else {
      system.ios = 2// 不准确
    }
  }
}

// 处理一些特殊情况
system.nokiaN = ua.indexOf('NokiaN') > -1
if (system.nokiaN) {
  system.type = 'nokiaN'
} else if (/Android; Mobile/.test(ua)) {
  system.type = 'android'
  system.android = 'Not detect'
}

if (/rishiqing-pc\/(\S+)/.test(ua)) {
  pc.version = RegExp.$1
  if (/Electron\/(\S+)/.test(ua)) {
    pc.type = 'electron'
    pc.electron = RegExp.$1
  }
}

class Client {
  get engine() {
    return engine
  }

  get browser() {
    return browser
  }

  get system() {
    return system
  }

  // 这里的pc指的是pc客户端
  get pc() {
    return pc
  }

  get isPc() {
    return this.pc.version !== 0
  }

  get isElectron() {
    return this.pc.type === 'electron'
  }

  // 获取electron的主版本号
  get electronMajor() {
    if (!this.pc.version) return null
    const list = this.pc.version.split('.')
    return parseInt(list[0], 10)
  }

  /**
   * 是不是在移动端
   * @return {Boolean} [description]
   */
  get isMobile() {
    return !!(this.system.android || this.system.ios)
  }
}

export default new Client()
