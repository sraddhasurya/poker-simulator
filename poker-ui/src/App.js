import React, { useState, useEffect, useCallback } from 'react';
import CardSelector from './components/CardSelector';
import ProbabilityDisplay from './components/ProbabilityDisplay';
import './App.css';

function App() {
  const [holeCards, setHoleCards] = useState(["", ""]);
  const [communityCards, setCommunityCards] = useState(["", "", "", "", ""]);
  const [probabilities, setProbabilities] = useState(null);

  // Auto-update probabilities when cards change
  useEffect(() => {
    const validHole = holeCards.filter(card => card);
    const validCommunity = communityCards.filter(card => card);

    if (validHole.length > 0 || validCommunity.length > 0) {
      fetchProbabilities(validHole, validCommunity);
    }
  }, [holeCards, communityCards]);

  const fetchProbabilities = useCallback(async (holeCards, communityCards) => {
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
  }, []);

  const handleManualUpdate = () => {
    fetchProbabilities();
  };

  const handleReset = () => {
    setHoleCards(["", ""]);
    setCommunityCards(["", "", "", "", ""]);
    setProbabilities(null);
    
  };

  return (
    <div className="App">
      <h1>Poker Probability App</h1>
      <CardSelector
        onSubmit={fetchProbabilities}
        holeCards={holeCards}
        setHoleCards={setHoleCards}
        communityCards={communityCards}
        setCommunityCards={setCommunityCards}
      />

      <div style={{ marginTop: '10px' }}>
        
    </div>
      <ProbabilityDisplay probabilities={probabilities} />
    </div>
  );
}

export default App;
