interface DetailHeaderProps {
  name: string;
  onBack: () => void;
}

export function DetailHeader({ name, onBack }: DetailHeaderProps) {
  return (
    <div style={{
      background: 'var(--primary-950)',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-primary-300)',
          fontSize: 20,
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        ←
      </button>
      <h1 style={{
        fontFamily: 'var(--font-display, serif)',
        fontSize: 18,
        color: 'white',
        flex: 1,
        letterSpacing: '-0.01em',
      }}>
        {name}
      </h1>
    </div>
  );
}