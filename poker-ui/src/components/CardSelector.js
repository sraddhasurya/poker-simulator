import React, { useState } from 'react';

export default function CardSelector({ onSubmit, holeCards, setHoleCards, communityCards, setCommunityCards }) {
  const [clicks, setClicks] = useState(0);

  const handleAutoGenerate = () => {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push(`${rank}${suit}`);
      }
    }

    const used = [...holeCards, ...communityCards].filter(Boolean);
    const available = deck.filter(card => !used.includes(card));
    const draw = () => available.splice(Math.floor(Math.random() * available.length), 1)[0];

    if (clicks === 0) {
      setHoleCards([draw(), draw()]);
    } else if (clicks === 1) {
      setCommunityCards([draw(), draw(), draw(), "", ""]);
    } else if (clicks === 2) {
      const copy = [...communityCards];
      copy[3] = draw();
      setCommunityCards(copy);
    } else if (clicks === 3) {
      const copy = [...communityCards];
      copy[4] = draw();
      setCommunityCards(copy);
    }

    setClicks(clicks + 1);
  };

  const handleReset = () => {
    setHoleCards(["", ""]);
    setCommunityCards(["", "", "", "", ""]);
    setClicks(0);
  };

  const renderCard = (card) => {
    const rank = card.slice(0, -1);
    const suitChar = card.slice(-1).toUpperCase();
    const suits = { H: '♥', D: '♦', C: '♣', S: '♠' };
    const colors = { H: 'red', D: 'red', C: 'black', S: 'black' };
    const symbol = suits[suitChar] || '?';
    const color = colors[suitChar] || 'black';

    return (
      <div className="poker-card" style={{ color }}>
        <div className="corner top-left">{rank}<br />{symbol}</div>
        <div className="suit">{symbol}</div>
        <div className="corner bottom-right">{rank}<br />{symbol}</div>
      </div>
    );
  };

  return (
    <div>
      <h3>Player Hole Cards</h3>
      <div className="card-row">
        {holeCards.map((card, i) => (
          <div key={i} className="card-slot">
            <input
              type="text"
              value={card}
              onChange={(e) => {
                const copy = [...holeCards];
                copy[i] = e.target.value.toUpperCase();
                setHoleCards(copy);
              }}
              placeholder="e.g. AH"
              maxLength={3}
            />
            {card && renderCard(card)}
          </div>
        ))}
      </div>

      <h3>Community Cards</h3>
      <div className="card-row">
        {communityCards.map((card, i) => (
          <div key={i} className="card-slot">
            <input
              type="text"
              value={card}
              onChange={(e) => {
                const copy = [...communityCards];
                copy[i] = e.target.value.toUpperCase();
                setCommunityCards(copy);
              }}
              placeholder="e.g. 10H"
              maxLength={3}
            />
            {card && renderCard(card)}
          </div>
        ))}
      </div>

      <div className="button-group">
        <button onClick={handleAutoGenerate}>Generate Next Cards</button>
        <button onClick={handleReset}>Start New</button>
        <button onClick={() => onSubmit(holeCards.filter(Boolean), communityCards.filter(Boolean))}>
          Show Probabilities
        </button>
      </div>
    </div>
  );
}
