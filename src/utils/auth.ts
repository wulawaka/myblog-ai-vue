// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
}

// 登录响应数据类型
export interface LoginData {
  userInfo: UserInfo
  token: string
}

import { ElMessage } from 'element-plus'

// Token 有效期：24 小时（毫秒）
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  if (token) {
    localStorage.setItem('token', token)
    // 保存 token 时间戳
    localStorage.setItem('tokenTime', Date.now().toString())
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  const token = localStorage.getItem('token')
  // 检查是否为空或 'undefined' 字符串
  if (!token || token === 'undefined') {
    return null
  }
  return token
}

/**
 * 检查 Token 是否过期
 * @returns boolean - true: 未过期，false: 已过期
 */
export function isTokenExpired(): boolean {
  const token = getToken()
  if (!token) {
    return true // 没有 token，视为过期
  }
  
  const tokenTime = localStorage.getItem('tokenTime')
  if (!tokenTime) {
    return true // 没有时间戳，视为过期
  }
  
  const now = Date.now()
  const tokenTimeNum = parseInt(tokenTime, 10)
  
  // 检查是否超过 2 小时
  return (now - tokenTimeNum) > TOKEN_EXPIRY_TIME
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenTime')
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  const userInfoStr = localStorage.getItem('userInfo')
  // 检查是否为空或 'undefined' 字符串
  if (!userInfoStr || userInfoStr === 'undefined') {
    return null
  }
  try {
    return JSON.parse(userInfoStr) as UserInfo
  } catch (e) {
    console.error('解析用户信息失败:', e)
    return null
  }
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem('userInfo')
}

/**
 * 判断是否已登录
 */
export function isLoggedIn(): boolean {
  const token = getToken()
  if (!token) {
    return false
  }
  // 检查 token 是否过期
  if (isTokenExpired()) {
    removeToken()
    removeUserInfo()
    return false
  }
  return true
}

/**
 * 退出登录
 */
export function logout(): void {
  removeToken()
  removeUserInfo()
  // 跳转到登录页
  window.location.href = '/login'
}

/**
 * Token 过期处理
 */
export function handleTokenExpiry(): void {
  // 清除 token 和用户信息
  removeToken()
  removeUserInfo()
  
  // 显示提示框
  ElMessage.error('登录已过期，请重新登录')
  
  // 延迟跳转到登录页
  setTimeout(() => {
    window.location.href = '/login'
  }, 1500)
}
