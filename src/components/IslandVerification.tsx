import React, { useState } from 'react';

export interface IslandVerificationProps {
  title?: string;
  initialCount?: number;
}

export const IslandVerification: React.FC<IslandVerificationProps> = ({
  title = 'adopt a run island',
  initialCount = 1200,
}) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div
      data-testid="island-verification"
      style={{
        padding: 'var(--space-06)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '0px',
        backgroundColor: 'var(--color-surface-canvas)',
        color: 'var(--color-canvas-white)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h3 style={{ margin: '0 0 var(--space-03) 0', fontSize: 'var(--font-size-body)', fontWeight: 500, textTransform: 'lowercase' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 var(--space-05) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-label)', lineHeight: 'var(--leading-body)' }}>
        current count: <strong style={{ color: 'var(--color-group-run-green)', fontWeight: 500 }}>{count}</strong>
      </p>
      <button
        type="button"
        onClick={() => setCount((prev) => prev + 1)}
        className="btn btn-primary"
        style={{
          padding: 'var(--space-03) var(--space-06)',
          fontSize: 'var(--font-size-label)',
        }}
      >
        increment counter
      </button>
    </div>
  );
};

export default IslandVerification;
