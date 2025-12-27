import UilShare from '@iconscout/react-unicons/icons/uil-share.js'
import styles from './styles/PostSharing.module.css/'
import { useState } from 'react'

const PostSharing = ({postId, channelName}) => {
  const [copied,setCopied] = useState(false)

  const shareHandler = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(
      `${window.location.origin}/c/${channelName}/${postId}/`)
    setCopied(true)
  }

  return(
    <div 
        className={styles['tooltip']}
        onMouseLeave={() => setCopied(false)}
    >
      <button onClick={(e) => shareHandler(e)}>
        <UilShare />
        <span>Share</span>
        <span className={styles['tooltiptext']}>{ copied ? 'Copied' : 'Copy'} to clipboard {copied ? '!' : ''}</span>
      </button>
    </div>
  )
}
export default PostSharing
