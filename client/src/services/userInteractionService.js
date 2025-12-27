import { API_URL } from './config.js'
import * as request from "./request"

const likeUrl = `${API_URL}/likes`
const dislikeUrl = `${API_URL}/dislikes`
const saveUrl = `${API_URL}/saves`

export async function likePost(userData, postId)
{
    return await request.post({
        url: `${likeUrl}`,
        accessToken: userData.accessToken,
        bodyData: {
            ownerId: userData.id,
            postId
        }
    });
}

export async function dislikePost(userData, postId)
{
    return await request.post({
        url: `${dislikeUrl}`,
        accessToken: userData.accessToken,
        bodyData: {
            ownerId: userData.id,
            postId
        }
    });
}

export async function savePost(userData, postId){
    return await request.post({
        url: `${saveUrl}`,
        accessToken: userData.accessToken,
        bodyData: {
            ownerId: userData.id,
            postId
        }
    });
}

export async function removeDislike(userData, postId)
{
  return await request.Delete({
    url: `${dislikeUrl}?postId=${postId}&userId=${userData.id}`,
    accessToken: userData.accessToken
  });
}

export async function removeLike(userData, postId)
{
  return await request.Delete({
    url: `${likeUrl}?postId=${postId}&userId=${userData.id}`,
    accessToken: userData.accessToken
  });
}

export async function removeSave(userData, postId)
{
  return await request.Delete({
    url: `${saveUrl}?postId=${postId}&userId=${userData.id}`,
    accessToken: userData.accessToken
  });
}

export async function getUserLikes(userData){
  return await request.get(`${likeUrl}/${userData.id}`, userData.accessToken);
}

export async function getUserDislikes(userData){
  return await request.get(`${dislikeUrl}/${userData.id}`, userData.accessToken);
}

export async function getUserSaves(userData){
  return await request.get(`${saveUrl}/${userData.id}`, userData.accessToken);
}
