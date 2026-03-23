# Axios 配置说明

## 📁 文件结构

```
src/
├── utils/
│   ├── request.ts      # Axios 实例封装（请求/响应拦截器、统一错误处理）
│   └── auth.ts         # 认证工具函数（Token 管理、用户信息管理）
└── router/
    └── index.ts        # 路由配置（包含登录验证守卫）
```

## ✅ 已完成功能

### 1. Axios 实例配置 (`request.ts`)
- ✅ 统一 API 请求基础路径：`/api`
- ✅ 请求超时时间：15 秒
- ✅ **请求拦截器**：自动添加 Token 到请求头
- ✅ **响应拦截器**：
  - 统一处理业务状态码（2xxxx 为成功，4xxxx/5xxxx 为失败）
  - Token 过期自动跳转登录页
  - 统一错误提示（Element Plus Message）
- ✅ 封装的请求方法：`get`、`post`、`put`、`del`

### 2. 认证工具 (`auth.ts`)
- ✅ Token 管理：`setToken`、`getToken`、`removeToken`
- ✅ 用户信息管理：`setUserInfo`、`getUserInfo`、`removeUserInfo`
- ✅ 登录状态检查：`isLoggedIn`
- ✅ 退出登录：`logout`

### 3. 环境变量配置
- ✅ `.env.development` - 开发环境配置
  ```
  VITE_API_BASE_URL=/api
  ```
- ✅ `.env.production` - 生产环境配置
  ```
  VITE_API_BASE_URL=https://your-api-domain.com/api
  ```

### 4. Vite 代理配置 (`vite.config.ts`)
- ✅ 开发环境代理到后端服务器：`http://localhost:8080`
- ✅ 解决跨域问题

### 5. 路由守卫 (`router/index.ts`)
- ✅ 登录验证：访问需要登录的页面会自动跳转到登录页
- ✅ 白名单路由：`/login`、`/register` 不需要登录
- ✅ 已登录用户访问登录页会重定向到首页
- ✅ 动态设置页面标题

## 🚀 使用示例

### 调用 API 接口

```typescript
import { get, post, put, del } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// GET 请求
const response = await get('/article/list', { pageNum: 1, pageSize: 10 })

// POST 请求
const response = await post('/user/login', { 
  username: 'admin', 
  password: '123456' 
})

// PUT 请求
const response = await put('/article/top', { 
  articleId: 1, 
  isTop: 1 
})

// DELETE 请求
const response = await del(`/article/${id}`)
```

### 认证相关操作

```typescript
import { setToken, getToken, isLoggedIn, logout, setUserInfo, getUserInfo } from '@/utils/auth'

// 登录后保存 Token 和用户信息
setToken(response.data.token)
setUserInfo(response.data.userInfo)

// 获取 Token
const token = getToken()

// 检查登录状态
if (isLoggedIn()) {
  // 已登录
}

// 获取用户信息
const userInfo = getUserInfo()

// 退出登录
logout()
```

## 📝 下一步

接下来可以创建：
1. API 服务层（按模块封装所有接口）
2. 登录/注册页面
3. 文章列表页面
4. 其他业务页面

## ⚠️ 注意事项

1. **后端地址配置**：
   - 开发环境默认代理到 `http://localhost:8080`
   - 如果后端地址不同，请修改 `vite.config.ts` 中的 `target` 配置

2. **Token 存储**：
   - Token 和用户信息存储在 localStorage
   - Token 格式：`Bearer ${token}`

3. **错误处理**：
   - 所有 API 错误都会通过 Element Plus 的 Message 组件提示
   - Token 过期会自动清除并跳转到登录页
