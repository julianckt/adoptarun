import React, { useState } from 'react';

export interface IslandVerificationProps {
  title?: string;
  initialCount?: number;
}

export const IslandVerification: React.FC<IslandVerificationProps> = ({
  title = 'Adopt A Run Island',
  initialCount = 1200,
}) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div
      data-testid="island-verification"
      style={{
        padding: '1.5rem',
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: '#111',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ margin: '0 0 1rem 0', color: '#aaa' }}>
        Current Count: <strong style={{ color: '#00ff88' }}>{count}</strong>
      </p>
      <button
        type="button"
        onClick={() => setCount((prev) => prev + 1)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#00ff88',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Increment Counter
      </button>
    </div>
  );
};

export default IslandVerification;
