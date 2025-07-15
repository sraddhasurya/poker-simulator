import React from 'react';

export default function ProbabilityDisplay({ probabilities, expectedValue, winProbability, tieProbability }) {
  if (!probabilities) return null;

  return (
    <div className="probability-display">
      <h2>Hand Probabilities</h2>
      <ul>
        {Object.entries(probabilities).map(([hand, prob]) => (
          <li key={hand}>
            <strong>{hand}</strong>: {(prob * 100).toFixed(2)}%
          </li>
        ))}
      </ul>

      {typeof expectedValue === 'number' && !isNaN(expectedValue) && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Expected Value (EV):{' '}
            <span style={{ color: expectedValue >= 0 ? 'green' : 'red' }}>
              ${expectedValue.toFixed(2)}
            </span>
          </h3>
        </div>
      )}
    {typeof winProbability === 'number' && !isNaN(winProbability) && (
      <div>
         <p>Win Probability: {(winProbability * 100).toFixed(2)}%</p>
      </div>
      )}

    {typeof tieProbability === 'number' && !isNaN(tieProbability) && (
      <div>
        <p>Tie Probability: {(tieProbability * 100).toFixed(2)}%</p>
      </div>
        )}
      </div>
  );
}
