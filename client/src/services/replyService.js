import { API_URL } from './config.js'
import * as request from './request.js'
import { getUsername } from './userService.js';

const baseUrl = `${API_URL}/replies`
const commentUrl = `${API_URL}/comments`

export const createReply = async (userData,{parentCommentId,replyToComment,text}) => {
  const bodyData = {
    ownerId: userData.id,
    parentCommentId,
    replyToComment,
    text,
  }

  const response = await request.post({
    url:baseUrl, 
    accessToken: userData.accessToken, 
    bodyData
  }) 
  return response
}

export const getCommentReplies = async (commentId) => {
  return await request.get(`${commentUrl}/${commentId}/replies`)
}

export const updateReply = async ({accessToken ,newData}) =>  
  await request.put(baseUrl, accessToken, newData)

export const deleteReply = async (accessToken,id) => {
  const url = `${baseUrl}/${id}`
  await request.Delete({url,accessToken})
}

export async function getAdditionalReplyListData(replies, commentData)
{
  for (let i = 0; i < replies.length; i++) {
    const ownerUsername = await (await getUsername(replies[i].ownerId)).json();
    const replyToUsername =
      commentData.id == replies[i].replyToComment
        ?
        commentData.ownerUsername
        :
        await (await getUsername(
          replies.find(r =>
            r.id == replies[i].replyToComment).ownerId
        )
        ).json()
    replies[i] = {
      ...replies[i],
      ownerUsername,
      replyToUsername
    }
  }
  return replies;
}

export async function getAdditionalReplyData(reply, replies, commentData) {
  const ownerUsername = await (await getUsername(reply.ownerId)).json();
  const replyToUsername =
    commentData.id == reply.replyToComment
      ?
      commentData.ownerUsername
      :
      await (await getUsername(
        replies.find(r =>
          r.id == reply.replyToComment).ownerId)
      ).json()

  reply = {
    ...reply,
    ownerUsername,
    replyToUsername
  }
  return reply;
}
