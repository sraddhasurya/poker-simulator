import React, { useState, useEffect } from 'react';

export default function CardSelector({ onSubmit, holeCards, setHoleCards, communityCards, setCommunityCards }) {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const filledHole = holeCards.filter(Boolean).length;
    const filledCommunity = communityCards.filter(Boolean).length;
  
    if (filledHole < 2) {
      setClicks(0);
    } else if (filledCommunity < 3) {
      setClicks(1);
    } else if (filledCommunity < 4) {
      setClicks(2);
    } else if (filledCommunity < 5) {
      setClicks(3);
    } else {
      setClicks(4); // All cards are filled
    }
  }, [holeCards, communityCards]);
  

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
      const newHoleCards = [...holeCards];
      for (let i = 0; i < 2; i++) {
        if (!newHoleCards[i]) {
          newHoleCards[i] = draw();
        }
      }
      setHoleCards(newHoleCards);
    } else if (clicks === 1) {
      const newCommunity = [...communityCards];
      for (let i = 0; i < 3; i++) {
        if (!newCommunity[i]) {
          newCommunity[i] = draw();
        }
      }
      setCommunityCards(newCommunity);
    } else if (clicks === 2) {
      const copy = [...communityCards];
      if (!copy[3]) {
        copy[3] = draw();
      }
      setCommunityCards(copy);
    } else if (clicks === 3) {
      const copy = [...communityCards];
      if (!copy[4]) {
        copy[4] = draw();
      }
      setCommunityCards(copy);
    }
  
    setClicks(prev => Math.min(prev + 1, 4)); // cap clicks at 4
  };
  

  const handleReset = () => {
    setHoleCards(["", ""]);
    setCommunityCards(["", "", "", "", ""]);
    setClicks(0);
  };

  const getButtonLabel=()=>{
    switch (clicks){
      case 0:
        return "Generate Hole Cards"
      case 1:
        return "Generate Flop Cards"
      case 2:
        return "Generate Turn Card"
      case 3:
        return "Generate River Card"
      default:
        return "All Cards Generated"
    }
  }

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
        
      {clicks < 4 && (
        <button onClick={handleAutoGenerate}>
           {getButtonLabel()}
        </button>
      )}
        <button onClick={handleReset}>Start New</button>
        <button onClick={() => onSubmit(holeCards.filter(Boolean), communityCards.filter(Boolean))}>
          Show Probabilities
        </button>
      </div>
    </div>
  );
}