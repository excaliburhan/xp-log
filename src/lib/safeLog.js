/**
 * @author xiaoping
 * @email edwardhjp@gmail.com
 * @create date 2017-12-30 02:31:11
 * @modify date 2017-12-30 02:31:11
 * @desc [正常运行日志]
*/

import axios from 'axios/dist/axios'
import { debounce, formatDate } from 'xp-utils'

let safeLog = {
  timer: null, // 定时器
  logList: [], // 日志列表
  config: { // 可以传参数改变的配置
    active: true, // 是否开启，默认true
    url: '', // 日志回调地址，url不填写，则为本地console.log
    method: 'post', // 日志回调方法
    params: {}, // 传递的参数
    duration: 10 * 60 * 1000, // 间隔时间，safeLog才有
    delay: 2000, // 上报执行间隔
    callback: () => {}, // 回调函数
  }
}

safeLog.init = (opts) => {
  safeLog.config = Object.assign({}, safeLog.config, opts)
  __init()
}

// 清空日志
safeLog.destory = () => {
  safeLog.logList = []
  clearInterval(safeLog.timer)
}

// 开始函数
function __init () {
  if (!safeLog.config.active) return
  let config = safeLog.config
  config.callback = debounce(config.callback, config.delay) // debounce函数
  safeLog.timer = setInterval(() => {
    __log() // 执行log方法
  }, config.duration)
}

// 日志函数
function __log () {
  let config = safeLog.config
  let now = Date.now()
  safeLog.logList = [{ time: now, msg: 'ok' }]
  now = formatDate(now, 'YYYY-MM-DD hh:mm:ss')
  if (config.url) {
    axios[config.method](config.url, config.params)
      .then(() => {
        config.callback(safeLog.logList)
        safeLog.logList = []
      })
      .catch(() => {
        config.callback(safeLog.logList)
        safeLog.logList = []
      })
  } else {
    console.log(safeLog.logList)
    safeLog.logList = []
  }
}

export default safeLog
