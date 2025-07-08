import React from 'react';

export default function ProbabilityDisplay({ probabilities }) {
  if (!probabilities) return null;

  // Convert object to array and sort descending by percentage
  const sortedEntries = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a); // Sort by value (probability), descending

  return (
    <div>
      <h2>Probabilities</h2>
      {sortedEntries.map(([hand, probability]) => (
        <div key={hand}>
          {hand}: {(probability * 100).toFixed(2)}%
        </div>
      ))}
    </div>
  );
}
