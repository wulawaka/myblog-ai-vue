# API 服务层使用指南

## 📁 目录结构

```
src/api/
├── index.ts        # 统一导出文件
├── user.ts         # 用户模块 API（登录、注册、修改密码等）
├── category.ts     # 分类模块 API（标签管理）
└── article.ts      # 文章模块 API（文章 CRUD）
```

## ✅ 已完成的 API 接口

### 一、用户模块 (`user.ts`)

| 函数名 | 说明 | 请求方法 | 路径 |
|--------|------|----------|------|
| `loginApi` | 用户登录 | POST | `/api/user/login` |
| `registerApi` | 用户注册 | POST | `/api/user/register` |
| `changePasswordApi` | 修改密码 | POST | `/api/user/change-password` |
| `logoutApi` | 退出登录 | POST | `/api/user/logout` |

#### 使用示例

```typescript
import { loginApi, registerApi, logoutApi } from '@/api/user'
import { setToken, setUserInfo } from '@/utils/auth'

// 1. 用户登录
const loginResult = await loginApi({
  username: 'admin',
  password: '123456'
})
// 保存 token 和用户信息
setToken(loginResult.data.token)
setUserInfo(loginResult.data.userInfo)

// 2. 用户注册
const registerResult = await registerApi({
  username: 'newuser',
  email: 'user@example.com',
  password: '123456'
})

// 3. 修改密码
await changePasswordApi({
  username: 'admin',
  email: 'admin@example.com',
  oldPassword: '123456',
  newPassword: 'newpass123'
})

// 4. 退出登录
await logoutApi()
// 清除本地数据
removeToken()
removeUserInfo()
```

---

### 二、分类模块 (`category.ts`)

| 函数名 | 说明 | 请求方法 | 路径 |
|--------|------|----------|------|
| `createMainTagApi` | 创建主标签 | POST | `/api/category/main-tag` |
| `createSubTagApi` | 创建子标签 | POST | `/api/category/sub-tag` |
| `deleteTagApi` | 删除标签 | DELETE | `/api/category/tag` |
| `getTagTreeApi` | 获取标签树 | GET | `/api/category/tags/tree` |

#### 使用示例

```typescript
import { createMainTagApi, createSubTagApi, getTagTreeApi, deleteTagApi } from '@/api/category'

// 1. 创建主标签
const mainTagResult = await createMainTagApi({
  name: 'Java'
})

// 2. 创建子标签
const subTagResult = await createSubTagApi({
  parentId: mainTagResult.data.id,
  name: 'Spring'
})

// 3. 获取标签树
const tagTreeResult = await getTagTreeApi()
// 返回数据结构：
// [
//   {
//     id: 1,
//     name: 'Java',
//     children: [
//       { id: 2, name: 'Spring', children: null },
//       { id: 3, name: 'MyBatis', children: null }
//     ]
//   }
// ]

// 4. 删除标签
await deleteTagApi({
  name: 'Java'
})
```

---

### 三、文章模块 (`article.ts`)

| 函数名 | 说明 | 请求方法 | 路径 |
|--------|------|----------|------|
| `createArticleApi` | 创建文章 | POST | `/api/article` |
| `getArticleListApi` | 获取文章列表 | GET | `/api/article/list` |
| `deleteArticleApi` | 删除文章 | DELETE | `/api/article/{id}` |
| `updateTopStatusApi` | 更新置顶状态 | PUT | `/api/article/top` |

#### 使用示例

```typescript
import { 
  createArticleApi, 
  getArticleListApi, 
  deleteArticleApi, 
  updateTopStatusApi 
} from '@/api/article'
import type { ArticleListParams, CreateArticleParams } from '@/api/article'

// 1. 创建文章
const articleResult = await createArticleApi({
  userId: 1,
  categoryId: 1, // 主标签 ID
  title: 'Spring Boot 入门教程',
  summary: '本文介绍 Spring Boot 的基础知识...',
  content: '# Spring Boot 入门\n\nSpring Boot 是...',
  isTop: 0,
  isDraft: 0,
  scategoryId: '2,3' // 子标签 ID，逗号分隔
})

// 2. 获取文章列表（分页 + 筛选）
const listParams: ArticleListParams = {
  pageNum: 1,
  pageSize: 10,
  categoryId: 1, // 按主标签筛选
  scategoryIds: '2,3' // 按子标签筛选
}
const listResult = await getArticleListApi(listParams)
// 返回数据结构：
// {
//   list: [...],
//   total: 15,
//   pageNum: 1,
//   pageSize: 10,
//   totalPages: 2
// }

// 3. 删除文章
await deleteArticleApi(articleId)

// 4. 更新文章置顶状态
await updateTopStatusApi({
  articleId: 1,
  isTop: 1 // 1-置顶，0-取消置顶
})
```

---

## 🔧 实际应用场景

### 场景 1：登录页面

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/user'
import { setToken, setUserInfo } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await loginApi(loginForm.value)
    // 保存 token 和用户信息
    setToken(res.data.token)
    setUserInfo(res.data.userInfo)
    
    ElMessage.success('登录成功')
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 场景 2：文章列表页面

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleListApi } from '@/api/article'
import type { Article, ArticleListData } from '@/api/article'

const articleList = ref<Article[]>([])
const loading = ref(false)
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getArticleListApi({
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    })
    
    articleList.value = res.data.list
    pagination.value.total = res.data.total
    pagination.value.totalPages = res.data.totalPages
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>
```

### 场景 3：分类管理页面

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTagTreeApi, createMainTagApi, createSubTagApi } from '@/api/category'
import type { TagTreeNode } from '@/api/category'

const tagTree = ref<TagTreeNode[]>([])
const loading = ref(false)

const fetchTagTree = async () => {
  loading.value = true
  try {
    const res = await getTagTreeApi()
    tagTree.value = res.data
  } catch (error) {
    console.error('获取标签树失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAddMainTag = async (tagName: string) => {
  try {
    await createMainTagApi({ name: tagName })
    // 刷新标签树
    fetchTagTree()
  } catch (error) {
    console.error('创建主标签失败:', error)
  }
}

const handleAddSubTag = async (parentId: number, tagName: string) => {
  try {
    await createSubTagApi({ parentId, name: tagName })
    // 刷新标签树
    fetchTagTree()
  } catch (error) {
    console.error('创建子标签失败:', error)
  }
}

onMounted(() => {
  fetchTagTree()
})
</script>
```

---

## 📝 TypeScript 类型支持

所有 API 都提供了完整的 TypeScript 类型定义：

```typescript
// 导入类型
import type { 
  LoginParams, 
  RegisterParams, 
  Article, 
  ArticleListData,
  TagTreeNode 
} from '@/api'

// 使用类型
const loginData: LoginParams = {
  username: 'admin',
  password: '123456'
}

const article: Article = {
  id: 1,
  userId: 1,
  categoryId: 1,
  title: '文章标题',
  // ... 其他字段
}
```

---

## ⚠️ 注意事项

1. **错误处理**：
   - 所有 API 调用都应该用 `try-catch` 包裹
   - Axios 拦截器会自动显示错误提示
   - 可以在 catch 中记录日志或做额外处理

2. **Token 管理**：
   - Token 过期会自动跳转登录页
   - 无需手动处理 401 错误

3. **请求参数验证**：
   - 建议在调用 API 前进行表单验证
   - 可以使用 Element Plus 的 Form 组件验证

4. **加载状态**：
   - 建议使用 `loading` 状态提升用户体验
   - 可以使用 Element Plus 的 `v-loading` 指令

---

## 🎯 下一步

API 服务层已完成，接下来可以创建：
1. ✅ **登录页面** - 使用 `loginApi`
2. ✅ **注册页面** - 使用 `registerApi`
3. ✅ **文章列表页** - 使用 `getArticleListApi`
4. ✅ **分类管理页** - 使用标签树相关 API
5. ✅ **文章编辑页** - 使用 `createArticleApi`

你想先实现哪个页面呢？
