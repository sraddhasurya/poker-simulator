import React, { useEffect, useState, useCallback } from 'react';
import CardSelector from './components/CardSelector';
import ProbabilityDisplay from './components/ProbabilityDisplay';
import './App.css';

function App() {
  const [holeCards, setHoleCards] = useState(["", ""]);
  const [communityCards, setCommunityCards] = useState(["", "", "", "", ""]);
  const [potSize, setPotSize] = useState(100);
  const [callAmount, setCallAmount] = useState("");
  const [playerStack, setPlayerStack] = useState(500);
  const [raiseAmount, setRaiseAmount] = useState("");
  const [numPlayers, setNumPlayers] = useState(2);
  const [bettingRound, setBettingRound] = useState("Pre-Flop");
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
          callAmount,
          numPlayers,
        }),        
      });

      if (!response.ok) throw new Error('Failed to fetch probabilities');

      const data = await response.json();
      setProbabilities(data.probabilities);
      setExpectedValue(data.expectedValue);
    } catch (error) {
      console.error('Error fetching probabilities:', error);
    }
  }, [holeCards, communityCards, potSize, callAmount, numPlayers]);

  useEffect(() => {
    const hasHoleCards = holeCards.some(card => card);
    const hasCommunityCards = communityCards.some(card => card);

    if (!hasHoleCards && !hasCommunityCards) {
      setProbabilities(null);
      setExpectedValue(null);
      return;
    }

    if (holeCards.every(Boolean)) {
      fetchProbabilities();
    }
  }, [holeCards, communityCards, potSize, callAmount, fetchProbabilities]);

  const updatePotWithCall = () => {
    const amt = Number(callAmount);
    if (!isNaN(amt) && amt > 0 && amt <= playerStack) {
      setPotSize(p => p + amt);
      setPlayerStack(s => s - amt);
      setCallAmount(""); // optional: reset input
    }
  };

  const handleRaise = () => {
    const amt = Number(raiseAmount);
    if (!isNaN(amt) && amt > 0 && amt <= playerStack) {
      setPotSize(p => p + amt);
      setPlayerStack(s => s - amt);
      setRaiseAmount(""); // optional: reset input
    }
  };

  const handleAllIn = () => {
    setPotSize(p => p + playerStack);
    setRaiseAmount(playerStack);
    setPlayerStack(0);
  };

  useEffect(() => {
    const filled = communityCards.filter(Boolean).length;
    if (filled === 0) setBettingRound("Pre-Flop");
    else if (filled === 3) setBettingRound("Flop");
    else if (filled === 4) setBettingRound("Turn");
    else if (filled === 5) setBettingRound("River");
  }, [communityCards]);

  const resetGame = () => {
    setHoleCards(["", ""]);
    setCommunityCards(["", "", "", "", ""]);
    setPotSize(100);       // Reset to default pot
    setCallAmount("");     // Reset inputs
    setRaiseAmount("");
    setPlayerStack(500);   // Reset stack
    setProbabilities(null);
    setExpectedValue(null);
  };
  

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <ProbabilityDisplay probabilities={probabilities} expectedValue={expectedValue} />
        </div>

        <div style={{ flex: 2, maxWidth: '700px' }}>
          <h1 style={{ textAlign: 'center' }}>Poker Probability App</h1>

          <CardSelector
            holeCards={holeCards}
            setHoleCards={setHoleCards}
            communityCards={communityCards}
            setCommunityCards={setCommunityCards}
            onSubmit={fetchProbabilities}
            layout="single-row"
            onReset={resetGame}
          />

          <label>
            Number of Players:
            <input
              type="number"
              value={numPlayers}
              onChange={(e) => setNumPlayers(Number(e.target.value))}
              min={2}
              max={10}
              disabled={holeCards.some(Boolean) || communityCards.some(Boolean)}
              style={{ width: "50px", marginLeft: "10px" }}
            />
          </label>

          <div style={{ marginTop: "20px" }}>
            <p><strong>Betting Round:</strong> {bettingRound}</p>
            <p><strong>Stack:</strong> ${playerStack}</p>
            <p><strong>Pot:</strong> ${potSize}</p>

            <label>
              Call Amount: $
              <input
                type="number"
                value={callAmount}
                onChange={(e) => setCallAmount(Number(e.target.value))}
                style={{ width: "80px", marginRight: "10px" }}
              />
            </label>
            <button onClick={updatePotWithCall}>Call</button>

            <label style={{ marginLeft: "20px" }}>
              Raise Amount: $
              <input
                type="number"
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                style={{ width: "80px", marginRight: "10px" }}
              />
            </label>
            <button onClick={handleRaise}>Raise</button>
            <button style={{ marginLeft: "10px" }} onClick={handleAllIn}>All-In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
