<template>
  <view class="app-container">
    <!-- 顶部操作区域 -->
    <view class="header-actions">
      <!-- 搜索区域 -->
      <view class="search-box">
        <uni-easyinput
          v-model="queryParams.novelName"
          placeholder="请输入小说名称"
          @confirm="handleQuery"
        />
        <button type="primary" size="mini" @click="handleQuery">搜索</button>
        <button size="mini" @click="resetQuery">重置</button>
      </view>
      
      <!-- 新增按钮 -->
      <button 
        class="add-button" 
        type="primary" 
        size="mini" 
        @click="handleAdd"
      >新增故事</button>
    </view>

    <!-- 列表内容 -->
    <view class="list-container">
      <view v-if="list.length > 0">
        <view v-for="(item, index) in list" :key="index" class="list-item">
          <view class="content">
            <text class="title">{{item.novelName || '无标题'}}</text>
            <text class="desc">{{item.description || '暂无描述'}}</text>
          </view>
          <view class="actions">
            <button 
              class="action-btn edit" 
              size="mini" 
              @click="handleUpdate(item)"
            >修改</button>
            <button 
              class="action-btn delete" 
              size="mini" 
              @click="handleDelete(item)"
            >删除</button>
            <button 
              class="action-btn write" 
              size="mini" 
              @click="handleWrite(item)"
            >撰写故事</button>
          </view>
        </view>
      </view>
      <!-- 空数据显示 -->
      <view v-else class="empty-container">
        <text class="empty-text">暂无数据</text>
      </view>
    </view>

    <!-- 新建故事弹窗 -->
    <uni-popup ref="createPopup" type="dialog">
      <uni-popup-dialog
        mode="input"
        :title="title"
        :value="form.novelName"
        placeholder="请输入故事名称"
        :before-close="true"
        @confirm="submitForm"
        @close="cancel"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { listCreate, addCreate, getCreate, updateCreate, delCreate } from "@/api/story/create"

export default {
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        novelName: undefined,
        userId: undefined
      },
      // 表单参数 - 与后端 StoryCreate 实体对应
      form: {
        userId: undefined,
        novelName: undefined,
        delFlag: "0"  // 添加默认值
      },
      currentUserId: undefined,  // 添加一个专门存储用户ID的字段
      title: "添加新建故事",  // 添加标题字段
    }
  },

  onShow() {
    // 设置当前用户ID
    this.currentUserId = 1  // 直接设置为固定值，或者从其他地方获取
    this.queryParams.userId = this.currentUserId
    console.log('设置用户ID:', this.currentUserId)
    this.getList()
  },

  methods: {
    /** 获取列表数据 */
    getList() {
      if (this.loading) return
      
      this.loading = true
      console.log('查询参数:', this.queryParams)
      
      listCreate(this.queryParams)
        .then(res => {
          console.log('获取列表响应:', res)
          if (res.code === 200) {
            this.list = res.rows || []
            this.total = res.total
          } else {
            throw new Error(res.msg || '获取数据失败')
          }
        })
        .catch(err => {
          console.error("获取列表失败:", err)
          uni.showToast({
            title: err.message || '获取数据失败',
            icon: 'none'
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 显示新增对话框 */
    handleAdd() {
      this.form = {
        userId: this.currentUserId,  // 使用当前用户ID
        novelName: '',
        delFlag: '0'
      }
      
      console.log('新增表单数据:', this.form)
      this.title = "添加新建故事"
      this.$refs.createPopup.open()
    },

    /** 取消按钮 */
    cancel() {
      this.$refs.createPopup.close()
      this.form.novelName = undefined
    },

    /** 表单提交 */
    submitForm(val) {
      if (!val) {
        uni.showToast({
          title: '请输入故事名称',
          icon: 'none'
        })
        return
      }

      if (this.form.id) {
        // 修改操作
        const updateData = {
          id: this.form.id,
          userId: this.form.userId,
          novelName: val.trim(),  // 使用新输入的名称
          delFlag: this.form.delFlag || '0',
          createBy: this.form.createBy,
          updateBy: this.form.updateBy,
          remark: this.form.remark
        }
        
        console.log('修改提交数据:', updateData)
        
        updateCreate(updateData)
          .then(res => {
            if (res.code === 200) {
              uni.showToast({
                title: '修改成功',
                icon: 'success'
              })
              this.cancel()
              this.getList()
            } else {
              throw new Error(res.msg || '修改失败')
            }
          })
          .catch(error => {
            console.error('修改失败:', error)
            uni.showToast({
              title: error.message || '修改失败',
              icon: 'none'
            })
          })
      } else {
        // 新增操作
        const submitData = {
          userId: this.currentUserId,  // 使用当前用户ID
          novelName: val.trim(),
          delFlag: '0'
        }
        
        console.log('新增提交数据:', submitData)
        
        addCreate(submitData)
          .then(res => {
            console.log('创建响应:', res)
            if (res.code === 200) {
              uni.showToast({
                title: '创建成功',
                icon: 'success'
              })
              this.cancel()
              this.getList()
            } else {
              throw new Error(res.msg || '创建失败')
            }
          })
          .catch(error => {
            console.error("创建失败:", error)
            uni.showToast({
              title: error.message || '创建失败',
              icon: 'none'
            })
          })
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置查询操作 */
    resetQuery() {
      this.queryParams.novelName = undefined
      this.handleQuery()
    },

    /** 刷新数据 */
    refresh() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 加载更多 */
    loadMore() {
      if (this.list.length >= this.total) return
      this.queryParams.pageNum += 1
      this.getList()
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = { ...row }  // 复制当前行数据到表单
      this.title = "修改故事"
      this.$refs.createPopup.open()
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      uni.showModal({
        title: '提示',
        content: '确认要删除这个故事吗？',
        success: res => {
          if (res.confirm) {
            delCreate(row.id)
              .then(res => {
                if (res.code === 200) {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  })
                  this.getList()
                } else {
                  throw new Error(res.msg || '删除失败')
                }
              })
              .catch(error => {
                uni.showToast({
                  title: error.message || '删除失败',
                  icon: 'none'
                })
              })
          }
        }
      })
    },

    /** 撰写故事按钮操作 */
    handleWrite(row) {
      uni.navigateTo({
        url: `/pages/generation/index?novelId=${row.id}&novelName=${encodeURIComponent(row.novelName)}&fromCreate=true`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20rpx;
}

.header-actions {
  background: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.search-box {
  display: flex;
  gap: 20rpx;
  align-items: center;

  :deep(.uni-easyinput) {
    flex: 1;
  }
}

.add-button {
  align-self: flex-end;
  background-color: #007AFF;
  color: #fff;
  border: none;
  padding: 0 30rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
}

.list-container {
  padding: 20rpx;
}

.list-item {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .content {
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 10rpx;
  }

  .action-btn {
    font-size: 24rpx;
    padding: 0 20rpx;
    height: 50rpx;
    line-height: 50rpx;
    border-radius: 25rpx;
    
    &.edit {
      background-color: #409EFF;
      color: #fff;
    }
    
    &.delete {
      background-color: #F56C6C;
      color: #fff;
    }
    
    &.write {
      background-color: #67C23A;  // 使用绿色表示写作
      color: #fff;
    }
  }

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
  }

  .desc {
    font-size: 28rpx;
    color: #666;
    display: block;
  }
}

.empty-container {
  text-align: center;
  padding: 100rpx 0;

  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}
</style> 