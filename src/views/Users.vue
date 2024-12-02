<template>
  <div class="users-container">
    <div class="header">
      <h2>用户管理</h2>
      <div class="search-box">
        <el-input
            v-model="searchQuery"
            placeholder="请输入用户名搜索"
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
        <el-button type="primary" @click="handleAdd">添加用户</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="users">
      <el-table-column prop="username" label="用户名" />
      <el-table-column label="角色">
        <template #default="{ row }">
          {{ row.role === 'admin' ? '管理员' : '普通用户' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="info" size="small" @click="handleSendMessage(row)">
            发送信息
          </el-button>
          <el-popconfirm
              title="确定删除该用户吗？"
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
        :title="isEdit ? '编辑用户' : '添加用户'"
    >
      <el-form
          ref="formRef"
          :model="userForm"
          :rules="rules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="device_key" prop="device_key">
          <el-input v-model="userForm.device_key" placeholder="可选输入设备密钥" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="messageDialogVisible"
        title="发送信息给用户"
    >
      <el-form
          ref="messageFormRef"
          :model="messageForm"
          :rules="messageRules"
          label-width="80px"
      >
        <el-form-item label="信息内容" prop="content">
          <el-input type="textarea" v-model="messageForm.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSend">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const users = ref([])
const dialogVisible = ref(false)
const messageDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const messageFormRef = ref(null)

const userForm = ref({
  username: '',
  password: '',
  role: 'user',
  device_key: ''
})

const messageForm = ref({
  user_id: '',
  content: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const messageRules = {
  content: [
    { required: true, message: '请输入信息内容', trigger: 'blur' },
  ]
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchQuery.value
    }
    const res = await userApi.getUsers(params)
    if (res.code === 200) {
      const data = res.data
      if (data && data.length > 0) {
        users.value = data
        total.value = res.total
      }else{
        users.value = []
        total.value = 0
      }
    }else{
      ElMessage.error(res.message || '获取用户列表失败')
    }

  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  userForm.value = { username: '', password: '', role: 'user' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  userForm.value = { ...row }
  delete userForm.value.password
  dialogVisible.value = true
}

const handleSendMessage = (row) => {
  messageForm.value = {
    user_id: row.id,
    content: ''
  } // Reset the form
  messageDialogVisible.value = true
}

const handleSend = async () => {
  if (!messageFormRef.value) return

  await messageFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 假设有一个发送信息的接口
        await userApi.sendMessage({ user_id: messageForm.value.user_id, content: messageForm.value.content })
        ElMessage.success('信息发送成功')
        messageDialogVisible.value = false
      } catch (error) {
        console.error('发送信息失败:', error)
        ElMessage.error('发送信息失败')
      }
    }
  })
}

const handleDelete = async (id) => {
  try {
    let data = {
      'id': id
    }
    await userApi.deleteUser(data)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await userApi.updateUser(userForm.value)
          ElMessage.success('更新成功')
        } else {
          await userApi.createUser(userForm.value)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

watch([searchQuery], () => {
  if (searchQuery.value === '') {
    handleSearch()
  }
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  fetchUsers()
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
</style>
