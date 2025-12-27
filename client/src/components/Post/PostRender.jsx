
import PostRating from './PostRating.jsx'
import PostSaving from './PostSaving.jsx'
import PostSharing from './PostSharing.jsx'
import LinkPreview from './LinkPreview/LinkPreview.jsx'

import {getTimeDifference} from '../../utils/dateUtils.js'

import { useContext, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import UserDataContext from '../../contexts/UserDataContext'

import UilComment from '@iconscout/react-unicons/icons/uil-comment.js' 

import styles from './styles/PostRender.module.css'

// OPTIMIZED: postData now contains all data including ownerUsername, channelName, and counts
const PostRender = ({
  postData, 
  isCompact, 
  isRedirect
}) => {

  const [postDataState, setPostDataState] = useState(postData)
  const { userData } = useContext(UserDataContext)
  const navigate = useNavigate()

  const redirectToPage = (e) =>{ 
    e.stopPropagation()
    navigate(`/c/${postData.channelName}/${postData.id}`)
  }

  return(
    <div className={
     `${styles['content']} 
      ${isRedirect ? styles['redirect'] : ''}`} 
      onClick={e => redirectToPage(e)}
    >
      <PostRating 
        postData={postDataState} 
      />

      <div 
        className={
         `${styles['inner-content']} 
          ${isRedirect ? styles['redirect'] : ''}`} 
        onClick={(e) => redirectToPage(e)}
      >
        <div>

          <span 
            className={styles['channel-name']} 
            onClick={(e) => {
            e.stopPropagation();
            navigate(`/c/${postData.channelName}`)
            }}
          >c/{postData.channelName} </span> 

          <span> Posted by </span> 

          <span className={styles['username']} 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/u/${postData.ownerUsername}`)
            }}
          >u\{postData.ownerUsername}</span> 

          <span> {getTimeDifference(postData.dateOfCreation)} ago</span>
        </div>

        <h1>{postData.title}</h1>


        {postData.imgUrl && 
          <img src={postData.imgUrl} className={styles['post-image']}/>
        }
        {postData.text &&(
         isCompact 
          ? 
          <p>{postData.text.substring(0,150)}...</p>
          :
          <p>{postData.text}</p>)
        }
        {!isCompact && <LinkPreview url={postData.linkUrl} isCompact={isCompact}/>}

        <div className={styles['options-container']}>
            <button 
              onClick={e => redirectToPage(e)} 
              className={`
                ${isRedirect ? styles['redirect'] : ''}`
            }>
              <UilComment size={25}/> 
              <span>{postData.commentCount} Comments</span>
            </button>

          <PostSharing postId={postData.id} channelName={postData.channelName}/>

          {userData && 
            <PostSaving postData={postData}/>
          }
        </div>
      </div>
    </div>
  )
}

export default PostRender
