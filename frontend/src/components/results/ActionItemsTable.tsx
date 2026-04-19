import { PriorityBadge } from '@/components/ui/PriorityBadge'

interface ActionItem {
  task: string
  owner: string
  deadline: string
  priority: string
}

interface ActionItemsTableProps {
  actionItems: ActionItem[]
}

export function ActionItemsTable({ actionItems }: ActionItemsTableProps) {
  if (!actionItems || actionItems.length === 0) {
    return (
      <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Action Items</span>
        <p style={{ fontSize: 13, color: '#6b7fa3' }}>No action items detected.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Action Items</span>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
            {['Task', 'Owner', 'Deadline', 'Priority'].map(h => (<th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#00d4ff', fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>))}
          </tr>
        </thead>
        <tbody>
          {actionItems.map((item, i) => (
            <tr key={`${item.task}-${i}`} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
              <td style={{ padding: '9px 10px', color: '#e8f0fe' }}>{item.task || '—'}</td>
              <td style={{ padding: '9px 10px', color: '#00d4ff' }}>{item.owner || '—'}</td>
              <td style={{ padding: '9px 10px', color: '#6b7fa3' }}>{item.deadline || '—'}</td>
              <td style={{ padding: '9px 10px' }}><PriorityBadge priority={item.priority} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
