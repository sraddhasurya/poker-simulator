import React, { useState, useEffect, useRef } from 'react';

const SUITS = ['H', 'D', 'C', 'S'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const START_BANK = 1000;
const BIG_BLIND = 20;
const SMALL_BLIND = 10;

function getDeck() {
  const deck = [];
  for (let suit of SUITS) for (let rank of RANKS) deck.push(`${rank}${suit}`);
  return deck;
}

function shuffle(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
function recalculatePot(players) {
  return players.reduce((sum, p) => sum + p.bet, 0);
}

function getHandString(hand, show) {
  return hand.map(card => show ? card : '??').join(' ');
}

function getPlayerName(i) {
  return i === 0 ? 'You' : `Bot ${i}`;
}

function getNextActivePlayer(players, from) {
  let idx = from;
  do {
    idx = (idx + 1) % players.length;
  } while (!players[idx].inHand && idx !== from);
  return idx;
}

function getActivePlayers(players) {
  return players.filter(p => p.inHand);
}

function renderCard(card, show = true) {
  if (!card || card === '??' || !show) {
    return (
      <div className="poker-card" style={{ color: 'black', opacity: 0.3 }}>
        <div className="corner top-left">?</div>
        <div className="suit">?</div>
        <div className="corner bottom-right">?</div>
      </div>
    );
  }
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
}

export default function PokerGame({ numPlayers, onExit }) {
  const [players, setPlayers] = useState([]);
  const [community, setCommunity] = useState([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState('preflop');
  const [message, setMessage] = useState('');
  const [showdown, setShowdown] = useState(false);
  const [raiseInput, setRaiseInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState(null);
  const deckRef = useRef([]);
  const dealingRef = useRef(false);

  // Initialize game
  useEffect(() => {
    startNewHand();
    // eslint-disable-next-line
  }, []);

  

  // Handle player action
  function handleAction(action, amount) {
    if (gameOver) return;
    
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const idx = currentPlayer;
      const player = { ...newPlayers[idx] };
      const toCall = currentBet - player.bet;
      
      if (action === 'fold') {
        player.inHand = false;
        player.folded = true;
        setMessage('You folded!');
      } else if (action === 'call') {
        const actualCall = Math.min(toCall, player.bank);
        player.bank -= actualCall;
        player.bet += actualCall;
        newPlayers[idx] = player; // ✅ update array first
      
        const updatedPot = recalculatePot(newPlayers); // ✅ now recalculate pot
        setPot(updatedPot); // ✅ and update state
      
        setMessage(`You called for $${actualCall}.`);
      }
       else if (action === 'raise') {
        const raiseAmt = Number(amount);
        if (isNaN(raiseAmt) || raiseAmt < BIG_BLIND) {
          setMessage(`Raise must be at least $${BIG_BLIND}`);
          return prevPlayers;
        }
        const totalBet = toCall + raiseAmt;
        const actualBet = Math.min(totalBet, player.bank);
        player.bank -= actualBet;
        player.bet += actualBet;
        newPlayers[idx] = player; // ✅ update array first
      
        const updatedPot = recalculatePot(newPlayers); // ✅ then update pot
        setPot(updatedPot);
        setCurrentBet(player.bet);
        setMessage(`You raised to $${player.bet}`);
        setRaiseInput('');
      }
      
      
      newPlayers[idx] = player;
      
      // Use setTimeout to avoid state update conflicts
      setTimeout(() => nextTurn(newPlayers, idx), 100);
      
      return newPlayers;
    });
  }

  // Computer AI
  function botAction(idx) {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[idx] };
      const toCall = currentBet - player.bet;
      
      // Simple AI: random fold/call/raise
      if (Math.random() < 0.05) {
        // Fold
        player.inHand = false;
        player.folded = true;
        setMessage(`${player.name} folds.`);
      } else if (Math.random() < 0.7 || toCall >= player.bank) {
        // Call (or all-in if can't afford full call)
        const actualCall = Math.min(toCall, player.bank);
        player.bank -= actualCall;
        player.bet += actualCall;
        newPlayers[idx] = player;
        setPot(recalculatePot(newPlayers));
        if (actualCall < toCall) {
          setMessage(`${player.name} goes all-in for $${actualCall}.`);
        } else {
          setMessage(`${player.name} calls for $${actualCall}.`);
        }
      } else {
        // Raise
        const raiseAmt = BIG_BLIND * (1 + Math.floor(Math.random() * 3));
        const totalBet = toCall + raiseAmt;
        const actualBet = Math.min(totalBet, player.bank);
        player.bank -= actualBet;
        player.bet += actualBet;
        newPlayers[idx] = player;
        setPot(recalculatePot(newPlayers));
        setCurrentBet(player.bet);
        setMessage(`${player.name} raises to $${player.bet}.`);
      }
      
      newPlayers[idx] = player;
      
      setTimeout(() => nextTurn(newPlayers, idx), 800);
      
      return newPlayers;
    });
  }

   // Add this state variable at the top with your other useState calls


// Replace your nextTurn function with this fixed version
async function getWinnerFromBackend(players, community) {
  const playerHands = players.map(p => p.hand);
  const response = await fetch('http://localhost:8080/api/poker/evaluate-winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      players: playerHands,
      community
    })
  });
  const data = await response.json();
  return data.winner; // index
}

function nextTurn(newPlayers, prevIdx) {
  if (dealingRef.current) return; // Prevent double dealing

  const active = getActivePlayers(newPlayers);

  if (active.length === 1) {
    const winnerIndex = newPlayers.findIndex(p => p.inHand);
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[winnerIndex].bank += pot;
      return updatedPlayers;
    });
    setShowdown(true);
    setWinnerIdx(winnerIndex);
    setMessage(`${newPlayers[winnerIndex].name} wins the pot of $${pot}!`);
    setGameOver(true);
    return;
  }

  const activeBets = active.map(p => p.bet);
  const maxBet = Math.max(...activeBets);
  const bettingComplete = activeBets.every(bet => bet === maxBet);

  if (bettingComplete) {
    dealingRef.current = true;

    if (round === 'preflop') {
      const flopCards = [deckRef.current.pop(), deckRef.current.pop(), deckRef.current.pop()];
      setCommunity(flopCards);
      setRound('flop');
      setMessage('Flop dealt!');
    } else if (round === 'flop') {
      const turnCard = deckRef.current.pop();
      setCommunity(prev => [...prev, turnCard]);
      setRound('turn');
      setMessage('Turn card dealt!');
    } else if (round === 'turn') {
      const riverCard = deckRef.current.pop();
      setCommunity(prev => [...prev, riverCard]);
      setRound('river');
      setMessage('River card dealt!');
    } else if (round === 'river') {
      setShowdown(true);
      const inHandIdxs = newPlayers.map((p, i) => p.inHand ? i : null).filter(i => i !== null);
      const inHandPlayers = inHandIdxs.map(i => newPlayers[i]);
      getWinnerFromBackend(inHandPlayers, community).then(winnerIdx => {
        const globalWinnerIdx = inHandIdxs[winnerIdx];
        setPlayers(prevPlayers => {
          const updatedPlayers = [...prevPlayers];
          updatedPlayers[globalWinnerIdx].bank += pot;
          // Set winnerIdx and message here to use the updated bank value
          setWinnerIdx(globalWinnerIdx);
          setMessage(`${updatedPlayers[globalWinnerIdx].name} wins the pot of $${pot}! New bank: $${updatedPlayers[globalWinnerIdx].bank}`);
          setGameOver(true);
          dealingRef.current = false;
          return updatedPlayers;
        });
      });
      return;
    }

    setTimeout(() => {
      setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, bet: 0 })));
      setCurrentBet(0);
      dealingRef.current = false;
      const firstActiveIdx = newPlayers.findIndex(p => p.inHand);
      setCurrentPlayer(firstActiveIdx);
      if (firstActiveIdx !== 0) {
        setTimeout(() => botAction(firstActiveIdx), 1000);
      } else {
        setMessage('Your turn!');
      }
    }, 1500);
    return;
  }

  let nextIdx = getNextActivePlayer(newPlayers, prevIdx);
  setCurrentPlayer(nextIdx);

  if (nextIdx !== 0) {
    setTimeout(() => botAction(nextIdx), 1000);
  } else {
    setMessage('Your turn!');
  }
}

// Also update your startNewHand function to reset the dealingCards flag
function startNewHand() {
  const deck = shuffle(getDeck());
  deckRef.current = deck;
  setPlayers(prevPlayers => {
    const allPlayers = [];
    for (let i = 0; i < numPlayers + 1; i++) {
      allPlayers.push({
        name: getPlayerName(i),
        hand: [deckRef.current.pop(), deckRef.current.pop()],
        bank: prevPlayers && prevPlayers[i] ? prevPlayers[i].bank : START_BANK,
        inHand: true,
        bet: 0,
        folded: false,
      });
    }
    // Blinds
    allPlayers[1].bank -= SMALL_BLIND;
    allPlayers[1].bet = SMALL_BLIND;
    allPlayers[2 % allPlayers.length].bank -= BIG_BLIND;
    allPlayers[2 % allPlayers.length].bet = BIG_BLIND;
    setCommunity([]);
    setPot(SMALL_BLIND + BIG_BLIND);
    setCurrentBet(BIG_BLIND);
    setCurrentPlayer(0);
    setRound('preflop');
    setMessage('Your turn!');
    setShowdown(false);
    setRaiseInput('');
    setGameOver(false);
    setWinnerIdx(null);
    dealingRef.current = false; // Reset the dealing flag
    return allPlayers;
  });
}

// Also add this to see community state changes
useEffect(() => {
  console.log('Community cards updated:', community, 'Length:', community.length);
}, [community]);

  // Guard clause to prevent accessing properties of undefined players
  if (!players || players.length === 0) {
    return <div style={{textAlign:'center',marginTop:40}}>Loading game...</div>;
  }

  const currentPlayerData = players[currentPlayer];
  const toCall = currentBet - (currentPlayerData?.bet || 0);

  // Render
  // Render
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', position: 'relative' }}>
      <button onClick={onExit} style={{ position: 'absolute', top: 10, right: 10, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 16, cursor: 'pointer' }}>Exit</button>
      <h2 style={{ textAlign: 'center' }}>Poker Game</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20 }}>
        {players.map((p, i) => (
          <div key={i} style={{ minWidth: 100, textAlign: 'center', opacity: p.inHand ? 1 : 0.5 }}>
            <div style={{ fontWeight: i === 0 ? 'bold' : 'normal' }}>{p.name}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
              {p.hand.map((card, idx) => renderCard(card, i === 0 || showdown))}
            </div>
            <div>Bank: ${p.bank}</div>
            {p.folded && <div style={{ color: '#dc3545' }}>Folded</div>}
            {winnerIdx === i && gameOver && <div style={{ color: '#28a745', fontWeight: 'bold' }}>Winner!</div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <strong style={{ alignSelf: 'center' }}>Community Cards:</strong>
        {community.map((card, idx) => (
          <span key={idx}>{renderCard(card, true)}</span>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <strong>Pot:</strong> ${pot}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16, minHeight: 24 }}>
        {message}
      </div>
      {/* Player controls */}
      {!gameOver && currentPlayer === 0 && players[0].inHand && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button onClick={() => handleAction('call')} style={{ margin: '0 8px', padding: '8px 20px', fontSize: 16 }}>Call</button>
          <button onClick={() => handleAction('fold')} style={{ margin: '0 8px', padding: '8px 20px', fontSize: 16 }}>Fold</button>
          <input
            type="number"
            min={BIG_BLIND}
            value={raiseInput}
            onChange={e => setRaiseInput(e.target.value)}
            style={{ width: 70, fontSize: 16, marginLeft: 16 }}
            placeholder={`Raise (${BIG_BLIND}+)`}
          />
          <button onClick={() => handleAction('raise', raiseInput)} style={{ margin: '0 8px', padding: '8px 20px', fontSize: 16 }}>Raise</button>
        </div>
      )}
      {/* Replay/Exit */}
      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={startNewHand} style={{ margin: '0 8px', padding: '8px 20px', fontSize: 16, background: '#28a745', color: '#fff', border: 'none', borderRadius: 6 }}>Play Again</button>
          <button onClick={onExit} style={{ margin: '0 8px', padding: '8px 20px', fontSize: 16, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6 }}>Exit</button>
        </div>
      )}
    </div>
  );
} 