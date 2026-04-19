export interface Task {
  id: string
  title: string
  description?: string
  owner_name: string
  owner_user_id?: string
  due_date?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  completed_at?: string
  completion_notes?: string
  parent_task_id?: string
  depends_on_task_id?: string
  meeting_id?: string
  meeting_title?: string
  created_at: string
}
