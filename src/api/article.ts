/**
 * 文章模块 API
 */
import { get, post, put, del } from '@/utils/request'

// 文章信息类型
export interface Article {
  id: number
  userId: number
  categoryId: number
  title: string
  summary: string
  content: string
  isTop: number
  isDraft: number
  isDeleted: number
  createdAt: string
  updatedAt: string
  userInfo: {
    username: string
    email: string
  }
  scategoryId?: string
  subCategoryIds?: string
}

// 创建文章请求参数
export interface CreateArticleParams {
  userId: number
  categoryId: number
  title: string
  summary: string
  content: string
  isTop?: number
  isDraft?: number
  isDeleted?: number
  scategoryId?: string
}

// 更新文章置顶状态请求参数
export interface UpdateTopStatusParams {
  articleId: number
  isTop: number
  userId?: number  // 添加 userId 字段
}

// 获取文章列表请求参数
export interface ArticleListParams {
  pageNum?: number
  pageSize?: number
  categoryIds?: string
  categoryId?: number
  scategoryIds?: string
  [key: string]: number | string | undefined
}

// 文章列表响应类型
export interface ArticleListData {
  list: Article[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

/**
 * 创建文章
 * @param data 文章信息
 * @returns Promise<Article>
 */
export function createArticleApi(data: CreateArticleParams) {
  return post<Article>('/article', data)
}

/**
 * 获取文章列表
 * @param params 查询参数
 * @returns Promise<ArticleListData>
 */
export function getArticleListApi(params: ArticleListParams) {
  return get<ArticleListData>('/article/list', params)
}

/**
 * 删除文章
 * @param id 文章 ID
 * @returns Promise<void>
 */
export function deleteArticleApi(id: number) {
  return del(`/article/${id}`)
}

/**
 * 更新文章置顶状态
 * @param data 文章 ID 和置顶状态
 * @returns Promise<void>
 */
export function updateTopStatusApi(data: UpdateTopStatusParams) {
  // 从 localStorage 获取用户 ID
  const userInfoStr = localStorage.getItem('userInfo')
  let userId = 0
  if (userInfoStr && userInfoStr !== 'undefined') {
    try {
      const userInfo = JSON.parse(userInfoStr)
      userId = userInfo.id
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  
  // 将 userId 添加到请求数据中
  const requestData = {
    ...data,
    userId
  }
  
  return put('/article/top', requestData)
}

/**
 * 获取文章详情
 * @param id 文章 ID
 * @returns Promise<Article>
 */
export function getArticleDetailApi(id: number) {
  return get<Article>(`/article/${id}`)
}

/**
 * 获取我的文章列表
 * @param params 查询参数
 * @returns Promise<ArticleListData>
 */
export function getMyArticleListApi(params: ArticleListParams) {
  return get<ArticleListData>('/article/my-list', params)
}

