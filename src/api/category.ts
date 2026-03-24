/**
 * 分类模块 API
 */
import { get, post, del } from '@/utils/request'

// 标签树节点类型
export interface TagTreeNode {
  id: number
  name: string
  children: TagTreeNode[] | null
}

// 创建主标签请求参数
export interface CreateMainTagParams {
  name: string
}

// 创建子标签请求参数
export interface CreateSubTagParams {
  parentId: number
  name: string
}

// 删除标签请求参数
export interface DeleteTagParams {
  name: string
}

/**
 * 创建主标签
 * @param data 主标签信息
 * @returns Promise<{id: number, name: string, parentId: number, createdAt: string}>
 */
export function createMainTagApi(data: CreateMainTagParams) {
  return post('/category/main-tag', data)
}

/**
 * 创建子标签
 * @param data 子标签信息
 * @returns Promise<{id: number, name: string, parentId: number, createdAt: string}>
 */
export function createSubTagApi(data: CreateSubTagParams) {
  return post('/category/sub-tag', data)
}

/**
 * 删除标签
 * @param data 标签名称
 * @returns Promise<void>
 */
export function deleteTagApi(data: DeleteTagParams) {
  return del('/category/tag', { data })
}

/**
 * 获取标签树
 * @returns Promise<TagTreeNode[]>
 */
export function getTagTreeApi() {
  return get<TagTreeNode[]>('/category/tags/tree')
}
