import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/complete`)
      await fetchTasks()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return { tasks, loading, completeTask, refetch: fetchTasks }
}
