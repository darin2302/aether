import SearchResultsCompact from './SearchResultsCompact'
import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import useDebounce from '../../hooks/useDebounce.jsx'

import styles from './styles/Searchbar.module.css'
import UilSearch from '@iconscout/react-unicons/icons/uil-search.js'
import { searchChannels } from '../../services/channelService.js'



const Searchbar = () => {
  const [searchState, setSearchState] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showCompact, setShowCompact] = useState(false);
  const navigate = useNavigate()

  async function search() {
    if (searchState && searchState.length > 2) {
      const response = await searchChannels(searchState);
      const result = await response.json();
      // Fix: Extract channelList from the response object
      const channelList = result.channelList || [];
      setSearchResults(channelList)
      return channelList
    }
    setSearchResults([])
    return [];
  }
  const submitHandler = async (e) => {
    e.preventDefault()
    const results = await search()
    navigate("/search", {
      state: results
    })
    setShowCompact(false);
  }

  const debouncedSearchCompact = useDebounce(() => { setShowCompact(true); search() }, 200)

  useEffect(() => { debouncedSearchCompact() }, [searchState])

  return (
    <div className={styles['outer-container']}>
      <div className={styles['search-container']}>
        <form onSubmit={(e) => submitHandler(e)}>
          <button className={styles['search-btn']}><UilSearch size={23} /></button>
          <label htmlFor='searchbar'>{searchState ? "" : "Search for channels"}</label>
          <input type='search'
            name='searchbar'
            id='searchbar'
            value={searchState}
            className={styles['search-bar']}
            onChange={async (e) => { setSearchState(e.target.value) }}
            onBlur={() =>
              setTimeout(() => {
                setSearchResults([]);
              }, 200)
            }
            onFocus={() => debouncedSearchCompact()}
          />
        </form>
      </div>
      {
        showCompact &&
        <SearchResultsCompact results={searchResults} />
      }
    </div>
  )
}
export default Searchbar
