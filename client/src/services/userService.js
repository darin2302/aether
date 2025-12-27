import { API_URL } from './config.js'
import * as request from "./request";

const baseUrl = `${API_URL}/users`

export async function getRelatedChannels(userData)
{
  const response = await request.get(
    `${baseUrl}/${userData.id}/related/channels`,
    userData.accessToken
  )
  return response;
}

export const getUsername = async (id) =>
  await request.get(`${baseUrl}/${id}/username`)

export const getByUsername = async (username) => 
  await request.get(`${baseUrl}/${username}`)

export async function getRelatedPosts(userData, limit, offset)
{
  const response = await request.get(
    encodeURI(`${baseUrl}/${userData.id}/related/posts?limit=${limit}&offset=${offset}`),
    userData.accessToken
  );
  return response;
}

export async function getPersonalPosts(userData)
{
  const response = await request.get(`${baseUrl}/${userData.id}/posts`)
  return response;
}
