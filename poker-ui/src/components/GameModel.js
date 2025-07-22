import React, { useState } from 'react';

export default function GameModal({ onSelect, onClose }) {
  const [numPlayers, setNumPlayers] = useState('2');

  const handleStart = () => {
    let n = parseInt(numPlayers, 10);
    if (isNaN(n) || n < 1) n = 2;
    if (n > 7) n = 7;
    onSelect(n);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 300, textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
        <h2>Start Poker Game</h2>
        <div style={{ margin: '20px 0' }}>
          <label>How many players do you want to play against?&nbsp;</label>
          <input
            type="number"
            min={1}
            max={7}
            value={numPlayers}
            onChange={e => setNumPlayers(e.target.value)}
            style={{ width: 50, fontSize: 18, textAlign: 'center' }}
          />
        </div>
        <button
          style={{ padding: '8px 24px', fontSize: 18, borderRadius: 6, background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
          onClick={handleStart}
        >
          Start Game
        </button>
      </div>
    </div>
  );
} 