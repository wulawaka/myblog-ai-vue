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
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
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
              v-for="subCategory in subCategories" 
              :key="subCategory.id" 
              :label="subCategory.name" 
              :value="subCategory.id" 
            />
          </el-select>
        </el-form-item>

        <div class="form-actions">
          <el-button size="large" @click="handleDraft">存草稿</el-button>
          <el-button type="primary" size="large" @click="submitArticle">发布文章</el-button>
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
        />
      </div>

      <div class="editor-pane preview-pane">
        <div class="markdown-preview" v-html="compiledMarkdown"></div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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

// --- 分类数据模拟 (保留你原有的逻辑) ---
const categories = ref([{ id: 1, name: '前端' }, { id: 2, name: '后端' }])
const subCategories = ref<{ id: number; name: string }[]>([])
const allSubCategories: Record<number, { id: number; name: string }[]> = {
  1: [{ id: 101, name: 'Vue' }, { id: 102, name: 'React' }],
  2: [{ id: 201, name: 'Java' }, { id: 202, name: 'Python' }]
}

const fetchCategories = async () => { /* 实际项目中替换为 API */ }
const fetchSubCategories = async (categoryId: number) => {
  subCategories.value = allSubCategories[categoryId] || []
}

const handleCategoryChange = (val: number) => {
  articleForm.subCategoryId = null
  if (val) fetchSubCategories(val)
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

// --- 操作逻辑 ---
const submitArticle = async () => {
  if (!articleFormRef.value) return
  await articleFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('提交的数据：', articleForm)
      ElMessage.success('文章发布成功！')
      // router.push('/') 等后续跳转
    } else {
      console.log('验证失败', fields)
      ElMessage.error('请完善必填信息')
    }
  })
}

const handleDraft = () => {
  ElMessage.success('草稿已保存')
}

onMounted(() => {
  fetchCategories()
})
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