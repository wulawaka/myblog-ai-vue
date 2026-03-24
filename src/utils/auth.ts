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

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  if (token) {
    localStorage.setItem('token', token)
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
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem('token')
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
  return !!getToken()
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
