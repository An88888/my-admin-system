<template>
  <div class="tasks-container">
    <div class="header">
      <h2>任务管理</h2>
      <div class="search-box">
        <el-button type="primary" @click="handleAdd">添加任务</el-button>
      </div>
    </div>
    
    <el-table v-loading="loading" :data="tasks">
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="task_type" label="任务类型" />
      <el-table-column prop="frequency" label="频率" />
      <el-table-column label="状态">
        <template #default="{ row }">
          {{ row.is_active ? '激活' : '未激活' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm 
            title="确定删除该任务吗？" 
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
      :title="isEdit ? '编辑任务' : '添加任务'"
    >
      <el-form 
        ref="formRef"
        :model="taskForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item label="选择任务" prop="task_id">
          <el-select v-model="taskForm.task_id" placeholder="选择任务">
            <el-option
              v-for="task in taskList"
              :key="task.id"
              :label="task.name"
              :value="task.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调度方式" prop="schedule_type">
          <el-select v-model="taskForm.schedule_type" @change="handleScheduleChange">
            <el-option label="Cron 表达式" value="crontab" />
            <el-option label="间隔时间" value="interval" />
          </el-select>
        </el-form-item>

        <div v-if="taskForm.schedule_type === 'crontab'">
          <el-form-item label="Cron 表达式" prop="crontab_expression">
            <el-input v-model="taskForm.crontab_expression" placeholder="例如: * * * * *" />
          </el-form-item>
        </div>
        
        <div v-if="taskForm.schedule_type === 'interval'">
          <el-form-item label="每隔" prop="interval_every">
            <el-input v-model="taskForm.interval_every" placeholder="间隔数量" type="number" />
          </el-form-item>
          <el-form-item label="单位" prop="interval_period">
            <el-select v-model="taskForm.interval_period">
              <el-option label="秒" value="seconds" />
              <el-option label="分钟" value="minutes" />
              <el-option label="小时" value="hours" />
              <el-option label="天" value="days" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="taskForm.is_active" />
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
import { taskApi } from '@/api/task'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const tasks = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 新增 taskList 用于存储从后端获取的任务列表
const taskList = ref([])

const taskForm = ref({
  name: '',
  task_id: '', // 绑定任务 ID
  frequency: 'daily',
  is_active: true,
  schedule_type: 'crontab',
  crontab_expression: '',
  interval_every: null,
  interval_period: 'seconds'
})

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
  ],
  task_id: [
    { required: true, message: '请选择任务', trigger: 'change' },
  ],
  schedule_type: [
    { required: true, message: '请选择调度方式', trigger: 'change' },
  ],
  crontab_expression: [
    { required: true, message: '请输入 Cron 表达式', trigger: 'blur', 
      validator: (rule, value, callback) => {
      if (taskForm.value.schedule_type === 'crontab' && !value) {
        callback(new Error('请输入 Cron 表达式'))
      } else {
        callback()
      }
    }},
  ],
  interval_every: [
    { required: true, message: '请输入间隔数量', trigger: 'blur', 
      validator: (rule, value, callback) => {
      if (taskForm.value.schedule_type === 'interval' && !value) {
        callback(new Error('请输入间隔数量'))
      } else {
        callback()
      }
    }},
  ],
  interval_period: [
    { required: true, message: '请选择时间单位', trigger: 'change',
      validator: (rule, value, callback) => {
      if (taskForm.value.schedule_type === 'interval' && !value) {
        callback(new Error('请选择时间单位'))
      } else {
        callback()
      }
    }},
  ],
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchQuery.value
    }
    const res = await taskApi.getTasks(params)
    if (res.code === 200) {
      const data = res.data
      if (data && data.length > 0) {
          tasks.value = data
          total.value = res.total
      } else {
        tasks.value = []
        total.value = 0
      }
    } else {
      ElMessage.error(res.message || '获取任务列表失败')
    }
    
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 新增获取任务列表的方法
const fetchTaskList = async () => {
  try {
    const res = await taskApi.getTaskList() // 调用后端 API 获取任务列表
    if (res.code === 200) {
      taskList.value = res.data // 将任务列表存储到 taskList
    } else {
      ElMessage.error(res.message || '获取任务列表失败')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  taskForm.value = { name: '', task_id: '', frequency: 'daily', is_active: true, schedule_type: 'crontab', crontab_expression: '', interval_every: null, interval_period: 'seconds' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  taskForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    let data = {
      'id': id
    }
    await taskApi.deleteTask(data)
    ElMessage.success('删除成功')
    fetchTasks()
  } catch (error) {
    console.error('删除任务失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await taskApi.updateTask(taskForm.value)
          ElMessage.success('更新成功')
        } else {
          await taskApi.createTask(taskForm.value)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchTasks()
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

const handleScheduleChange = () => {
  // 重置间隔任务的相关字段
  if (taskForm.value.schedule_type === 'crontab') {
    taskForm.value.interval_every = null
    taskForm.value.interval_period = 'seconds'
  } else {
    taskForm.value.crontab_expression = ''
  }
}

onMounted(() => {
  fetchTasks()
  fetchTaskList() // 在组件挂载时获取任务列表
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
