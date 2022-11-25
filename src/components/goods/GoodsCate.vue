<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }" replace>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <zk-table
        class="zk-table"
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        :expand-type="false"
        :selection-type="false"
        border
      >
        <!-- 是否有效模板列 -->
        <template #isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i
        ></template>
        <!-- 排序模板 -->
        <template #islevel="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级标签</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success"
            >二级标签</el-tag
          >
          <el-tag v-else type="warning">三级标签</el-tag>
        </template>
        <!-- 操作模板 -->
        <template #opt
          ><el-button type="primary" icon="el-icon-edit">编辑</el-button
          ><el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </zk-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="quertInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="quertInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加分类会话框 -->
      <el-dialog
        title="增加分类"
        :visible.sync="isShowAddDialog"
        width="50%"
        @close="addCateClose"
      >
        <div>
          <el-form
            :model="addCateForm"
            :rules="addCateRules"
            ref="addCateForm"
            label-width="100px"
          >
            <el-form-item label="分类名称：" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
              <el-cascader
                v-model="selectedKeys"
                :options="addCateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                  checkStrictly: true
                }"
                clearable
                @change="cateParentChange"
              ></el-cascader>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isShowAddDialog = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedKeys: [],
      // 定义发送的数据
      addCateForm: { cat_name: '', cat_pid: 0, cat_level: 0 },
      // 定义新增分类名称的校验规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 获取用来渲染级联菜单的数据
      addCateList: [],
      isShowAddDialog: false,
      // 定义请求商品的参数
      quertInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 用来保存请求过来的商品列表数据
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',

          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',

          type: 'template',
          template: 'islevel'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.quertInfo
      })
      // 请求失败的处理
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据错误')
      }
      // 请求成功后的处理,得到商品列表的数据，接下来进行数据的渲染
      this.total = res.data.total
      this.cateList = res.data.result
      console.log(this.cateList)
      console.log(res.data)
    },
    // 监听展示条数改变事件
    handleSizeChange(val) {
      this.quertInfo.pagesize = val
      this.getCateList()
    },
    // 监听当前页改变
    handleCurrentChange(val) {
      this.quertInfo.pagenum = val
      this.getCateList()
    },
    // 显示添加分类的会话框
    async showAddCateDialog() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败')
      }
      this.addCateList = res.data
      this.isShowAddDialog = true
    },
    // 当选项发生改变时处理
    cateParentChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭对话框的时候，清空数据
    addCateClose() {
      this.$refs.addCateForm.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 发送请求添加分类
    async addCate() {
      const { data: res } = await this.$http.post(
        'categories',
        this.addCateForm
      )
      console.log(res)
      if (res.meta.status !== 201) {
        return this.$message.error('失败')
      }
      this.getCateList()
      this.isShowAddDialog = false
    }
  }
}
</script>
<style lang="scss" scoped>
.zk-table {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
