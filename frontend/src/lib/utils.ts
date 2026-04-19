export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high': return '#ff4d4d'
    case 'medium': return '#f59e0b'
    case 'low': return '#00e676'
    default: return '#6b7fa3'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#00e676'
    case 'pending': return '#f59e0b'
    case 'overdue': return '#ff4d4d'
    default: return '#6b7fa3'
  }
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
