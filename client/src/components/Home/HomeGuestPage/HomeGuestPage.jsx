import InfiniteScrollPosts from '../../InfiniteScroll/InfiniteScrollPosts.jsx'
import PopularChannels from './PopularChannels.jsx'
import styles from './styles/HomeGuest.module.css'
import { getPopularPosts } from '../../../services/postService.js'
import CreatePostBar from '../../Post/CreatePostBar.jsx'

const HomeGuest = () => {
  const size = window.innerWidth
  return (
    <div className={styles['container']}>
      {size > 800
        ?
        <>
        <div className={styles['left-container']}>

        <CreatePostBar />
          <InfiniteScrollPosts
            fetchFunction={getPopularPosts}
            limit={5}
            Fallback={() => <div className={styles['fallback']}>NO POSTS</div>}
          />
        </div>
          <PopularChannels />
        </>
         :
        <>

        <CreatePostBar />
          <PopularChannels />
          <InfiniteScrollPosts
            fetchFunction={getPopularPosts}
            limit={3}
            Fallback={() => <div className={styles['fallback']}>NO POSTS</div>}
          />
        </>
      } 
    </div>
  )
}
export default HomeGuest
