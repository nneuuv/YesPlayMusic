import request from '@/utils/request';

// 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )
export function getMusicComment(params) {
  return request({
    url: '/comment/new',
    method: 'get',
    params,
  });
}

// 调用此接口 , 传入 type, 资源 id 可获得对应资源热门评论 ( 不需要登录 )
export function getMusicHotComment(params) {
  return request({
    url: '/comment/hot',
    method: 'get',
    params,
  });
}

// 调用此接口 , 传入资源 parentCommentId 和资源类型 type 和资源 id 参数, 可获得该资源的歌曲楼层评论
export function getMusicCommentFloor(params) {
  return request({
    url: '/comment/floor',
    method: 'get',
    params,
  });
}

// 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对 应评论点赞 ( 需要登录 )
export function likeMusicComment(params) {
  return request({
    url: '/comment/like',
    method: 'get',
    params,
  });
}

// 调用此接口,可发送评论或者删除评论
export function musicComment(params) {
  return request({
    url: '/comment',
    method: 'get',
    params,
  });
}
