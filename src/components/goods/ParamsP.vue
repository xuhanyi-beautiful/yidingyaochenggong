<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告框 -->
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 级联菜单 -->
      <el-row class="goodsCate">
        <el-col>
          <span>选择商品分类: </span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            @change="handleCateChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 分页标签 -->
      <el-tabs v-model="activeName" @tab-click="handleCateClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addFormDialogVisable = true"
          >
            添加参数
          </el-button>
          <!-- 表格数据 -->
          <el-table :data="manyParamsData" border style="width=100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"
          ><el-button type="primary" @click="addFormDialogVisable = true"
            >添加属性</el-button
          >
          <el-table :data="onlyParamsData" border style="width=100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数信息 -->
    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="addFormDialogVisable"
      width="30%"
      @close="addFormClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeName: 'many',
      cateList: [],
      selectedKeys: [],
      manyParamsData: [],
      onlyParamsData: [],
      // 显示添加参数信息的对话框
      addFormDialogVisable: false,
      addForm: { attr_name: '' },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据错误')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    async handleCateChange() {
      this.getParamsData()
    },
    // 点击分页事件
    handleCateClick() {
      this.getParamsData()
    },
    async getParamsData() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (this.activeName === 'many') {
        this.manyParamsData = res.data
        return
      }
      this.onlyParamsData = res.data
    },
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (val) => {
        if (!val) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('失败')
        }
        this.$message.success('成功')
        this.getParamsData()
        this.addFormDialogVisable = false
      })
    },
    // 删除参数
    async deleteParams(id) {
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      this.getParamsData()
      console.log(res)
    }
  },
  computed: {
    isBtnDisabled() {
      return this.selectedKeys.length !== 3
    },
    cateId() {
      return this.selectedKeys[2]
    },
    textTitle() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>
<style lang="scss" scoped>
.goodsCate {
  margin: 15px 0;
}
</style>
