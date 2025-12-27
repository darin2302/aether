import { API_URL } from './config.js'
import * as request from './request.js'

const baseUrl = `${API_URL}/comments`
const postUrl = `${API_URL}/posts`

export const createComment = async (userData,{postId,text}) => {
  const bodyData = {
    ownerId: userData.id,
    postId,
    text,
  }

  const response = await request.post({
    url:baseUrl, 
    accessToken: userData.accessToken, 
    bodyData
  }) 
  return response
}

export async function getPostComments(postId){
  return await request.get(`${postUrl}/${postId}/comments`)
}

export const getCommentData = async (commentId) => {
  const data = await request.get(`${baseUrl}/${commentId}`)
  return data
}

export const updateComment = async ({accessToken, newData}) => {
  return await request.put(baseUrl,accessToken, newData)
}

export const deleteComment = async (accessToken,id) => {
  const url = `${baseUrl}/${id}`
  return await request.Delete({url,accessToken})
}
