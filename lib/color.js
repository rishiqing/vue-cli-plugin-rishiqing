/**
 * 自动生成主题色
 * 这个文件需要在构建工程里使用，所以不要用es6包管理，用commonjs2
 */

// :root {
//   /* 10个主题色，以及对应的rgb值 */
//   --kite-theme-color-1: #f0f9ff;
//   --kite-theme-color-1-rgb: 240, 249, 255;
//   --kite-theme-color-2: #cfeaff;
//   --kite-theme-color-2-rgb: 207, 234, 255;
//   --kite-theme-color-3: #a6d5ff;
//   --kite-theme-color-3-rgb: 166, 213, 255;
//   --kite-theme-color-4: #7dbeff;
//   --kite-theme-color-4-rgb: 125, 190, 255;
//   --kite-theme-color-5: #54a4ff;
//   --kite-theme-color-5-rgb: 84, 164, 255;
//   --kite-theme-color-6: #2b88fe;
//   --kite-theme-color-6-rgb: 43, 136, 254;
//   --kite-theme-color-7: #1a66d9;
//   --kite-theme-color-7-rgb: 26, 102, 217;
//   --kite-theme-color-8: #0c49b3;
//   --kite-theme-color-8-rgb: 12, 73, 179;
//   --kite-theme-color-9: #03318c;
//   --kite-theme-color-9-rgb: 3, 49, 140;
//   --kite-theme-color-10: #011f66;
//   --kite-theme-color-10-rgb: 1, 31, 102;

//   /* 4个功能色，以及对应的rgb值 */
//   --kite-func-color-link: #2B88FE;
//   --kite-func-color-link-rgb: 43, 136, 254;
//   --kite-func-color-success: #51C419;
//   --kite-func-color-success-rgb: 81, 196, 25;
//   --kite-func-color-warn: #FAAD15;
//   --kite-func-color-warn-rgb: 250, 173, 21;
//   --kite-func-color-error: #F5222D;
//   --kite-func-color-error-rgb: 245, 34, 45;
// }

const colors = require('@ant-design/colors')
const hexRgb = require('hex-rgb')

// 传入主题色，生成对应的主题色变量
// 目前我们的默认主题色值是： #2B88FE
function generateColor(themeColor) {
  const themeColorPrefix = '--kite-theme-color'
  const errorColorPrefix = '--kite-error-color'
  const funcColorPrefix = '--kite-func-color'

  // 功能色
  const funcColor = {
    link: '#2B88FE',
    success: '#51C419',
    warn: '#FAAD15',
    error: '#F5222D',
  }

  const themeColorList = colors.generate(themeColor)

  const themeColorProperties = themeColorList.reduce((acc, hex, index) => {
    acc[`${themeColorPrefix}-${index + 1}`] = hex
    const rgb = hexRgb(hex)
    acc[`${themeColorPrefix}-${index + 1}-rgb`] = `${rgb.red}, ${rgb.green}, ${rgb.blue}`
    return acc
  }, {})

  const errorColorList = colors.generate(funcColor.error)

  const errorColorProperties = errorColorList.reduce((acc, hex, index) => {
    acc[`${errorColorPrefix}-${index + 1}`] = hex
    const rgb = hexRgb(hex)
    acc[`${errorColorPrefix}-${index + 1}-rgb`] = `${rgb.red}, ${rgb.green}, ${rgb.blue}`
    return acc
  }, {})

  const funcColorProperties = Object.keys(funcColor).reduce((acc, name) => {
    const hex = funcColor[name]
    acc[`${funcColorPrefix}-${name}`] = hex
    const rgb = hexRgb(hex)
    acc[`${funcColorPrefix}-${name}-rgb`] = `${rgb.red}, ${rgb.green}, ${rgb.blue}`
    return acc
  }, {})

  return Object.assign({}, themeColorProperties, errorColorProperties, funcColorProperties)
}

function insertToDocument(themeColor) {
  const id = 'kite-design-theme-variables'

  const colorMap = generateColor(themeColor)
  const style = document.querySelector(`#${id}`) || document.createElement('style')
  style.id = id

  const colorString = Object.keys(colorMap).map(key => `${key}: ${colorMap[key]};`).join('\n')

  style.innerHTML = `
    :root {
      ${colorString}
    }
  `
  const head = document.querySelector('html > head')
  head.appendChild(style)
}

module.exports = {
  generateColor,
  insertToDocument,
}
