import InfiniteScrollPosts from '../InfiniteScroll/InfiniteScrollPosts'

import { useLocation, useNavigate, useOutletContext } from "react-router-dom"
import styles from './styles/UserPageFeed.module.css'
import { getUserDislikes, getUserLikes, getUserSaves } from '../../services/userInteractionService'
import { getPostData } from '../../services/postService'
import { getPersonalPosts } from '../../services/userService'
import { useState } from 'react'
import { useEffect } from 'react'
import UserDataContext from '../../contexts/UserDataContext'
import { useContext } from 'react'

const UserPageFeed = () => {
  const pageUserData = useOutletContext()
  const { userData } = useContext(UserDataContext);
  const [fetchFunction, setFetchFunction] = useState(() => {});
  const location = useLocation();
  const type = location.pathname.slice(location.pathname.lastIndexOf("/") + 1)
  const navigate = useNavigate()

  // Helper to fetch posts by IDs and return in expected format
  const getPostsByIds = async (postIds) => {
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const response = await getPostData(id);
        const data = await response.json();
        return data.postData;
      })
    );
    return new Response(JSON.stringify({ postList: posts }));
  }

  useEffect(() => {
    if(!pageUserData)
      navigate("../")
    switch (type) {
      case "submitted":
        setFetchFunction(() => async () => await getPersonalPosts(pageUserData))
        break;

      case "saved":
        if(!userData) navigate("../")
        setFetchFunction(() => async () => {
          const response = await getUserSaves(userData)
          const saves = (await response.json()).saveList;
          const postIds = saves.map(save => save.postId);
          return await getPostsByIds(postIds)
        })
        break;

      case "liked":
        if(!userData) navigate("../")
        setFetchFunction(() => async () => {
          const response = await getUserLikes(userData)
          const likes = (await response.json()).likeList;
          const postIds = likes.map(l => l.postId);
          return await getPostsByIds(postIds)
        })
        break;

      case "disliked":
        if(!userData) navigate("../")
        setFetchFunction(() => async () => {
          const response = await getUserDislikes(userData)
          const dislikes = (await response.json()).dislikeList;
          const postIds = dislikes.map(d => d.postId);
          return await getPostsByIds(postIds)
        })
        break;
    }
  }, [])

  return(
    (fetchFunction && pageUserData)  &&
      <div className={styles['container']}>
      <h1>{type.charAt(0).toUpperCase() + type.slice(1)} Posts</h1>
        <InfiniteScrollPosts 
        fetchFunction={fetchFunction}
        Fallback={() => <div className={styles['nodata']}>hmmm you haven't {type} anything </div>}
        />  
      </div>
  )
}

export default UserPageFeed
