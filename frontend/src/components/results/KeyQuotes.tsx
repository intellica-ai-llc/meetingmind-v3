interface Quote {
  speaker: string
  quote: string
}

interface KeyQuotesProps {
  quotes: Quote[]
}

export function KeyQuotes({ quotes }: KeyQuotesProps) {
  if (!quotes || quotes.length === 0) return null
  return (
    <div style={{ background: '#080d18', border: '1px solid #1e3a5f', borderRadius: 10, padding: 18, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Key Quotes</span>
      {quotes.map((q, i) => (
        <div key={`q-${i}`} style={{ borderLeft: '3px solid #7c3aed', paddingLeft: 14, marginBottom: 12 }}>
          <p style={{ margin: '0 0 3px', fontSize: 13, color: '#e8f0fe', fontStyle: 'italic' }}>"{q.quote}"</p>
          <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>— {q.speaker}</p>
        </div>
      ))}
    </div>
  )
}
