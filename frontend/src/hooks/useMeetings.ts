import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export const useMeetings = (limit: number = 10) => {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings', { params: { limit } })
      setMeetings(response.data.meetings)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [limit])

  return { meetings, loading, refetch: fetchMeetings }
}
