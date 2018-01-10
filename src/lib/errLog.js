/**
 * @author xiaoping
 * @email edwardhjp@gmail.com
 * @create date 2017-12-30 03:36:34
 * @modify date 2017-12-30 03:36:34
 * @desc [错误日志]
*/

import axios from 'axios'
import { on } from 'xp-dom'
import { debounce } from 'xp-utils'

let errLog = {
  logList: [], // 日志列表
  config: { // 可以传参数改变的配置
    active: true, // 是否开启，默认true
    concat: true, // 合并错误内容，默认true
    url: '', // 日志回调地址，url不填写，则为本地console.log
    method: 'post', // 日志回调方法
    params: {}, // 传递的参数
    delay: 2000, // 上报执行间隔
    limit: 10, // 合并请求上限
    callback: () => {}, // 回调函数
  }
}

errLog.init = (opts) => {
  errLog.config = {...errLog.config, ...opts}
  __init()
}

// 清空日志
errLog.destory = () => {
  errLog.logList = []
}

// 开始函数
function __init () {
  if (!errLog.config.active) return
  let config = errLog.config
  config.callback = debounce(config.callback, config.delay) // debounce函数

  // 监听全局runtime error
  window.onerror = () => {
    __log(formatRuntimeError.apply(null, arguments))
  }

  // 监听script error
  on(window, 'error', (e) => {
    let tag = e.target
    if (tag !== window && tag.nodeName) {
      __log(formatScriptError(tag))
    }
  })

  // 监听unhandledrejection error
  on(window, 'unhandledrejection', (e) => {
    __log(formatPromiseError(e))
  })
}

// runtime错误格式化
function formatRuntimeError (msg, url, line, col, err) {
  return {
    type: 'runtime',
    desc: msg + ' at ' + url + ':' + line + ':' + col,
    err: err,
  }
}

// script错误格式化
function formatScriptError (tag) {
  return {
    type: 'script',
    desc: tag.baseURI + '@' + (tag.src || tag.href),
    err: 'load error',
  }
}

// promise错误格式化
function formatPromiseError (e) {
  return {
    type: 'promise',
    desc: e.reason,
    err: 'promise error',
  }
}

// 日志函数
function __log (log) {
  let config = errLog.config
  if (config.concat && errLog.logList.length < config.limit) {
    errLog.logList.push(log) // 合并错误日志
    return
  } else {
    errLog.logList = [log]
  }
  if (config.url) {
    axios[config.method](config.url, config.params)
      .then(() => {
        config.callback(errLog.logList)
        errLog.logList = []
      })
      .catch(() => {
        config.callback(errLog.logList)
        errLog.logList = []
      })
  } else {
    console.log(errLog.logList)
    errLog.logList = []
  }
}

export default errLog
