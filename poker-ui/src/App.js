import React, { useState } from 'react';
import CardSelector from './components/CardSelector';
import ProbabilityDisplay from './components/ProbabilityDisplay';
import './App.css';

function App() {
  const [probabilities, setProbabilities] = useState(null);

  const fetchProbabilities = async (holeCards, communityCards) => {
    try {
      const response = await fetch('http://localhost:8080/api/poker/probabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holeCards, communityCards }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch probabilities');
      }

      const data = await response.json();
      setProbabilities(data);
    } catch (error) {
      console.error('Error fetching probabilities:', error);
    }
  };

  return (
    <div className="App">
      <h1>Poker Probability App</h1>
      <CardSelector onSubmit={fetchProbabilities} />
      <ProbabilityDisplay probabilities={probabilities} />
    </div>
  );
}

export default App;
