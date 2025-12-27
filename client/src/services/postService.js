import { API_URL } from './config.js'
import { getChannelName } from './channelService.js'
import * as request from './request.js'
import { getUsername } from './userService.js'

const baseUrl = `${API_URL}/posts`

export const createPost = async (userData,formData) => {
  const { channelId } = formData
    const bodyData = {
        ...formData,
        channelId,
        ownerId: userData.id
      }
    const data = await request.post({url: baseUrl,accessToken: userData.accessToken,bodyData})
    return data
}    

export const getPostData = async (id) => {
  const url = `${baseUrl}/${id}`
  const data = await request.get(url)
  return data
}

export const getPostDataByList = async (idList) => {
  const postList = [];
  for(let i = 0; i < idList.length; i++){
    const id = idList[i];
    const response = await request.get(`${baseUrl}/${id}`)
    const data = await response.json();
    postList.push(data.postData);
  }
  return new Response(JSON.stringify({postList}))
}

export const getAdditionalPostData = async (postData) => 
{
  try{
    const commentCount = await (await getCommentCount(postData.id)).json();
    const likesCount = await (await getLikesCount(postData.id)).json();
    const dislikesCount = await (await getDislikesCount(postData.id)).json();
    const ownerUsername = await (await getUsername(postData.ownerId)).json();
    const channelName = await (await getChannelName(postData.channelId)).json();

    return {
      commentCount,
      likesCount,
      dislikesCount,
      ownerUsername,
      channelName
    }
  }
  catch{
    return null;
  }
}

export const getPopularPosts = async (limit, offset) => 
  await request.get(
    `${baseUrl}/popular?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`)

export async function getCommentCount(postId)
{
  const response = await request.get(`${baseUrl}/${postId}/commentCount`)
  return response;
}

export async function getLikesCount(postId)
{

  return await request.get(`${baseUrl}/${postId}/likesCount`)
}

export async function getDislikesCount(postId)
{
  return await request.get(`${baseUrl}/${postId}/dislikesCount`)
}

export const deletePost = async (accessToken,id) => {
  const url = `${baseUrl}/${_id}`
  const data = await request.Delete({url,accessToken})
  return data
}
