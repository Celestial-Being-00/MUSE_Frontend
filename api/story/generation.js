import request from '@/utils/request'

// 查询故事生成列表
export function listGeneration(query) {
  return request({
    url: '/story/generation/list',
    method: 'get',
    params: query
  })
}

// 查询故事生成详细
export function getGeneration(id) {
  return request({
    url: '/story/generation/' + id,
    method: 'get'
  })
}

// 新增故事生成
export function addGeneration(data) {
  return request({
    url: '/story/generation',
    method: 'post',
    data: data
  })
}

// 修改故事生成
export function updateGeneration(data) {
  return request({
    url: '/story/generation',
    method: 'put',
    data: data
  })
}

// 删除故事生成
export function delGeneration(id) {
  return request({
    url: '/story/generation/' + id,
    method: 'delete'
  })
}

// 生成撰写指南
export function generateGuide(data) {
  return request({
    url: '/story/generation/guide',
    method: 'post',
    data: data
  })
}

// 生成故事内容
// 生成故事内容
// 生成故事内容
// 修改生成故事的接口
// 生成故事内容的 API
export function generateStoryContent(data) {
  return request({
    url: '/story/generation/generateStory',
    method: 'post',
    data: data
  })
}


// 检查小说是否存在章节
export function checkNovelChapters(novelId) {
  return request({
    url: '/story/generation/checkChapters/' + novelId,
    method: 'get'
  })
}

// 添加生成下一节的方法
// 在 api/story/generation.js 中添加
export function generateNextChapter(data) {
  return request({
    url: '/story/generation/next-chapter',
    method: 'post',
    data: data
  })
}


