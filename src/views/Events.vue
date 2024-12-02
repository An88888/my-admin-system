<template>
  <div class="events-container">
    <div class="header">
      <h2>事件管理</h2>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="请输入事件名称搜索"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">添加事件</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="events">
      <el-table-column prop="name" label="事件名称" />
      <el-table-column prop="target_date" label="事件名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'info'">
            {{ row.status === '1' ? '进行中' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm 
            title="确定删除该事件吗？" 
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
      :title="isEdit ? '编辑事件' : '添加事件'"
    >
      <el-form 
        ref="formRef"
        :model="eventForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="事件名称" prop="name">
          <el-input v-model="eventForm.name" />
        </el-form-item>
        
        <el-form-item label="事件日期" prop="target_date">
          <el-date-picker
            v-model="eventForm.target_date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="eventForm.status">
            <el-option label="进行中" value="1" />
            <el-option label="已结束" value="2" />
          </el-select>
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
import { ref, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const events = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const eventForm = ref({
  name: '',
  status: '1',
  target_date: ''
})

const rules = {
  name: [
    { required: true, message: '请输入事件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  target_date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const resetForm = () => {
  eventForm.value = {
    name: '',
    status: '1',
    target_date: ''
  }
}

const fetchEvents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      title: searchQuery.value
    }
    const res = await eventApi.getEvents(params)
    if (res.code === 200) {
      events.value = res.data
      total.value = res.total
    } else {
      ElMessage.error('获取事件列表失败')
    }
  } catch (error) {
    console.error('获取事件列表失败:', error)
    ElMessage.error('获取事件列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  eventForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    let data = {
      'id': id
    }
    await eventApi.deleteEvent(data)
    ElMessage.success('删除成功')
    fetchEvents()
  } catch (error) {
    console.error('删除事件失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          console.log("======")
          console.log(eventForm.value)
          await eventApi.updateEvent(eventForm.value)
          ElMessage.success('更新成功')
        } else {
          await eventApi.createEvent(eventForm.value)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchEvents()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchEvents()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchEvents()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchEvents()
}

watch([searchQuery], () => {
  if (searchQuery.value === '') {
    handleSearch()
  }
})

onMounted(() => {
  fetchEvents()
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

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-date-picker) {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}
</style> 