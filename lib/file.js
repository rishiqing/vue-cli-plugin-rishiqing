/* eslint-disable no-use-before-define */
import {
  isVip,
  isQyVipOrMore,
  isZyVipOrMore,
} from 'rishiqing/single-spa-data'

// 文档类型
const docType = {
  // 文字
  '.txt': true,
  '.doc': true,
  '.docx': true,
  '.dot': true,
  '.wps': true,
  '.wpt': true,
  '.dotx': true,
  '.docm': true,
  '.dotm': true,
  '.rtf': true,
  '.xml': true,
  '.mhtml': true,
  '.mht': true,
  '.html': true,
  '.htm': true,
  '.uof': true,

  // 表格
  '.xls': true,
  '.xlsx': true,
  '.xlt': true,
  '.et': true,
  '.xltx': true,
  '.csv': true,
  '.xlsm': true,
  '.xltm': true,

  // 演示
  '.ppt': true,
  '.pptx': true,
  '.pptm': true,
  '.ppsx': true,
  '.ppsm': true,
  '.pps': true,
  '.potx': true,
  '.potm': true,
  '.dpt': true,
  '.dps': true,
  // pdf
  '.pdf': true,
}

// 图片类型
const imgType = {
  '.jpg': true,
  '.png': true,
  '.gif': true,
  '.bmp': true,
  '.jpeg': true,
}

// 自有类型
const selfType = {
  '.km': true, // 思维导图
  '.xmind': true,
  '.mm': true,
}

// 服务器接受这些类型的图片， 需要对图片大小作限制
const serverReceivedImg = [
  'jpg',
  'bmp',
  'gif',
  'jpeg',
  'jpeg2000',
  'tiff',
  'psd',
  'png',
  'swf',
  'svg',
].map(item => `.${item}`)

// 可预览的文件类型
const previewFileType = Object.assign({}, selfType, docType, imgType)

// 缓存计算出来的文件限制数据
const LimitStateCache = {}

/**
 * 把兆转换成字节数
 * @param {Number} mb 兆
 */
export function getByteOfMb(mb) {
  return 1024 * 1024 * mb
}

/**
 * 检查是不是服务器能接受的图片类型
 * @param {*} fileName 文件名
 */
export function isServerReceivedImg(fileName) {
  const tail = getFileTail(fileName)
  return !!(serverReceivedImg.indexOf(tail) !== -1)
}

// 获取文件后缀，包括.号
export function getFileTail(fileName) {
  if (!fileName) return fileName
  return fileName.substr(fileName.lastIndexOf('.')).toLowerCase()
}

// 获取图片大小的限制，不同类型的用户，图片的大小不一样
export function getImgSizeLimit() {
  if (LimitStateCache.imgLimit) return LimitStateCache.imgLimit

  LimitStateCache.imgLimit = isVip() ? {
    limit: 200,
    byte: getByteOfMb(200),
  } : {
    limit: 20,
    byte: getByteOfMb(20),
  }
  return LimitStateCache.imgLimit
}

export function getFileSizeLimit() {
  if (LimitStateCache.fileLimit) return LimitStateCache.fileLimit
  // 如果是企业或者以上会员
  if (isQyVipOrMore()) {
    LimitStateCache.fileLimit = {
      // 10Gb
      limit: 1024 * 10,
      byte: getByteOfMb(1024 * 10),
    }
  } else if (isZyVipOrMore()) {
    LimitStateCache.fileLimit = {
      // 1Gb
      limit: 1024,
      byte: getByteOfMb(1024),
    }
  } else {
    // 普通免费会员只有200Mb
    LimitStateCache.fileLimit = {
      // 200Mb
      limit: 200,
      byte: getByteOfMb(200),
    }
  }
  return LimitStateCache.fileLimit
}

/**
 * 文件的尺寸是否可以
 */
export function isFileSizeOk(file) {
  const { size } = file
  // 如果是服务器可鉴别的图片
  if (isServerReceivedImg(file.name)) {
    const { limit, byte } = getImgSizeLimit()
    if (size <= byte) return { isOk: true }
    return {
      isOk: false,
      message: `图片: ${file.name} 大小超过限制, 不能超过${limit}M`,
    }
  }
  const { limit, byte } = getFileSizeLimit()
  if (size <= byte) return { isOk: true }
  return {
    isOk: false,
    message: `文件: ${file.name} 大小超过限制, 不能超过${limit}M`,
  }
}

/**
 * 通过文件名，判断文件是否是可预览类型
 * @param string fileName 文件名
 */
export function isPreviewFile(fileName) {
  const tail = getFileTail(fileName)
  return !!previewFileType[tail]
}
