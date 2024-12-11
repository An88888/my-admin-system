<template>
  <div class="ingredients-container">
    <div class="header">
      <h2>食材管理</h2>
      <div class="search-box">
        <el-button type="primary" @click="handleAdd">添加食材</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="ingredients">
      <el-table-column prop="name" label="食材名称" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
              title="确定删除该食材吗？"
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
        :title="isEdit ? '编辑食材' : '添加食材'"
    >
      <el-form
          ref="formRef"
          :model="ingredientForm"
          :rules="rules"
          label-width="80px"
      >
        <el-form-item label="食材名称" prop="name">
          <el-input v-model="ingredientForm.name" />
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
import { ingredientApi } from '@/api/ingredient' // 假设您有一个食材相关的 API
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const ingredients = ref([] )
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const ingredientForm = ref({
  name: '',
})

const rules = {
  name: [
    { required: true, message: '请输入食材名称', trigger: 'blur' },
  ],
}

const fetchIngredients = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    const res = await ingredientApi.getIngredient(params) // 替换为获取食材的 API
    if (res.code === 200) {
      const data = res.data
      if (data && data.length > 0) {
        ingredients.value = data
        total.value = res.total
      } else {
        ingredients.value = []
        total.value = 0
      }
    } else {
      ElMessage.error(res.message || '获取食材列表失败')
    }

  } catch (error) {
    console.error('获取食材列表失败:', error)
    ElMessage.error('获取食材列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  ingredientForm.value = { name: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  ingredientForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ingredientApi.deleteIngredient({'id': id}) // 替换为删除食材的 API
    ElMessage.success('删除成功')
    fetchIngredients()
  } catch (error) {
    console.error('删除食材失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await ingredientApi.updateIngredient(ingredientForm.value) // 替换为更新食材的 API
          ElMessage.success('更新成功')
        } else {
          await ingredientApi.createIngredient(ingredientForm.value) // 替换为创建食材的 API
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchIngredients()
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
  fetchIngredients() // 在组件挂载时获取食材列表
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
