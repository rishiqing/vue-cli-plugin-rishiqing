// 待移除的vue的全局接口
const removeVueGlobalApi = [
  'directive',
  'filter',
  'component',
  'use',
  'mixin',
  'config',
  'prototype',
]
/**
 * 移除代码里对Vue部分全局方法的调用.比如移除Vue.use, Vue.filter, Vue.directive等
 * 这些Vue的全局方法的调用，必须全部抽象到rishiqing-vue-package里去实现
 * @param {*} path babel-plugin path
 * @param {*} types ast types
 * @param {*} vueIdentify 文件里引入vue使用的标识
 */
function removeVueGlobal(path, types, vueIdentify) {
  if (!types.isIdentifier(path.node, { name: vueIdentify })) return
  const expression = path.findParent(p => p.isMemberExpression())
  if (!expression) return
  const { property } = expression.node
  // 如果直接调用的vue.prototype上的方法，则不移除
  if (property.name === 'prototype' && expression.findParent(p => p.isCallExpression())) {
    return
  }
  if (removeVueGlobalApi.includes(property.name)) {
    const statement = expression.findParent(p => p.isExpressionStatement())
    if (statement) statement.remove()
  }
}

module.exports = function vueBabelPlugin({ types }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        // 如果有引入vue
        if (path.node.source.value === 'vue') {
          const { specifiers } = path.node
          if (specifiers.length !== 1) {
            throw new Error('引入vue的时候，只允许 import Vue from \'vue\' 这种写法')
          }
          const vueIdentify = specifiers[0].local.name
          const program = path.findParent(p => p.isProgram())
          program.traverse({
            Identifier(p) {
              removeVueGlobal(p, types, vueIdentify)
            },
          })
        }
      },
    },
  }
}
