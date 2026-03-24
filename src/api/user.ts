/**
 * 用户模块 API
 */
import { post } from '@/utils/request'
import type { UserInfo, LoginData } from '@/utils/auth'

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterParams {
  username: string
  email: string
  password: string
}

// 修改密码请求参数
export interface ChangePasswordParams {
  username: string
  email: string
  oldPassword: string
  newPassword: string
}

/**
 * 用户登录
 * @param data 登录参数
 * @returns Promise<LoginData>
 */
export function loginApi(data: LoginParams) {
  return post<LoginData>('/user/login', data)
}

/**
 * 用户注册
 * @param data 注册参数
 * @returns Promise<UserInfo>
 */
export function registerApi(data: RegisterParams) {
  return post<UserInfo>('/user/register', data)
}

/**
 * 修改密码
 * @param data 修改密码参数
 * @returns Promise<void>
 */
export function changePasswordApi(data: ChangePasswordParams) {
  return post('/user/change-password', data)
}

/**
 * 退出登录
 * @returns Promise<void>
 */
export function logoutApi() {
  return post('/user/logout')
}
