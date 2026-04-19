interface OpenQuestionsProps {
  questions: string[]
}

export function OpenQuestions({ questions }: OpenQuestionsProps) {
  if (!questions || questions.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10, padding: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Open Questions</span>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#e8f0fe', lineHeight: 1.9 }}>{questions.map((q, i) => (<li key={`oq-${i}`}>{q}</li>))}</ul>
    </div>
  )
}
