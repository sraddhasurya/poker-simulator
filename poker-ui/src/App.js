import React, { useEffect, useState, useCallback } from 'react';
import CardSelector from './components/CardSelector';
import ProbabilityDisplay from './components/ProbabilityDisplay';
import './App.css';

function App() {
  const [holeCards, setHoleCards] = useState(["", ""]);
  const [communityCards, setCommunityCards] = useState(["", "", "", "", ""]);
  const [potSize, setPotSize] = useState(100);        // default example
  const [callAmount, setCallAmount] = useState(50);    // default example
  const [probabilities, setProbabilities] = useState(null);
  const [expectedValue, setExpectedValue] = useState(null);

  const fetchProbabilities = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/poker/probabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holeCards: holeCards.filter(Boolean),
          communityCards: communityCards.filter(Boolean),
          potSize,
          callAmount
        }),        
      
      });

      if (!response.ok) throw new Error('Failed to fetch probabilities');

      const data = await response.json();
      console.log("Sending:", { holeCards, communityCards, potSize, callAmount });
      console.log("Received:", data);
      setProbabilities(data.probabilities);
      setExpectedValue(data.expectedValue);
    } catch (error) {
      console.error('Error fetching probabilities:', error);
    }
  }, [holeCards, communityCards, potSize, callAmount]);

  useEffect(() => {
    if (holeCards.every(Boolean)) {
      fetchProbabilities();
    }
  }, [holeCards, communityCards, potSize, callAmount, fetchProbabilities]);

  return (
    <div className="App">
      <h1>Poker Probability App</h1>

      <CardSelector
        holeCards={holeCards}
        setHoleCards={setHoleCards}
        communityCards={communityCards}
        setCommunityCards={setCommunityCards}
        onSubmit={fetchProbabilities}
      />

      <div style={{ marginTop: "20px" }}>
        <label>
          Pot Size: $
          <input
            type="number"
            value={potSize}
            onChange={(e) => setPotSize(Number(e.target.value))}
            style={{ marginRight: "20px", width: "80px" }}
          />
        </label>

        <label>
          Call Amount: $
          <input
            type="number"
            value={callAmount}
            onChange={(e) => setCallAmount(Number(e.target.value))}
            style={{ width: "80px" }}
          />
        </label>
      </div>

      <ProbabilityDisplay probabilities={probabilities} expectedValue={expectedValue} />
    </div>
  );
}

export default App;
