import PostRender from '../Post/PostRender.jsx'

import { useState, useEffect } from "react"

import useLoading from '../../hooks/useLoading.jsx'

import styles from './InfiniteScrollPosts.module.css'
import { useNavigate } from 'react-router-dom'


// OPTIMIZED: No longer needs fetchAdditionalFunction - all data comes with posts
const InfiniteScrollPosts = ({ fetchFunction, limit, Fallback }) => {
  const [postDataList, setPostDataList] = useState([])
  const [offset, setOffset] = useState(0);
  const [endOfPosts, setEndOfPosts] = useState(false);
  const navigate = useNavigate();

  const scrollHandler = async () => {
    const { clientHeight, scrollTop, scrollHeight } = document.documentElement
    const isBottom = scrollTop + clientHeight >= scrollHeight

    if (!isBottom || isLoading || endOfPosts) {
      return
    }
    fetchWithLoading();
  }

  async function fetchPosts() {
    try {
      let response = await fetchFunction(limit, offset);
      const deserialized = await response.json();
      const dataList = deserialized.postList;
      
      if (dataList.length < limit) {
        setEndOfPosts(true);
      }
      
      // OPTIMIZED: Posts now include all related data (ownerUsername, channelName, counts)
      // No need for additional fetch calls
      setPostDataList(curr => [...curr, ...dataList]);
      setOffset(o => o + limit);
    }
    catch (e) {
      console.error(e);
      navigate("/error");
    }
  }

  const [Spinner, fetchWithLoading, isLoading] = useLoading(fetchPosts)

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [isLoading])

  useEffect(() => {
    fetchWithLoading()
  }, [])

  return (
    isLoading ?
    // if its loading and there are posts -> show spinner under posts
      postDataList.length > 0 ?
        (
          <>
            <div className={styles['container']}>
              <ul className={styles['post-container']}>
                {
                  postDataList.map(post =>
                    <li key={post.id}>
                      <PostRender
                        postData={post}
                        isCompact={true}
                      />
                    </li>)}
              </ul>
            </div>
            <Spinner size={50} cssOverride={styles['spinner']}/>
          </>
        )
        // if its loading and there are still no posts, just show the spinner
        :
        <Spinner size={50} />
      :
      //if its not loading and there are posts, just show them
      postDataList.length > 0
        ?
        <div className={styles['container']}>
          <ul className={styles['post-container']}>
            {
              postDataList.map(post =>
                <li key={post.id}>
                  <PostRender
                    postData={post}
                    isCompact={true}
                  />
                </li>)}
          </ul>
        </div>
        :
        //else render fallback
        <>
          <Fallback />
        </>
  )
}
export default InfiniteScrollPosts
