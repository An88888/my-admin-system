<template>
  <div class="dishes-container">
    <div class="header">
      <h2>菜式管理</h2>
      <div class="search-box">
        <el-input
            v-model="searchQuery"
            placeholder="请输入菜式名称搜索"
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
        <el-button type="primary" @click="handleGetRecipes">获取菜谱</el-button>
        <el-button type="primary" @click="handleAdd">添加菜式</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="dishes">
      <el-table-column prop="name" label="菜名" />
      <el-table-column prop="ing_names" label="所需材料" />
      <el-table-column label="做法">
        <template #default="{ row }">
          <a :href="row.procedure" target="_blank">
            查看做法
          </a>
        </template>
      </el-table-column>


      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
              title="确定删除该菜式吗？"
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

    <!-- 获取菜谱的进度弹窗 -->
    <el-dialog
        v-model="getRecipesDialogVisible"
        title="获取菜谱"
    >
      <div v-if="isFetching">
        <p>正在请求菜谱...</p>
        <p>已请求页面: {{ currentPage }}/{{ totalPages }}</p>
        <p>成功请求数量: {{ successCount }}</p>
        <p>成功比例: {{ successRatio }}%</p>
      </div>
      <div v-else>
        <p>点击下方按钮开始获取菜谱数据。</p>
      </div>
      <template #footer>
        <el-button @click="getRecipesDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleGetRecipes" :disabled="isFetching">开始获取</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑菜式' : '添加菜式'"
    >
      <el-form
          ref="formRef"
          :model="dishForm"
          :rules="rules"
          label-width="80px"
      >
        <el-form-item label="菜名" prop="name">
          <el-input v-model="dishForm.name" />
        </el-form-item>

        <el-form-item label="分类" prop="cate">
          <el-select
              v-model="dishForm.cate"
              multiple
              filterable
              placeholder="选择分类"
              @change="handleCateChange"
          >
            <el-option
                v-for="cate in cateList"
                :key="cate.id"
                :label="cate.name"
                :value="cate.id"
            />
          </el-select>
          <div class="input-hint">可以多选分类，支持模糊搜索</div>
        </el-form-item>

        <el-form-item label="所需材料" prop="ingredients">
          <el-select
              v-model="dishForm.ingredients"
              multiple
              filterable
              placeholder="选择所需食材"
              @change="handleIngredientsChange"
          >
            <el-option
                v-for="ingredient in ingredientList"
                :key="ingredient.id"
                :label="ingredient.name"
                :value="ingredient.id"
            />
          </el-select>
          <div class="input-hint">可以多选食材，支持模糊搜索</div>
        </el-form-item>

        <el-form-item label="做法" prop="procedure">
          <el-input v-model="dishForm.procedure" />
          <div class="input-hint">例如：1. 将鸡肉放入锅中，2. 加入盐和胡椒。</div>
        </el-form-item>

        <el-form-item label="上传图片" prop="images">
          <el-upload
              class="upload-demo"
              drag
              multiple
              :action="uploadUrl"
              :file-list="fileList"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-change="handleChange"
              :limit="6"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :headers="{
                          'Referrer-Policy': 'no-referrer-when-downgrade',
                          'x-requested-with': 'XMLHttpRequest',
                          'token': token + '_' + userInfo.id
              }"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传 JPG/PNG 文件，且不超过 2MB</div>
          </el-upload>
          <div class="input-hint">编辑时会自动显示已上传的图片。</div>
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
import { Search } from '@element-plus/icons-vue'
import { foodApi } from '@/api/food'
import { cateApi } from '@/api/cate'
import { ingredientApi } from '@/api/ingredient'
import { scrapeApi } from '@/api/scrape'



import { ElMessage } from 'element-plus'

const token = localStorage.getItem('token')
const userInfo = JSON.parse(localStorage.getItem('userInfo'))

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const dishes = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const totalPages = 20; // 假设总页数为30
const successCount = ref(0); // 使用 ref 包裹
const successRatio = ref(0); // 使用 ref 包裹
const isFetching = ref(false);
const getRecipesDialogVisible = ref(false);
const getRecipesLoading = ref(false); // 新增一个状态用于获取菜谱时的 loading

const openGetRecipesDialog = () => {
  getRecipesDialogVisible.value = true;
  resetGetRecipesProgress(); // 重置进度状态
};

const resetGetRecipesProgress = () => {
  currentPage.value = 1;
  successCount.value = 0;
  successRatio.value = 0;
};


const dishForm = ref({
  name: '',
  ingredients: [], // 修改为数组以支持多选
  procedure: '',
  images: [],
})

const fileList = ref([])
const uploadUrl = import.meta.env.VITE_APP_UPLOAD_URL

const rules = {
  name: [
    { required: true, message: '请输入菜名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  ingredients: [
    { required: true, message: '请输入所需材料', trigger: 'change' },
  ],
  procedure: [
    { required: true, message: '请输入做法', trigger: 'blur' },
  ],
}

const ingredientList = ref([]) // 用于存储食材列表
const cateList = ref([]) // 用于存储分类列表


const resetForm = () => {
  dishForm.value = {
    name: '',
    ingredients: [],
    procedure: '',
    images: [],
    cate: []
  }
  fileList.value = []
}

const fetchCate = async () => {
  try {
    const res = await cateApi.getCate() // 替换为获取食材的 API
    if (res.code === 200) {
      cateList.value = res.data
    } else {
      ElMessage.error('获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

const fetchIngredients = async () => {
  try {
    const res = await ingredientApi.getIngredient() // 替换为获取食材的 API
    if (res.code === 200) {
      ingredientList.value = res.data
    } else {
      ElMessage.error('获取食材列表失败')
    }
  } catch (error) {
    console.error('获取食材列表失败:', error)
    ElMessage.error('获取食材列表失败')
  }
}

const fetchDishes = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      title: searchQuery.value
    }
    const res = await foodApi.getFood(params)
    if (res.code === 200) {
      dishes.value = res.data
      total.value = res.total
    } else {
      ElMessage.error('获取菜式列表失败')
    }
  } catch (error) {
    console.error('获取菜式列表失败:', error)
    ElMessage.error('获取菜式列表失败')
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
  dishForm.value = { ...row }
  fileList.value = Array.isArray(row.images) ? row.images.map(img => ({ name: img.split('/').pop(), url: img })) : [];
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await foodApi.deleteFood({'id':id})
    ElMessage.success('删除成功')
    fetchDishes()
  } catch (error) {
    console.error('删除菜式失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleUploadSuccess = async (response, file) => {
  try {
    if (response.code === 200) {
      fileList.value.push({
        name: file.name,
        url: response.url
      })
    } else {
      ElMessage.error('上传失败，未获取到图片 URL')
    }
  } catch (error) {
    console.error('上传文件失败:', error)
    ElMessage.error('上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        dishForm.value.images = fileList.value.map(file => file.url); // 更新 images 数组

        if (isEdit.value) {
          await foodApi.updateFood(dishForm.value);
          ElMessage.success('更新成功');
        } else {
          await foodApi.createFood(dishForm.value);
          ElMessage.success('创建成功');
        }

        dialogVisible.value = false; // 关闭对话框
        fetchDishes(); // 刷新菜品列表
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败');
      }
    }
  });
}

const handleSearch = () => {
  currentPage.value = 1
  fetchDishes()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchDishes()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchDishes()
}

const handlePreview = (file) => {
  // 处理预览逻辑
}

const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const handleChange = (file, fileList) => {
  fileList.value = fileList
}

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

const handleIngredientsChange = (value) => {
  // 处理所需材料的变化，比如更新状态或执行其他操作
  console.log('所需材料变化:', value);
}

const handleCateChange = (value) => {
  // 处理所需材料的变化，比如更新状态或执行其他操作
  console.log('分类变化:', value);
}

const handleGetRecipes = async () => {
  getRecipesLoading.value = true; // 开始获取菜谱时设置为 true
  isFetching.value = true;
  currentPage.value = 1;
  successCount.value = 0;
  successRatio.value = 0;

  for (let page = 1; page <= totalPages; page++) {
    try {
      const res = await scrapeApi.getScrape({ page: page });
      if (res.code === 200) {
        successCount.value++;
        ElMessage.success(`第 ${page} 页获取成功！`);
      } else {
        ElMessage.error(`第 ${page} 页获取失败`);
      }
    } catch (error) {
      console.error(`第 ${page} 页获取失败:`, error);
      ElMessage.error(`第 ${page} 页获取失败`);
    } finally {
      // 更新成功比例
      successRatio.value = ((successCount.value / page) * 100).toFixed(2);
      // 给用户一些时间查看进度
      await new Promise(resolve => setTimeout(resolve, 500)); // 等待0.5秒
    }
  }

  isFetching.value = false; // 请求完成
  getRecipesLoading.value = false; // 请求完成
  ElMessage.success('所有菜谱请求完成！');
};

onMounted(() => {
  fetchDishes()
  fetchIngredients() // 获取食材列表
  fetchCate() // 获取分类列表

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

.el-form-item {
  margin-bottom: 20px;
}

.upload-demo {
  cursor: pointer;
}

.input-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
