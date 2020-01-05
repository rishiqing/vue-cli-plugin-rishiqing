/**
 * 做系统初始化工作
 */
import { initData } from 'rishiqing/single-spa-data'

export default async function init() {
  await initData()
}
