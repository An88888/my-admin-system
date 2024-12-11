<template>
  <div class="categories-container">
    <div class="header">
      <h2>分类管理</h2>
      <div class="search-box">
        <el-button type="primary" @click="handleAdd">添加分类</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="categories">
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
              title="确定删除该分类吗？"
              @confirm="handleDelete(row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑分类' : '添加分类'"
    >
      <el-form
          ref="formRef"
          :model="categoryForm"
          :rules="rules"
          label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { cateApi } from '@/api/cate'
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const categoryForm = ref({
  name: '',
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
  ],
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    const res = await cateApi.getCate(params) // 替换为分类API
    if (res.code === 200) {
      const data = res.data
      if (data && data.length > 0) {
        categories.value = data
        total.value = res.total
      } else {
        categories.value = []
        total.value = 0
      }
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }

  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  categoryForm.value = { name: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  categoryForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await cateApi.deleteCate({'id':id}) // 替换为分类删除 API
    ElMessage.success('删除成功')
    fetchCategories()
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await cateApi.updateCate(categoryForm.value) // 替换为分类更新 API
          ElMessage.success('更新成功')
        } else {
          await cateApi.createCate(categoryForm.value) // 替换为分类创建 API
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  fetchCategories() // 在组件挂载时获取分类列表
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
