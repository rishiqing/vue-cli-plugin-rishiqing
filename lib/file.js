/* eslint-disable no-use-before-define */
import {
  isVip,
  isQyVipOrMore,
  isZyVipOrMore,
} from 'rishiqing/single-spa-data'

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
