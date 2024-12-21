<template>
  <view class="container">
    <!-- 搜索区域 -->
    <view class="search-box">
      <uni-forms :model="queryParams">
        <uni-forms-item label="小说名称">
          <uni-easyinput
            v-model="queryParams.novelName"
            placeholder="请输入小说名称"
          />
        </uni-forms-item>
      </uni-forms>
      <view class="button-group">
        <button type="primary" size="mini" @click="handleQuery">搜索</button>
        <button size="mini" @click="resetQuery">重置</button>
      </view>
    </view>

    <!-- 列表内容 -->
    <view class="list-container">
      <!-- 表头 -->
      <view class="table-header">
        <view class="header-item">章节序号</view>
        <view class="header-item">章节标题</view>
        <view class="header-item">题材与风格</view>
        <view class="header-item">背景设定</view>
        <view class="header-item">角色设定</view>
        <view class="header-item">核心情节</view>
        <view class="header-item">情节规划</view>
        <view class="header-item">叙述方式</view>
        <view class="header-item">前情提要</view>
        <view class="header-item">撰写指南</view>
        <view class="header-item">章节内容</view>
        <view class="header-item">操作</view>
      </view>

      <!-- 列表内容 -->
      <scroll-view scroll-x class="table-body">
        <view v-for="(item, index) in generationList" :key="index" class="table-row">
          <view class="table-cell">第{{ item.chapterNumber || 1 }}节</view>
          <view class="table-cell">{{ item.chapterTitle || '暂无标题' }}</view>
          <view class="table-cell">{{ item.styleGenre || '暂无' }}</view>
          <view class="table-cell">{{ item.background || '暂无' }}</view>
          <view class="table-cell">{{ item.characters || '暂无' }}</view>
          <view class="table-cell">{{ item.corePlot || '暂无' }}</view>
          <view class="table-cell">{{ item.plotPlanning || '暂无' }}</view>
          <view class="table-cell">{{ item.narrativeStyle || '暂无' }}</view>
          <view class="table-cell">{{ item.previousSummary || '暂无' }}</view>
          <view class="table-cell">{{ item.writingGuide || '暂无' }}</view>
          <view class="table-cell">{{ item.chapterContent || '暂无内容' }}</view>
          <view class="table-cell actions">
            <button size="mini" type="primary" @click="handleUpdate(item)">修改</button>
            <button size="mini" type="success" @click="showGuide(item)">生成本节故事</button>
            <button size="mini" type="warn" @click="handleDelete(item)">删除</button>
          </view>
        </view>
      </scroll-view>

      <!-- 修改按钮区域的位置和样式 -->
      <view class="action-row">
        <button 
          type="primary" 
          v-if="generationList.length"
          @click="showNextChapterContent"
          class="action-button"
        >
          生成下一节撰写指南
        </button>
        <button 
          type="primary" 
          v-else
          @click="handleAdd"
          class="action-button"
        >
          新增故事
        </button>
      </view>
    </view>

    <!-- 新增/修改弹窗 -->
    <uni-popup ref="popup" type="dialog">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">{{ title }}</text>
          <text class="close-btn" @click="cancel">×</text>
        </view>

        <view class="dialog-body">
          <uni-forms ref="form" :model="form" :rules="rules" label-width="100px">
            <uni-segmented-control 
              :current="activeTab" 
              :values="['基本信息', '撰写指南', '故事内容', '评价与关系']"
              @clickItem="onTabChange"
              style="position: sticky; top: 0; background: #fff; z-index: 1;"
            />

            <!-- 基本信息 -->
            <view v-show="activeTab === 0" class="tab-content">
              <uni-forms-item label="故事主题" required>
                <uni-easyinput 
                  type="textarea"
                  v-model="form.storyTheme" 
                  placeholder="请输入本章节的故事题，例如：主角在这一章节中遇到了什么键事件，经历了什么重要转折等。"
                  :maxlength="500"
                />
              </uni-forms-item>
              <button type="primary" @click="handleGenerateGuide" :loading="generateGuideLoading">
                生成撰写指南
              </button>
            </view>

            <!-- 撰写指南 -->
            <view v-show="activeTab === 1" class="tab-content">
              <uni-forms-item label="题材与风格">
                <uni-easyinput type="textarea" v-model="form.styleGenre" placeholder="请描述故事的题材与风格" />
              </uni-forms-item>
              <uni-forms-item label="背景设定">
                <uni-easyinput type="textarea" v-model="form.background" placeholder="请描述故事的背景设定" />
              </uni-forms-item>
              <uni-forms-item label="角色设定">
                <uni-easyinput type="textarea" v-model="form.characters" placeholder="请描述故事的角色设定" />
              </uni-forms-item>
              <uni-forms-item label="核心情节">
                <uni-easyinput type="textarea" v-model="form.corePlot" placeholder="请描述故事的核心情节" />
              </uni-forms-item>
              <uni-forms-item label="情节规划">
                <uni-easyinput type="textarea" v-model="form.plotPlanning" placeholder="请描述故事的情节规划" />
              </uni-forms-item>
              <uni-forms-item label="叙述方式">
                <uni-easyinput type="textarea" v-model="form.narrativeStyle" placeholder="请描述故事的叙述方式" />
              </uni-forms-item>
              <uni-forms-item label="前情提要">
                <uni-easyinput type="textarea" v-model="form.previousSummary" placeholder="请输入前情提要" />
              </uni-forms-item>
              <uni-forms-item label="撰写指南">
                <uni-easyinput type="textarea" v-model="form.writingGuide" placeholder="请输入撰写指南" />
              </uni-forms-item>
              <button type="primary" @click="handleGenerateStory" :loading="generateStoryLoading">
                生成本节故事
              </button>
            </view>

            <!-- 故事内容 -->
            <view v-show="activeTab === 2" class="tab-content">
              <uni-forms-item label="章节标题">
                <uni-easyinput v-model="form.chapterTitle" placeholder="请输入章节标题" />
              </uni-forms-item>
              <uni-forms-item label="章节内容">
                <uni-easyinput 
                  type="textarea" 
                  v-model="form.chapterContent" 
                  placeholder="请输入章节内容"
                  :autoHeight="true"
                  :maxlength="-1"
                />
              </uni-forms-item>
              <button v-if="form.chapterContent" type="primary" @click="handleNextChapter" :loading="nextChapterLoading">
                进入下一节撰写
              </button>
            </view>

            <!-- 评价与关系 -->
            <view v-show="activeTab === 3" class="tab-content">
              <uni-forms-item label="评分">
                <uni-rate v-model="form.rating" />
              </uni-forms-item>
              <uni-forms-item label="评价内容">
                <uni-easyinput type="textarea" v-model="form.review" placeholder="请输入评价内容" />
              </uni-forms-item>
              <uni-forms-item label="人物关系图">
                <uni-easyinput type="textarea" v-model="form.characterNetwork" placeholder="请描述人物关系图" />
              </uni-forms-item>
              <uni-forms-item label="备注">
                <uni-easyinput type="textarea" v-model="form.remark" placeholder="请输入备注" />
              </uni-forms-item>
            </view>
          </uni-forms>
        </view>

        <view class="dialog-footer">
          <button @click="cancel">取 消</button>
          <button type="primary" @click="submitForm">确 定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 添加一个新的弹窗用于显示撰写指南 -->
    <uni-popup ref="guidePopup" type="dialog">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">撰写指南详情</text>
          <text class="close-btn" @click="$refs.guidePopup.close()">×</text>
        </view>
        <view class="dialog-body guide-detail">
          <view class="guide-item">
            <view class="guide-label">题材与风格：</view>
            <view class="guide-content">{{ currentGuide.styleGenre }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">背景设定：</view>
            <view class="guide-content">{{ currentGuide.background }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">角色设定：</view>
            <view class="guide-content">{{ currentGuide.characters }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">核心情节：</view>
            <view class="guide-content">{{ currentGuide.corePlot }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">情节规划：</view>
            <view class="guide-content">{{ currentGuide.plotPlanning }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">叙述方式：</view>
            <view class="guide-content">{{ currentGuide.narrativeStyle }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">前情提要：</view>
            <view class="guide-content">{{ currentGuide.previousSummary }}</view>
          </view>
          <view class="guide-item">
            <view class="guide-label">撰写指南：</view>
            <view class="guide-content">{{ currentGuide.writingGuide }}</view>
          </view>
        </view>
        <view class="dialog-footer">
          <button type="primary" @click="handleGenerateStoryFromGuide">生成故事</button>
          <button @click="$refs.guidePopup.close()">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { 
  listGeneration, 
  getGeneration, 
  delGeneration, 
  addGeneration, 
  updateGeneration,
  generateStoryContent,
  generateGuide,
  generateNextChapter
} from '@/api/story/generation'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        novelName: undefined,
        storyTheme: undefined,
        novelId: undefined  // 添加 novelId 参数
      },
      // 表数据
      generationList: [],
      // 总条数
      total: 0,
      // 加载状态
      loading: false,
      // 添加单数据
      title: '',
      form: {
        id: undefined,
        userId: undefined,
        novelId: undefined,
        novelName: '',
        storyTheme: '',
        chapterNumber: 1,
        chapterTitle: '',
        styleGenre: '',
        background: '',
        characters: '',
        corePlot: '',
        plotPlanning: '',
        narrativeStyle: '',
        previousSummary: '',
        writingGuide: '',
        chapterContent: '',
        rating: 0,
        review: '',
        characterNetwork: '',
        remark: ''
      },
      // 表单验证规则
      rules: {
        storyTheme: {
          rules: [{
            required: true,
            errorMessage: '请输入故事主题'
          }]
        }
      },
      activeTab: 0,
      generateGuideLoading: false,
      generateStoryLoading: false,
      nextChapterLoading: false,
      defaultForm: {  // 添加默认表单数据
        id: undefined,
        userId: undefined,
        novelId: undefined,
        novelName: '',
        storyTheme: '',
        chapterNumber: 1,
        chapterTitle: '',
        styleGenre: '',
        background: '',
        characters: '',
        corePlot: '',
        plotPlanning: '',
        narrativeStyle: '',
        previousSummary: '',
        writingGuide: '',
        chapterContent: '',
        rating: 0,
        review: '',
        characterNetwork: '',
        remark: ''
      },
      currentGuide: {
        styleGenre: '',
        background: '',
        characters: '',
        corePlot: '',
        plotPlanning: '',
        narrativeStyle: '',
        previousSummary: '',
        writingGuide: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'userId'
    ])
  },

  onLoad(options) {  // 添加 onLoad 生命周期
    if (options.novelId) {
      this.queryParams.novelId = options.novelId
      this.queryParams.novelName = decodeURIComponent(options.novelName || '')
    }
  },

  onShow() {
    // 获取用户信息并设置userId
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.queryParams.userId = userInfo.userId
      this.form.userId = userInfo.userId  // 确保form也设置了userId
    }
    this.getList()
  },

  methods: {
    /** 获取列表数据 */
    getList() {
      this.loading = true
      listGeneration(this.queryParams).then(res => {
        this.generationList = res.rows
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /** 重置表单 */
    reset() {
      this.form = {
        ...this.defaultForm,
        userId: uni.getStorageSync('userInfo')?.userId,
        novelId: this.queryParams.novelId,
        novelName: this.queryParams.novelName
      }
      // 重置表单验证
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      if (!row.id) {
        uni.showToast({
          title: '无效的记录ID',
          icon: 'none'
        });
        return;
      }

      try {
        const response = await getGeneration(row.id);
        if (response.code === 200) {
          this.form = response.data;
          this.$refs.popup.open();  // 使用 $refs 打开弹窗
          this.title = "修改故事生成";
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    },

    /** 删除按钮操作 */
    async handleDelete(row) {
      if (!row.id) {
        uni.showToast({
          title: '无效的记录ID',
          icon: 'none'
        });
        return;
      }

      try {
        // 使用 Promise 方式调用 showModal
        const [err, confirmRes] = await uni.showModal({
          title: '提示',
          content: '确认删除该故事吗？',
          confirmText: '确定',
          cancelText: '取消'
        });

        if (err) {
          throw new Error('对话框显示失败');
        }

        if (!confirmRes.confirm) {
          return;
        }

        const response = await delGeneration(row.id);

        if (response && response.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
          
          // 删除成功后刷新列表
          await this.getList();
        } else {
          throw new Error(response?.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除操作失败:', error);
        uni.showToast({
          title: error.message || '删除失败',
          icon: 'none',
          duration: 2000
        });
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      // 保留 novelId，只重置其他查询条件
      const novelId = this.queryParams.novelId
      const novelName = this.queryParams.novelName
      this.queryParams = {
        ...this.queryParams,
        storyTheme: undefined,
        novelName: novelName,  // 保持小说名称
        novelId: novelId  // 保持小说ID
      }
      this.handleQuery()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.$refs.popup.open();  // 使用 $refs 打开弹窗
      this.title = "添加故事生成";
    },

    /** 取消按钮 */
    cancel() {
      this.$refs.popup?.close()
      this.form = {
        id: undefined,
        userId: this.queryParams.userId,
        storyTheme: '',
        novelName: '',
        chapterNumber: 1
      }
    },

    /** 提交表单 */
    async submitForm() {
      try {
        // 表单验证
        await this.$refs.form.validate().then(async (valid) => {
          if (valid) {
            const formData = { ...this.form };
            
            // 检查是否是新生成的数据
            const isNewlyGenerated = this.generationList.some(item => 
              item.chapterNumber === formData.chapterNumber && 
              item.novelId === formData.novelId
            );

            // 如果是新生成的数据，直接返回，不需要再次保存
            if (isNewlyGenerated) {
              return;
            }

            if (formData.id) {
              // 修改
              const response = await updateGeneration(formData);
              if (response.code === 200) {
                uni.showToast({
                  title: '修改成功',
                  icon: 'success'
                });
                await this.getList();
              } else {
                throw new Error(response.msg || '修改失败');
              }
            } else {
              // 新增
              const response = await addGeneration(formData);
              if (response.code === 200) {
                uni.showToast({
                  title: '新增成功',
                  icon: 'success'
                });
                await this.getList();
              } else {
                throw new Error(response.msg || '新增失败');
              }
            }
          }
        });
      } catch (error) {
        console.error('提交表单失败:', error);
        uni.showToast({
          title: error.message || '保存失败，请稍后重试',
          icon: 'none'
        });
      }
    },

    /** 生成撰写指南 */
    async handleGenerateGuide() {
      if (!this.form.storyTheme) {
        uni.showToast({
          title: '请��输入故事主题',
          icon: 'none'
        });
        return;
      }

      this.generateGuideLoading = true;

      try {
        // 先保存表单
        await this.submitForm();

        const response = await generateGuide({
          storyTheme: this.form.storyTheme,
          novelId: this.form.novelId,
          novelName: this.form.novelName,
          chapterNumber: this.form.chapterNumber
        });

        if (response.code === 200 && response.data?.content) {
          const content = response.data.content;
          
          // 更新表单数据
          this.form.styleGenre = content.genre_style || '';
          this.form.background = content.background || '';
          this.form.characters = content.characters || '';
          this.form.corePlot = content.core_plot || '';
          this.form.plotPlanning = content.plot_planning || '';
          this.form.narrativeStyle = content.narrative_style || '';
          this.form.previousSummary = content.summary || '';
          this.form.writingGuide = content['撰写指南'] || '';

          // 保存更新后的数据
          await this.submitForm();

          uni.showToast({
            title: '生成成功',
            icon: 'success'
          });

          // 切换到撰写指南标签页
          this.activeTab = 1;
        } else {
          throw new Error(response.msg || '生成失败');
        }
      } catch (error) {
        console.error('生成撰写指南失败:', error);
        uni.showToast({
          title: '生成失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.generateGuideLoading = false;
      }
    },

    /** 生成本节故事 */
    async handleGenerateStory() {
      if (!this.form.writingGuide) {
        uni.showToast({
          title: '请先生成撰写指南',
          icon: 'none'
        });
        return;
      }

      this.generateStoryLoading = true;

      try {
        // 先保存表单
        await this.submitForm();

        const response = await generateStoryContent({
          id: this.form.id,
          writingGuide: this.form.writingGuide
        });

        if (response.code === 200) {
          // 更新故事内容和标题
          this.form.chapterContent = response.data.story;
          this.form.chapterTitle = response.data.title || '无标题章节';
          
          // 保存更新后的数据
          await this.submitForm();
          
          // 更新列表
          await this.getList();
          
          // 切换到故事内容标签页
          this.activeTab = 2;

          uni.showToast({
            title: '故事生成成功',
            icon: 'success'
          });
        } else {
          throw new Error(response.msg || '生成失败');
        }
      } catch (error) {
        console.error('生成故事失败:', error);
        uni.showToast({
          title: '生成失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.generateStoryLoading = false;
      }
    },

    /** 进入下一节撰写 */
    async handleNextChapter() {
      if (!this.form.chapterContent) {
        uni.showToast({
          title: '请先生成当前章节内容',
          icon: 'none'
        });
        return;
      }

      this.nextChapterLoading = true;

      try {
        // 先保存当前章节
        await this.submitForm();

        // 准备请求数据
        const requestData = {
          current_guide: {
            genre_style: this.form.styleGenre,
            background: this.form.background,
            characters: this.form.characters,
            core_plot: this.form.corePlot,
            plot_planning: this.form.plotPlanning,
            narrative_style: this.form.narrativeStyle,
            previous_summary: this.form.previousSummary,
            writing_guide: this.form.writingGuide
          },
          story_content: this.form.chapterContent
        };

        // 调用生成下一节API
        const response = await generateNextChapter(requestData);

        if (response.data?.content) {
          // 创建新的章节记录
          const newChapter = {
            ...this.form,  // 继承当前章节的基本信息
            id: null,
            chapterNumber: this.form.chapterNumber + 1,
            chapterContent: '',
            chapterTitle: ''
          };

          // 更新新章节的撰写指南
          const content = response.data.content;
          newChapter.styleGenre = content.genre_style || '';
          newChapter.background = content.background || '';
          newChapter.characters = content.characters || '';
          newChapter.corePlot = content.core_plot || '';
          newChapter.plotPlanning = content.plot_planning || '';
          newChapter.narrativeStyle = content.narrative_style || '';
          newChapter.previousSummary = content.summary || '';
          newChapter.writingGuide = content['撰写指南'] || '';

          // 保存新章节到数据库
          const saveResponse = await addGeneration(newChapter);
          
          if (saveResponse.code === 200) {
            // 更新表单数据
            this.form = newChapter;
            
            // 刷新列表
            await this.getList();

            // 切换到撰写指南标签页
            this.activeTab = 1;

            uni.showToast({
              title: '进入下一节成功',
              icon: 'success'
            });
          } else {
            throw new Error('保存新章节失败');
          }
        }
      } catch (error) {
        console.error('进入下一节失败:', error);
        uni.showToast({
          title: '生成失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.nextChapterLoading = false;
      }
    },

    /** 标签页切换 */
    onTabChange(e) {
      this.activeTab = e.currentIndex
    },

    /** 返回钮操作 */
    handleBack() {
      uni.redirectTo({
        url: '/pages/index'
      })
    },

    /** 显示撰写指南 */
    async showGuide(item) {
      // 使用现有的修改弹窗
      await this.handleUpdate(item);
      // 切换到撰写指南标签页
      this.activeTab = 1;
    },

    /** 从撰写指南直接生成故事 */
    async handleGenerateStoryFromGuide() {
      try {
        this.generateStoryLoading = true;
        
        // 使用当前选中项的数据
        const response = await generateStoryContent({
          id: this.currentGuide.id,
          writingGuide: this.currentGuide.writingGuide
        });

        if (response.code === 200) {
          // 关闭指南弹窗
          this.$refs.guidePopup.close();
          
          // 打开修改弹窗并显示生成的内容
          await this.handleUpdate({
            ...this.currentGuide,
            chapterContent: response.data.story,
            chapterTitle: response.data.title || '无标题章节'
          });

          // 切换到故事内容标签页
          this.activeTab = 2;

          uni.showToast({
            title: '故事生成成功',
            icon: 'success'
          });
        } else {
          throw new Error(response.msg || '生成失败');
        }
      } catch (error) {
        console.error('生成故事失败:', error);
        uni.showToast({
          title: '生成��败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.generateStoryLoading = false;
      }
    },

    /** 显示最新一节的故事内容 */
    async showNextChapterContent() {
      // 获取最新一节的数据
      const latestChapter = [...this.generationList].sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
      
      if (latestChapter) {
        // 使用现有的修改弹窗
        await this.handleUpdate(latestChapter);
        // 切换到故事内容标签页
        this.activeTab = 2;
      } else {
        uni.showToast({
          title: '没有找到章节数据',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.search-box {
  background: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;

  .button-group {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
  }
}

.list-container {
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
  white-space: nowrap;

  .header-item {
    flex-shrink: 0;
    padding: 20rpx;
    width: 200rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    border-right: 1px solid #eee;

    &:last-child {
      width: 240rpx;  // 操作列度稍大
    }
  }
}

.table-body {
  width: 100%;
  overflow-x: auto;
  
  .table-row {
    display: flex;
    border-bottom: 1px solid #eee;
    
    &:hover {
      background: #f5f7fa;
    }

    .table-cell {
      flex-shrink: 0;
      padding: 20rpx;
      width: 200rpx;
      font-size: 28rpx;
      color: #666;
      text-align: center;
      border-right: 1px solid #eee;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.actions {
        width: 240rpx;
        display: flex;
        gap: 10rpx;
        justify-content: center;
        align-items: center;

        button {
          font-size: 24rpx;
          padding: 0 10rpx;
          min-width: 60rpx;
        }
      }
    }
  }
}

.add-button {
  display: none;
}

.dialog-content {
  background: #fff;
  width: 90vw;
  max-height: 90vh;
  border-radius: 8rpx;
  position: relative;

  .dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
  }

  .dialog-header {
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;

    .dialog-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 0 20rpx;
    }
  }

  .tab-content {
    height: calc(70vh - 200rpx);
    overflow-y: auto;
    padding: 0 20rpx;

    :deep(.uni-forms-item) {
      margin-bottom: 20rpx;
    }

    :deep(.uni-easyinput__content) {
      background: #f5f7fa;
    }

    :deep(.uni-easyinput__textarea) {
      min-height: 120rpx;
    }

    button {
      margin-top: 20rpx;
      width: 100%;
    }
  }

  .dialog-footer {
    padding: 20rpx;
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
    border-top: 1px solid #eee;
    position: sticky;
    bottom: 0;
    background: #fff;
    z-index: 1;

    button {
      min-width: 160rpx;
    }
  }
}

.guide-detail {
  padding: 20rpx;
  
  .guide-item {
    margin-bottom: 20rpx;
    
    .guide-label {
      font-weight: bold;
      margin-bottom: 10rpx;
      color: #333;
    }
    
    .guide-content {
      background: #f5f7fa;
      padding: 15rpx;
      border-radius: 4rpx;
      font-size: 28rpx;
      color: #666;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.table-cell.actions {
  button {
    margin: 0 5rpx;
  }
}

.action-row {
  padding: 30rpx;
  display: flex;
  justify-content: center;
  background: #f8f8f8;
  border-top: 1px solid #eee;
  
  .action-button {
    width: 50%;
    margin: 0;
  }
}
</style> 