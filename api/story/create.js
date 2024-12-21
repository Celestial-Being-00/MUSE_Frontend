import request from '@/utils/request'

// 查询新建故事列表
export function listCreate(query) {
  return request({
    url: '/story/create/list',
    method: 'get',
    params: query
  })
}

// 查询新建故事详细
export function getCreate(id) {
  return request({
    url: '/story/create/' + id,
    method: 'get'
  })
}

// 新增新建故事
export function addCreate(data) {
  return request({
    url: '/story/create',
    method: 'post',
    data: data
  })
}

// 修改新建故事
export function updateCreate(data) {
  return request({
    url: '/story/create',
    method: 'put',
    data: data
  })
}

// 删除新建故事
export function delCreate(id) {
  return request({
    url: '/story/create/' + id,
    method: 'delete'
  })
}
