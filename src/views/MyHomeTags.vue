<template>
  <div class="my-tags-container">
    <div class="section-header">
      <h3 class="section-title">标签管理</h3>
      <el-button type="primary" @click="showAddMainTagDialog = true">
        <el-icon><Plus /></el-icon> 新建主标签
      </el-button>
    </div>
    
    <div v-loading="loading" element-loading-text="加载中...">
      <div v-if="tagTreeList.length > 0" class="tags-tree-container">
        <el-tree
          :data="tagTreeList"
          :props="treeProps"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <span class="tree-node-label">
                <el-icon v-if="data.children" class="folder-icon"><Folder /></el-icon>
                <el-icon v-else class="tag-icon"><PriceTag /></el-icon>
                {{ node.label }}
              </span>
              <span class="tree-node-actions">
                <el-button 
                  v-if="!data.children" 
                  type="primary" 
                  link 
                  size="small"
                  @click.stop="editSubTag(data)"
                >
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button 
                  v-if="data.children" 
                  type="primary" 
                  link 
                  size="small"
                  @click.stop="showAddSubTagDialog = true; currentParentTag = data"
                >
                  <el-icon><Plus /></el-icon> 添加子标签
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  size="small"
                  @click.stop="deleteTag(data)"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
      
      <el-empty v-else description="暂无标签" />
    </div>

    <!-- 新建主标签对话框 -->
    <el-dialog
      v-model="showAddMainTagDialog"
      title="新建主标签"
      width="400px"
      :close-on-click-modal="false"
      @close="resetMainTagForm"
    >
      <el-form :model="mainTagForm" :rules="mainTagRules" ref="mainTagFormRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="mainTagForm.name" placeholder="请输入标签名称（1-6 位字符）" maxlength="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddMainTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddMainTag" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建子标签对话框 -->
    <el-dialog
      v-model="showAddSubTagDialog"
      title="新建子标签"
      width="400px"
      :close-on-click-modal="false"
      @close="resetSubTagForm"
    >
      <el-form :model="subTagForm" :rules="subTagRules" ref="subTagFormRef" label-width="100px">
        <el-form-item label="父标签">
          <el-input :value="currentParentTag?.name" disabled />
        </el-form-item>
        <el-form-item label="子标签名称" prop="name">
          <el-input v-model="subTagForm.name" placeholder="请输入子标签名称 (1-6 位字符)" maxlength="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSubTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubTag" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑标签对话框 -->
    <el-dialog
      v-model="showEditTagDialog"
      title="编辑标签"
      width="400px"
      :close-on-click-modal="false"
      @close="resetEditTagForm"
    >
      <el-form :model="editTagForm" :rules="editTagRules" ref="editTagFormRef" label-width="80px">
        <el-form-item label="标签 ID">
          <el-input :value="String(editTagForm.id)" disabled />
        </el-form-item>
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="editTagForm.name" placeholder="请输入标签名称 (1-6 位字符)" maxlength="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditTag" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Folder, PriceTag, Edit, Delete } from '@element-plus/icons-vue'
import { getTagTreeApi, createMainTagApi, createSubTagApi, deleteTagApi, updateTagNameApi, type TagTreeNode } from '@/api/category'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/utils/request'

const loading = ref(false)
const submitting = ref(false)
const tagTreeList = ref<TagTreeNode[]>([])
const showAddMainTagDialog = ref(false)
const showAddSubTagDialog = ref(false)
const showEditTagDialog = ref(false)
const currentParentTag = ref<TagTreeNode | null>(null)
const currentEditTag = ref<TagTreeNode | null>(null)

// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'name',
}

// 主标签表单
const mainTagFormRef = ref<FormInstance>()
const mainTagForm = ref({
  name: '',
})
const mainTagRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 6, message: '标签名称长度为 1-6 位字符', trigger: 'blur' },
  ],
}

// 子标签表单
const subTagFormRef = ref<FormInstance>()
const subTagForm = ref({
  parentId: 0,
  name: '',
})
const subTagRules: FormRules = {
  name: [
    { required: true, message: '请输入子标签名称', trigger: 'blur' },
    { min: 1, max: 6, message: '子标签名称长度为 1-6 位字符', trigger: 'blur' },
  ],
}

// 编辑标签表单
const editTagFormRef = ref<FormInstance>()
const editTagForm = ref({
  id: 0,
  name: '',
})
const editTagRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 6, message: '标签名称长度为 1-6 位字符', trigger: 'blur' },
  ],
}

// 加载标签树
const loadTagTree = async () => {
  loading.value = true
  try {
    const res = await getTagTreeApi()
    const data = (res.data as unknown) as { data: TagTreeNode[] }
    if (data && data.data) {
      tagTreeList.value = data.data
    }
  } catch (error) {
    console.error('获取标签树失败:', error)
    ElMessage.error('获取标签树失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 添加主标签
const handleAddMainTag = async () => {
  if (!mainTagFormRef.value) return
  
  await mainTagFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await createMainTagApi({ name: mainTagForm.value.name })
      ElMessage.success('创建成功')
      showAddMainTagDialog.value = false
      await loadTagTree()
    } catch (error) {
      console.error('创建失败:', error)
      const axiosError = error as AxiosError<ApiResponse>
      ElMessage.error(axiosError.response?.data?.msg || '创建失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 添加子标签
const handleAddSubTag = async () => {
  if (!subTagFormRef.value || !currentParentTag.value) return
  
  const parentId = currentParentTag.value.id
  
  await subTagFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await createSubTagApi({
        parentId,
        name: subTagForm.value.name,
      })
      ElMessage.success('创建成功')
      showAddSubTagDialog.value = false
      await loadTagTree()
    } catch (error) {
      console.error('创建失败:', error)
      const axiosError = error as AxiosError<ApiResponse>
      ElMessage.error(axiosError.response?.data?.msg || '创建失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 编辑子标签
const editSubTag = (tag: TagTreeNode) => {
  currentEditTag.value = tag
  editTagForm.value = {
    id: tag.id,
    name: tag.name,
  }
  showEditTagDialog.value = true
}

// 更新标签名称
const handleEditTag = async () => {
  if (!editTagFormRef.value || !currentEditTag.value) return
  
  await editTagFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateTagNameApi({
        id: editTagForm.value.id,
        name: editTagForm.value.name,
      })
      ElMessage.success('更新成功')
      showEditTagDialog.value = false
      await loadTagTree()
    } catch (error) {
      console.error('更新失败:', error)
      const axiosError = error as AxiosError<ApiResponse>
      ElMessage.error(axiosError.response?.data?.msg || '更新失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 删除标签
const deleteTag = async (tag: TagTreeNode) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签"${tag.name}"吗？${tag.children ? '\n\n注意：删除主标签会同时删除其所有子标签！' : ''}`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteTagApi({ name: tag.name })
    ElMessage.success('删除成功')
    await loadTagTree()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      const axiosError = error as AxiosError<ApiResponse>
      ElMessage.error(axiosError.response?.data?.msg || '删除失败，请稍后重试')
    }
  }
}

// 重置主标签表单
const resetMainTagForm = () => {
  mainTagForm.value = { name: '' }
  mainTagFormRef.value?.clearValidate()
}

// 重置子标签表单
const resetSubTagForm = () => {
  subTagForm.value = { parentId: 0, name: '' }
  subTagFormRef.value?.clearValidate()
}

// 重置编辑表单
const resetEditTagForm = () => {
  editTagForm.value = { id: 0, name: '' }
  editTagFormRef.value?.clearValidate()
  currentEditTag.value = null
}

onMounted(() => {
  loadTagTree()
})
</script>

<style scoped>
.my-tags-container {
  background: #fff;
  border-radius: 8px;
  /* padding: 30px; */
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.tags-tree-container {
  /*padding: 20px;*/
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
}

.folder-icon {
  color: #e6a23c;
  font-size: 16px;
}

.tag-icon {
  color: #409eff;
  font-size: 14px;
}

.tree-node-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-tree-node):hover .tree-node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>
