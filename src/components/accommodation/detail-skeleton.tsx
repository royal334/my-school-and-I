export function DetailSkeleton() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ height: 280, background: 'var(--muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 16, background: 'var(--muted)', borderRadius: 4, marginBottom: 12, width: i === 0 ? '70%' : '100%' }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}