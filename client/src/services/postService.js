import { API_URL } from './config.js'
import * as request from './request.js'

const baseUrl = `${API_URL}/posts`

export const createPost = async (userData, formData) => {
  const { channelId } = formData
  const bodyData = {
    ...formData,
    channelId,
    ownerId: userData.id
  }
  const data = await request.post({ url: baseUrl, accessToken: userData.accessToken, bodyData })
  return data
}

// OPTIMIZED: Returns post with all related data (owner, channel, counts) in one request
export const getPostData = async (id) => {
  const url = `${baseUrl}/${id}`
  const data = await request.get(url)
  return data
}

// OPTIMIZED: Returns posts with all related data in one request
export const getPopularPosts = async (limit, offset) =>
  await request.get(
    `${baseUrl}/popular?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`)

export const deletePost = async (accessToken, id) => {
  const url = `${baseUrl}/${id}`
  const data = await request.Delete({ url, accessToken })
  return data
}

// ============================================
// DEPRECATED: These are no longer needed since data comes with posts
// Keeping for backwards compatibility during migration
// ============================================

export async function getCommentCount(postId) {
  const response = await request.get(`${baseUrl}/${postId}/commentCount`)
  return response
}

export async function getLikesCount(postId) {
  return await request.get(`${baseUrl}/${postId}/likesCount`)
}

export async function getDislikesCount(postId) {
  return await request.get(`${baseUrl}/${postId}/dislikesCount`)
}
