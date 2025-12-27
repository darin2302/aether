
import { useEffect, useState } from 'react'

import ChannelList from '../../Channel/ChannelList'
import useLoading from '../../../hooks/useLoading'
import { getPopularChannels } from '../../../services/channelService'
import { useNavigate } from 'react-router-dom'

const PopularChannels = () => {
  const [visibleChannels, setVisibleChannels] = useState([])
  const [Spinner, fetchWithLoading, isLoading] = useLoading(fetching)
  const navigate = useNavigate();

  async function fetching() {
    try {
      const response = await getPopularChannels();

      if (!response.ok) {
        console.error('Failed to fetch popular channels:', response.status);
        navigate("/error");
        return;
      }

      const data = await response.json();
      // Handle both old format (array) and new format (object with channelList)
      const channels = Array.isArray(data) ? data : (data.channelList || []);
      setVisibleChannels(channels);
    } catch (error) {
      console.error('Error fetching popular channels:', error);
      navigate("/error");
    }
  }

  useEffect(() => {
    (async () => await fetchWithLoading())()
  }, [])

  return (
    isLoading ?
      <Spinner size={40} />
      :
      visibleChannels.length > 0 &&
      <ChannelList visibleChannels={visibleChannels}>
        <h6>Popular Channels</h6>
      </ChannelList>
  )
}

export default PopularChannels
