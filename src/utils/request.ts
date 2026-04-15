import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { isTokenExpired, handleTokenExpiry } from './auth'

// 统一响应数据结构
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // API 基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 检查 token 是否过期
    if (token && isTokenExpired()) {
      // token 已过期，清除并跳转
      handleTokenExpiry()
      return Promise.reject(new Error('Token 已过期'))
    }
    
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
      config.headers.set('Content-Type', 'application/json;charset=UTF-8')
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 如果返回的状态码不是 2xxxx，则为错误
    if (!String(res.code).startsWith('2')) {
      // 40106: 未授权访问，40109: Token 无效或已过期
      if (res.code === 40106 || res.code === 40109) {
        ElMessage.error('登录已过期，请重新登录')
        // 清除 token 并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else if (res.code === 40110) {
        // 40110: 登录失败次数过多，账户被锁定（由登录页自行处理提示）
        const error = new Error(res.msg || '账户已锁定') as Error & { code: number }
        error.code = 40110
        return Promise.reject(error)
      } else {
        ElMessage.error(res.msg || '请求失败')
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    } else {
      // 返回完整的 response 对象，保持 AxiosResponse 类型
      return response
    }
  },
  (error) => {
    console.error('网络错误:', error)
    
    // 处理不同的 HTTP 错误状态
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        default:
          ElMessage.error(error.response.data?.msg || `请求失败：${error.response.status}`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 */
export function get<T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.get(url, { params, ...config })
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.post(url, data, config)
}

export function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.put(url, data, config)
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.delete(url, config)
}

export default request
