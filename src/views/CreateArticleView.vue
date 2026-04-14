<template>
  <div class="immersive-editor-container">
    
    <header class="editor-header">
      <el-form 
        :model="articleForm" 
        :rules="articleRules" 
        ref="articleFormRef" 
        class="inline-form"
      >
        <el-form-item prop="title" class="form-item item-title">
          <el-input 
            v-model="articleForm.title" 
            placeholder="输入文章标题..." 
            maxlength="200"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="summary" class="form-item item-summary">
          <el-input
            v-model="articleForm.summary"
            placeholder="输入文章概述..."
            maxlength="500"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="categoryId" class="form-item item-select">
          <el-select 
            v-model="articleForm.categoryId" 
            placeholder="选择主标签" 
            size="large"
            @change="handleCategoryChange"
          >
            <el-option 
              v-for="tag in mainTags" 
              :key="tag.id" 
              :label="tag.name" 
              :value="tag.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="subCategoryId" class="form-item item-select">
          <el-select 
            v-model="articleForm.subCategoryId" 
            placeholder="选择子标签"
            size="large"
            :disabled="!articleForm.categoryId"
          >
            <el-option 
              v-for="subTag in subTags" 
              :key="subTag.id" 
              :label="subTag.name" 
              :value="subTag.id" 
            />
          </el-select>
        </el-form-item>

        <div class="form-actions">
          <el-button size="large" @click="handleDraft">存草稿</el-button>
          <el-button type="primary" size="large" @click="submitArticle(false)">发布文章</el-button>
        </div>
      </el-form>
    </header>

    <main class="editor-main">
      <div class="editor-pane input-pane">
        <!-- Markdown 工具栏 -->
        <div class="markdown-toolbar">
          <el-button-group>
            <el-tooltip content="标题" placement="top">
              <el-button size="small" @click="insertMarkdown('# ')">
                <span style="font-weight: bold;">H</span>
              </el-button>
            </el-tooltip>
            <el-tooltip content="粗体" placement="top">
              <el-button size="small" @click="wrapMarkdown('**', '**')">
                <span style="font-weight: bold;">B</span>
              </el-button>
            </el-tooltip>
            <el-tooltip content="斜体" placement="top">
              <el-button size="small" @click="wrapMarkdown('*', '*')">
                <span style="font-style: italic;">I</span>
              </el-button>
            </el-tooltip>
            <el-tooltip content="引用" placement="top">
              <el-button size="small" @click="wrapLineWith('> ')">
                ❝
              </el-button>
            </el-tooltip>
            <el-tooltip content="代码块" placement="top">
              <el-button size="small" @click="wrapMarkdown('\n```\n', '\n```\n')">
                &lt;/&gt;
              </el-button>
            </el-tooltip>
            <el-tooltip content="行内代码" placement="top">
              <el-button size="small" @click="wrapMarkdown('`', '`')">
                &lt;&gt;
              </el-button>
            </el-tooltip>
            <el-tooltip content="无序列表" placement="top">
              <el-button size="small" @click="wrapLineWith('- ')">
                •
              </el-button>
            </el-tooltip>
            <el-tooltip content="有序列表" placement="top">
              <el-button size="small" @click="wrapLineWith('1. ', true)">
                1.
              </el-button>
            </el-tooltip>
            <el-tooltip content="链接" placement="top">
              <el-button size="small" @click="wrapMarkdown('[', '](url)')">
                🔗
              </el-button>
            </el-tooltip>
            <el-tooltip content="图片" placement="top">
              <el-button size="small" @click="wrapMarkdown('![alt]', '(url)')">
                🖼️
              </el-button>
            </el-tooltip>
            <el-tooltip content="分割线" placement="top">
              <el-button size="small" @click="insertMarkdown('\n---\n')">
                ───
              </el-button>
            </el-tooltip>
            <el-tooltip content="表格" placement="top">
              <el-button size="small" @click="insertTable()">
                ▦
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
        
        <el-input
          v-model="articleForm.content"
          type="textarea"
          placeholder="在此开始你的 Markdown 创作..."
          resize="none"
          class="markdown-textarea"
          @paste="handlePaste"
        />
      </div>

      <div class="editor-pane preview-pane">
        <div class="markdown-preview" v-html="compiledMarkdown"></div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getTagTreeApi, type TagTreeNode } from '@/api/category'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/utils/request'
import { createArticleApi, getArticleDetailApi, type CreateArticleParams, type Article } from '@/api/article'
import { uploadToOss } from '@/utils/oss'
import router from '@/router'

// --- 路由 ---
const route = useRoute()

// --- 表单与验证数据 ---
const articleFormRef = ref<FormInstance>()
const articleForm = reactive({
  title: '',
  summary: '',
  content: '',
  categoryId: null as number | null,
  subCategoryId: null as number | null
})

const articleRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入文章概述', trigger: 'blur' }],
  content: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择主标签', trigger: 'change' }],
  subCategoryId: [{ required: true, message: '请选择子标签', trigger: 'change' }]
})

// --- 标签数据 ---
const mainTags = ref<TagTreeNode[]>([])
const subTags = ref<{ id: number; name: string }[]>([])

// 子标签映射表（用于快速查找）
const allSubTagsMap = reactive<Record<number, { id: number; name: string }[]>>({})

// 当前是否为编辑模式
const isEditMode = ref(false)
const editArticleId = ref<number | null>(null)

// 自动保存相关
let autoSaveTimer: number | null = null
const AUTO_SAVE_KEY = 'article_draft_auto_save'

// 自动保存到 localStorage
const autoSaveToLocalStorage = () => {
  const draftData = {
    title: articleForm.title,
    summary: articleForm.summary,
    content: articleForm.content,
    categoryId: articleForm.categoryId,
    subCategoryId: articleForm.subCategoryId,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(draftData))
  
  // 显示保存提示（使用 ElMessage，不会打断用户输入）
  ElMessage({
    message: '已自动保存草稿',
    type: 'success',
    duration: 2000,
    showClose: true
  })
}

// 防抖函数：用户停止输入3秒后自动保存
const debounceAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = window.setTimeout(() => {
    // 只有当有内容时才保存
    if (articleForm.title || articleForm.summary || articleForm.content) {
      autoSaveToLocalStorage()
    }
  }, 3000)
}

// 从 localStorage 恢复草稿
const loadDraftFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem(AUTO_SAVE_KEY)
    if (savedData) {
      const draftData = JSON.parse(savedData)
      
      // 询问用户是否恢复
      ElMessageBox.confirm(
        `检测到未保存的草稿（${new Date(draftData.timestamp).toLocaleString()}），是否恢复？`,
        '提示',
        {
          confirmButtonText: '恢复',
          cancelButtonText: '放弃',
          type: 'warning',
        }
      ).then(() => {
        // 用户选择恢复
        articleForm.title = draftData.title || ''
        articleForm.summary = draftData.summary || ''
        articleForm.content = draftData.content || ''
        articleForm.categoryId = draftData.categoryId || null
        articleForm.subCategoryId = draftData.subCategoryId || null
        
        ElMessage.success('草稿已恢复')
      }).catch(() => {
        // 用户选择放弃，清除本地存储
        localStorage.removeItem(AUTO_SAVE_KEY)
        ElMessage.info('已放弃草稿')
      })
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
}

// 加载标签树
const loadTagTree = async () => {
  try {
    const res = await getTagTreeApi()
    const data = (res.data as unknown) as { data: TagTreeNode[] }
    if (data && data.data) {
      mainTags.value = data.data
      // 提取所有子标签（用于快速查找）
      data.data.forEach((mainTag: TagTreeNode) => {
        if (mainTag.children) {
          allSubTagsMap[mainTag.id] = mainTag.children.map(child => ({
            id: child.id,
            name: child.name
          }))
        }
      })
      
      // 如果是编辑模式，加载文章详情
      if (isEditMode.value && editArticleId.value) {
        await loadArticleForEdit(editArticleId.value)
      }
    }
  } catch (error) {
    console.error('获取标签树失败:', error)
    const axiosError = error as AxiosError<ApiResponse>
    ElMessage.error(axiosError.response?.data?.msg || '获取标签树失败，请稍后重试')
  }
}

// 加载编辑文章的详情
const loadArticleForEdit = async (articleId: number) => {
  try {
    const res = await getArticleDetailApi(articleId)
    const data = (res.data as unknown) as { data: Article }
    
    if (data && data.data) {
      const article = data.data
      // 填充表单
      articleForm.title = article.title
      articleForm.summary = article.summary
      articleForm.content = article.content
      articleForm.categoryId = article.categoryId
      
      // 如果有子标签，设置子标签
      if (article.subCategoryIds) {
        const subCategoryId = parseInt(article.subCategoryIds)
        if (!isNaN(subCategoryId)) {
          articleForm.subCategoryId = subCategoryId
          // 确保子标签列表已加载
          const subTagsForCategory = allSubTagsMap[article.categoryId]
          if (subTagsForCategory) {
            subTags.value = subTagsForCategory
          }
        }
      }
      
      ElMessage.success('文章已加载，可以编辑')
    }
  } catch (error) {
    console.error('加载文章详情失败:', error)
    const axiosError = error as AxiosError<ApiResponse>
    ElMessage.error(axiosError.response?.data?.msg || '加载文章详情失败，请稍后重试')
  }
}

// 处理主标签变化
const handleCategoryChange = (categoryId: number) => {
  articleForm.subCategoryId = null
  if (categoryId) {
    subTags.value = allSubTagsMap[categoryId] || []
  } else {
    subTags.value = []
  }
}

// --- Markdown 渲染核心 ---
const compiledMarkdown = computed(() => {
  if (!articleForm.content) return '<div class="empty-tip">预览区：输入内容后实时展示</div>'
  return marked(articleForm.content)
})

// --- Markdown 快捷插入功能 ---

// 获取 textarea 元素
const getTextareaElement = () => {
  const textarea = document.querySelector('.markdown-textarea textarea') as HTMLTextAreaElement
  return textarea
}

// 在光标位置插入文本
const insertAtCursor = (text: string) => {
  const textarea = getTextareaElement()
  if (!textarea) return
  
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const before = articleForm.content.substring(0, startPos)
  const after = articleForm.content.substring(endPos)
  
  articleForm.content = before + text + after
  
  // 恢复光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(startPos + text.length, startPos + text.length)
  }, 0)
}

// 包裹选中的文本
const wrapMarkdown = (prefix: string, suffix: string) => {
  const textarea = getTextareaElement()
  if (!textarea) return
  
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const selectedText = articleForm.content.substring(startPos, endPos)
  
  const before = articleForm.content.substring(0, startPos)
  const after = articleForm.content.substring(endPos)
  
  articleForm.content = before + prefix + selectedText + suffix + after
  
  // 恢复光标位置（如果有选中文本，光标在选中内容之后；否则在标记中间）
  setTimeout(() => {
    textarea.focus()
    if (selectedText) {
      textarea.setSelectionRange(startPos + prefix.length, endPos + prefix.length)
    } else {
      textarea.setSelectionRange(startPos + prefix.length, startPos + prefix.length)
    }
  }, 0)
}

// 为每一行添加前缀
const wrapLineWith = (prefix: string, autoNumber = false) => {
  const textarea = getTextareaElement()
  if (!textarea) return
  
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const selectedText = articleForm.content.substring(startPos, endPos)
  
  let result = ''
  if (selectedText) {
    // 对选中的多行添加前缀
    const lines = selectedText.split('\n')
    if (autoNumber) {
      result = lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
    } else {
      result = lines.map(line => `${prefix}${line}`).join('\n')
    }
  } else {
    // 当前行添加前缀
    const before = articleForm.content.substring(0, startPos)
    const lastNewlineIndex = before.lastIndexOf('\n')
    const currentLineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1
    const currentLine = articleForm.content.substring(currentLineStart, endPos)
    
    const beforeLine = articleForm.content.substring(0, currentLineStart)
    const afterLine = articleForm.content.substring(endPos)
    
    result = beforeLine + prefix + currentLine + afterLine
  }
  
  if (selectedText) {
    const before = articleForm.content.substring(0, startPos)
    const after = articleForm.content.substring(endPos)
    articleForm.content = before + result + after
  } else {
    articleForm.content = result
  }
  
  setTimeout(() => {
    textarea.focus()
  }, 0)
}

// 插入固定文本
const insertMarkdown = (text: string) => {
  insertAtCursor(text)
}

// 插入表格模板
const insertTable = () => {
  const tableTemplate = `\n| 列 1 | 列 2 | 列 3 |
|------|------|------|
| 内容 1 | 内容 2 | 内容 3 |
| 内容 4 | 内容 5 | 内容 6 |\n`
  insertAtCursor(tableTemplate)
}

// 处理粘贴事件（支持图片上传）
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item) continue
    // 识别是否为图片
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (!file) continue

      event.preventDefault() // 阻止默认粘贴行为
      
      try {
        ElMessage.info('正在上传图片到 OSS...')
        const url = await uploadToOss(file)
        
        // 构造 Markdown 图片语法并插入
        const markdownImage = `\n![image](${url})\n`
        insertMarkdown(markdownImage)
        
        ElMessage.success('图片上传成功！')
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('图片上传失败，请重试')
      }
      break // 一次只处理一张图片
    }
  }
}

// --- 操作逻辑 ---
const submitArticle = async (isDraft = false) => {
  if (!articleFormRef.value) return
  
  await articleFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // 从 localStorage 获取用户信息
        const userInfoStr = localStorage.getItem('userInfo')
        let userId = 0
        if (userInfoStr && userInfoStr !== 'undefined') {
          try {
            const userInfo = JSON.parse(userInfoStr)
            userId = userInfo.id
          } catch (e) {
            console.error('解析用户信息失败:', e)
            ElMessage.error('用户信息异常，请重新登录')
            return
          }
        }
        
        // 构建请求参数
        const articleData: CreateArticleParams = {
          userId,
          categoryId: articleForm.categoryId!,
          title: articleForm.title,
          summary: articleForm.summary,
          content: articleForm.content,
          isTop: 0,
          isDraft: isDraft ? 1 : 0, // 根据参数设置草稿状态
          isDeleted: 0
        }
        
        // 如果有子标签，添加 scategoryId 参数
        if (articleForm.subCategoryId) {
          articleData.scategoryId = String(articleForm.subCategoryId)
        }
        
        console.log('提交的数据：', articleData)
        
        // 调用创建文章 API
        const res = await createArticleApi(articleData)
        // 注意：由于响应拦截器返回的是完整的 AxiosResponse
        // 所以 res.data 才是实际的 API 响应数据
        console.log('API 返回:', res)
        console.log('API 响应数据:', res.data)
        
        // 类型断言：将 res.data 断言为 ApiResponse<Article>
        const apiResponse = res.data as unknown as ApiResponse<{ id: number }>
        console.log('响应 code:', apiResponse.code)
        
        if (apiResponse.code === 20201) {
          ElMessage.success(isDraft ? '草稿已保存！' : '文章发布成功！')
          // 清除 localStorage 中的自动保存草稿
          localStorage.removeItem(AUTO_SAVE_KEY)
          // 跳转到首页或我的文章页面
          router.push('/')
        } else {
          ElMessage.error(apiResponse.msg || '发布失败')
        }
      } catch (error) {
        console.error('发布文章失败:', error)
        const axiosError = error as AxiosError<ApiResponse>
        ElMessage.error(axiosError.response?.data?.msg || '发布失败，请稍后重试')
      }
    } else {
      console.log('验证失败', fields)
      ElMessage.error('请完善必填信息')
    }
  })
}

// 存草稿 - 简化版验证
const handleDraft = () => {
  // 检查所有必填字段是否有值
  if (!articleForm.title || !articleForm.summary || !articleForm.content || 
      !articleForm.categoryId || !articleForm.subCategoryId) {
    ElMessage.warning('请填写完整')
    return
  }
  
  // 调用提交函数，传入 isDraft=true
  submitArticle(true)
}

onMounted(() => {
  // 检查是否是编辑模式
  if (route.query.editId) {
    isEditMode.value = true
    editArticleId.value = parseInt(route.query.editId as string)
  } else {
    // 如果不是编辑模式，尝试从 localStorage 恢复草稿
    loadDraftFromLocalStorage()
  }
  loadTagTree()
})

// 监听表单变化，自动保存
watch(
  () => [articleForm.title, articleForm.summary, articleForm.content, articleForm.categoryId, articleForm.subCategoryId],
  () => {
    // 只有在非编辑模式下才自动保存
    if (!isEditMode.value) {
      debounceAutoSave()
    }
  },
  { deep: true }
)
</script>

<style scoped>
/* * 核心容器：占据除去顶部导航栏(如果有)的完整屏幕高度
 * 假设你有 60px 的全局导航栏，所以这里用了 calc(100vh - 60px)
 */
.immersive-editor-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); 
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
}

/* --- 顶部工具栏 --- */
.editor-header {
  height: 64px;
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
}

.inline-form {
  display: flex;
  width: 100%;
  gap: 16px;
  align-items: center;
}

/* 清除 el-form-item 自带的底部 margin，让其在单行居中 */
:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

/* 分配输入框的宽度比例 */
.item-title { flex: 3; }
.item-summary { flex: 4; }
.item-select { flex: 1.5; min-width: 120px; }

/* 调整输入框的样式让它看起来更干净 */
:deep(.el-input__wrapper), :deep(.el-select .el-input__wrapper) {
  box-shadow: none;
  background-color: #f4f5f5;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1e80ff inset;
  background-color: #fff;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-left: auto; /* 按钮推到最右侧 */
}

/* --- 下方双栏写作区 --- */
.editor-main {
  display: flex;
  flex: 1; /* 填满剩余高度 */
  overflow: hidden; /* 隐藏大滚动条，让左右两栏各自滚动 */
}

.editor-pane {
  flex: 1;
  width: 50%;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Markdown 工具栏 */
.markdown-toolbar {
  padding: 8px 12px;
  background-color: #f4f5f5;
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  align-items: center;
  gap: 8px;
}

.markdown-toolbar .el-button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.markdown-toolbar .el-button {
  min-width: 32px;
  padding: 6px 10px;
  font-size: 14px;
}

/* 左栏：输入区 */
.input-pane {
  border-right: 1px solid #e4e6eb;
  background-color: #fafafa;
}

/* 彻底重置 textarea 样式，让它填满整个左栏无死角 */
.markdown-textarea {
  flex: 1;
  width: 100%;
}
:deep(.markdown-textarea .el-textarea__inner) {
  height: 100%;
  border: none;
  border-radius: 0;
  box-shadow: none !important;
  background-color: transparent;
  padding: 24px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace; /* 适合代码和MD的等宽字体 */
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  resize: none;
}
:deep(.markdown-textarea .el-textarea__inner:focus) {
  background-color: #fff;
}

/* 右栏：预览区 */
.preview-pane {
  padding: 24px 32px;
  background-color: #fff;
}

.empty-tip {
  color: #8a919f;
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
}

/* --- Markdown 渲染后的基础美化 --- */
.markdown-preview {
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
  color: #252933;
  line-height: 1.8;
  word-wrap: break-word;
}

.markdown-preview :deep(h1), 
.markdown-preview :deep(h2), 
.markdown-preview :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: #1d2129;
}

.markdown-preview :deep(h1) { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }
.markdown-preview :deep(h2) { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #eaecef; }

.markdown-preview :deep(p) { margin-bottom: 1.2em; }

.markdown-preview :deep(code) {
  padding: 0.2em 0.4em;
  background-color: #f4f5f5;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  color: #eb5757;
}

.markdown-preview :deep(pre) {
  padding: 16px;
  overflow: auto;
  background-color: #282c34;
  border-radius: 6px;
  color: #abb2bf;
}

.markdown-preview :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.9em;
}

.markdown-preview :deep(blockquote) {
  padding: 0 1em;
  color: #8a919f;
  border-left: 4px solid #cdd0d6;
  margin: 0 0 1.2em 0;
  background-color: #f7f8fa;
}
</style>