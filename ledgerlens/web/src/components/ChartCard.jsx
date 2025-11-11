export default function ChartCard({ title, img, csv }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      }}
    >
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <img alt={title} src={img} style={{ width: '100%', borderRadius: 8 }} />
      {csv && (
        <a href={csv} download style={{ display: 'inline-block', marginTop: 8 }}>
          Download CSV
        </a>
      )}
    </div>
  )
}

