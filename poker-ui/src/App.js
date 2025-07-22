import React, { useEffect, useState, useCallback } from 'react';
import CardSelector from './components/CardSelector';
import ProbabilityDisplay from './components/ProbabilityDisplay';
import GameModal from './components/GameModel';
import PokerGame from './components/PokerGame';
import './App.css';

function App() {
  // --- Probability Calculator State ---
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

  // --- Play Game Mode State ---
  const [gameMode, setGameMode] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [numGamePlayers, setNumGamePlayers] = useState(2); // for PokerGame only

  // --- Probability Calculator Logic ---
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
          raiseAmount,
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
  }, [holeCards, communityCards, potSize, callAmount,raiseAmount, numPlayers]);

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

  // Betting round display logic
  useEffect(() => {
    const filled = communityCards.filter(Boolean).length;
    if (filled === 0) setBettingRound("Pre-Flop");
    else if (filled === 3) setBettingRound("Flop");
    else if (filled === 4) setBettingRound("Turn");
    else if (filled === 5) setBettingRound("River");
  }, [communityCards]);

  // Calculator betting handlers
  const updatePotWithCall = async () => {
    const amt = Number(callAmount);
    if (!isNaN(amt) && amt > 0 && amt <= playerStack) {
      // Compute EV based on *current* pot + call amount, not after
      await fetchProbabilities();
  
      // Then actually commit the bet
      setPotSize(p => p + amt);
      setPlayerStack(s => s - amt);
      setCallAmount("");
    }
  };

  const handleRaise = async () => {
    const amt = Number(raiseAmount);
    if (!isNaN(amt) && amt > 0 && amt <= playerStack) {
      await fetchProbabilities();
      setPotSize(p => p + amt);
      setPlayerStack(s => s - amt);
      setRaiseAmount("");
    }
  };

  const handleAllIn = async () => {
    await fetchProbabilities();
    setPotSize(p => p + playerStack);
    setRaiseAmount(playerStack);
    setPlayerStack(0);
  };
  

  const resetGame = () => {
    setHoleCards(["", ""]);
    setCommunityCards(["", "", "", "", ""]);
    setPotSize(100);
    setCallAmount("");
    setRaiseAmount("");
    setPlayerStack(500);
    setProbabilities(null);
    setExpectedValue(null);
  };

  // --- Play Game Mode Handlers ---
  const handleStartGame = () => setShowGameModal(true);
  const handleSelectPlayers = (n) => {
    setNumGamePlayers(n);
    setShowGameModal(false);
    setGameMode(true);
  };
  const handleExitGame = () => {
    setGameMode(false);
    setShowGameModal(false);
  };

  return (
    <div className="App">
      {/* ProbabilityDisplay always top left, except in game mode */}
      {!gameMode && (
        <div style={{ position: 'absolute', top: 20, left: 30, zIndex: 10 }}>
          <ProbabilityDisplay probabilities={probabilities} expectedValue={expectedValue} />
        </div>
      )}

      {/* Play Game button top right */}
      {!gameMode && (
        <div style={{ position: 'absolute', top: 20, right: 30 }}>
          <button onClick={handleStartGame} style={{ padding: '8px 20px', fontSize: 16, borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Play Game
          </button>
        </div>
      )}

      {/* Game Modal */}
      {showGameModal && (
        <GameModal onSelect={handleSelectPlayers} onClose={() => setShowGameModal(false)} />
      )}

      {/* Poker Game mode */}
      {gameMode ? (
        <PokerGame numPlayers={Math.max(1, numGamePlayers)} onExit={handleExitGame} />
      ) : (
        <>
          <h1>Poker Probability App</h1>
          <CardSelector
            holeCards={holeCards}
            setHoleCards={setHoleCards}
            communityCards={communityCards}
            setCommunityCards={setCommunityCards}
            onSubmit={fetchProbabilities}
            onReset={resetGame}
          />
          <div style={{ marginTop: "20px" }}>
            <p><strong>Betting Round:</strong> {bettingRound}</p>
            <p><strong>Stack:</strong> ${playerStack}</p>
            <p><strong>Pot:</strong> ${potSize}</p>
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
            <br />
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
        </>
      )}
    </div>
  );
}

export default App;
