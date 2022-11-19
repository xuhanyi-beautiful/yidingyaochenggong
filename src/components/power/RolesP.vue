<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/rights' }">
        权限管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row
        ><el-col>
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 一级权限列表 -->
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['btnBtm', i1 === 0 ? 'btnTop' : '', 'vercenter']"
            >
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'btnTop', 'vercenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
              <!-- <pre>{{ scope.row }}</pre> -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" width="400px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            ><el-button
              size="mini"
              type="warning"
              icon="el-icon-share"
              @click="showRightDialog(scope.row)"
              >权限分配</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="showDialogVisible"
      width="30%"
      @close="setRightsDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rolesTree"
        :props="rightsProps"
        show-checkbox
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        node-key="id"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rolesTree: [],
      showDialogVisible: false,
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    async removeRightById(role, id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.error('操作失败')
      }
      const { data: res } = await this.$http.delete(
        `/roles/${role.id}/rights/${id}`
      )
      role.children = res.data
    },
    async showRightDialog(role) {
      this.roleId = role.id
      // 获取树形权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('失败')
      }
      this.rolesTree = res.data
      // 为树形权限设置勾选状态
      this.getLeafKeys(role, this.defKeys)
      this.showDialogVisible = true
    },
    getLeafKeys(node, arr) {
      // 递归判断 如果没有children属性,那么就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归进行深层遍历
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //  清空勾选数据
    setRightsDialogClose() {
      this.defKeys = []
    },
    // 确定后发送数据
    setRoleRight() {
      this.getCheckButtonId()
      this.showDialogVisible = false
    },
    // 获取勾选权限的ID
    async getCheckButtonId() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('失败')
      }
      this.getRolesList()
      this.$message.success('成功')
    }
  }
}
</script>
<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}
.btnTop {
  border-top: 1px solid #eee;
}
.btnBtm {
  border-bottom: 1px solid #eee;
}
.vercenter {
  display: flex;
  align-items: center;
}
</style>
