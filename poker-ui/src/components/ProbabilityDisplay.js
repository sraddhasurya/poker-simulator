import React from 'react';

export default function ProbabilityDisplay({ probabilities }) {
  if (!probabilities) return null;

  return (
    <div>
      <h3>Probabilities</h3>
      <ul>
        {Object.entries(probabilities).map(([hand, prob]) => (
          <li key={hand}>{hand}: {(prob * 100).toFixed(2)}%</li>
        ))}
      </ul>
    </div>
  );
}
