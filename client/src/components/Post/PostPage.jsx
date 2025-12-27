import CommentBlockRender from "../Comment/CommentBlockRender"
import PostRender from "./PostRender"
import CommentCreateForm from "../Comment/CommentCreateForm"

import { getPostData } from "../../services/postService"
import { getPostComments } from "../../services/commentService"
import useLoading from "../../hooks/useLoading"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from './styles/PostPage.module.css'
import ChannelPage from "../Channel/ChannelPage"
import UserDataContext from "../../contexts/UserDataContext"
import { getUsername } from "../../services/userService"

const PostPage = () => {
  const [postData, setPostData] = useState()
  const [comments, setComments] = useState([])
  const [commentCount, setCommentCount] = useState(0);
  const navigate = useNavigate()
  const { userData } = useContext(UserDataContext)

  const { postId } = useParams()

  const fetchPost = async () => {
    try {
      // OPTIMIZED: Post now comes with all related data (ownerUsername, channelName, counts)
      const response = await getPostData(postId)
      const deserialized = await response.json();
      const data = deserialized.postData;
      setPostData(data)
      setCommentCount(data.commentCount)

      const commentResponse = await getPostComments(postId)
      const commentList = (await commentResponse.json()).commentList;
      for (let i = 0; i < commentList.length; i++) {
        const response = await getUsername(commentList[i].ownerId);
        const ownerUsername = await response.json();
        commentList[i] = {
          ...commentList[i],
          ownerUsername
        }
      }
      setComments(commentList)

      document.title = `${data.title}`
    }
    catch (e) {
      console.log(e);
      navigate("/error");
    }
  }

  // Update postData's commentCount when comments change
  useEffect(() => {
    if (postData) {
      setPostData(d => ({ ...d, commentCount }))
    }
  }, [commentCount])

  const [Spinner, fetchWithLoading, isLoading] = useLoading(fetchPost)

  useEffect(() => {
    fetchWithLoading()
    return () => document.title = 'Aether'
  }, [])

  return (
    isLoading ?
      <Spinner size={35} />
      :
      postData &&
      <div className={styles['outer-container']}>
        <div className={styles['inner-container']}>
          <div className={styles['post-container']}>
            <PostRender
              postData={postData}
              isRedirect={true}
              isCompact={false}
            />
            {(comments.length > 0 && userData) &&
              <CommentCreateForm
                postId={postId}
                setComments={setComments}
                setCommentCount={setCommentCount}
              />
            }
            <ul className={styles['comments']}>
              {comments.length > 0
                ?
                comments.map((commentData) =>
                  <li key={commentData.id}>
                    <CommentBlockRender
                      commentData={commentData}
                      setComments={setComments}
                      setCommentCount={setCommentCount}
                    />
                  </li>)
                :
                <div className={styles['no-comments']}>
                  <p>There are no comments on this post. Be the first one to express their thoughts</p>
                  {userData &&
                    <CommentCreateForm
                      postId={postId}
                      parentCommentId={''}
                      isReply={false}
                      replyTo={''}
                      setComments={setComments}
                      setCommentCount={setCommentCount}
                    />}
                </div>
              }
            </ul>
          </div>
          <ChannelPage isCompact={true} />
        </div>
      </div>
  )
}

export default PostPage
