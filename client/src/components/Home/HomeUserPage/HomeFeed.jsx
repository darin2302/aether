import { useContext } from 'react'
import { getRelatedPosts } from '../../../services/userService'
import InfiniteScrollPosts from '../../InfiniteScroll/InfiniteScrollPosts'
import CreatePostBar from '../../Post/CreatePostBar'
import styles from './styles/HomeFeed.module.css'
import UserDataContext from '../../../contexts/UserDataContext'
import welcome from "/images/welcome.png";

const HomeFeed = () => {
  const { userData } = useContext(UserDataContext);
  return (
    <div className={styles['container']}>
      <CreatePostBar />
      <InfiniteScrollPosts 
        fetchFunction={(limit, offset) => getRelatedPosts(userData, limit, offset)} 
        limit={3}
        Fallback={() => <div className={styles['welcome-div']}><img src={welcome}></img></div>}
      />
    </div>
  )
}
export default HomeFeed
