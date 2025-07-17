
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

  // Initialize game
  useEffect(() => {
    startNewHand();
    // eslint-disable-next-line
  }, []);

  function startNewHand() {
    const deck = shuffle(getDeck());
    deckRef.current = deck;
    const allPlayers = [];
    for (let i = 0; i < numPlayers + 1; i++) {
      allPlayers.push({
        name: getPlayerName(i),
        hand: [deckRef.current.pop(), deckRef.current.pop()],
        bank: START_BANK,
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
    setPlayers(allPlayers);
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
  }

  // Handle player action
  function handleAction(action, amount) {
    if (gameOver) return;
    let newPlayers = [...players];
    let idx = currentPlayer;
    let player = { ...newPlayers[idx] };
    let toCall = currentBet - player.bet;
    if (action === 'fold') {
      player.inHand = false;
      player.folded = true;
      setMessage('You folded!');
    } else if (action === 'call') {
      player.bank -= toCall;
      player.bet += toCall;
      setPot(pot + toCall);
      setMessage('You called.');
    } else if (action === 'raise') {
      const raiseAmt = Number(amount);
      if (isNaN(raiseAmt) || raiseAmt < BIG_BLIND) {
        setMessage(`Raise must be at least ${BIG_BLIND}`);
        return;
      }
      player.bank -= (toCall + raiseAmt);
      player.bet += (toCall + raiseAmt);
      setPot(pot + toCall + raiseAmt);
      setCurrentBet(player.bet);
      setMessage(`You raised to $${player.bet}`);
    }
    newPlayers[idx] = player;
    setPlayers(newPlayers);
    nextTurn(newPlayers, idx);
  }

  // Computer AI
  function botAction(idx) {
    let newPlayers = [...players];
    let player = { ...newPlayers[idx] };
    let toCall = currentBet - player.bet;
    // Simple AI: random fold/call/raise
    let action;
    if (Math.random() < 0.15) {
      action = 'fold';
      player.inHand = false;
      player.folded = true;
      setMessage(`${player.name} folds.`);
    } else if (Math.random() < 0.7) {
      action = 'call';
      player.bank -= toCall;
      player.bet += toCall;
      setPot(pot + toCall);
      setMessage(`${player.name} calls.`);
    } else {
      action = 'raise';
      let raiseAmt = BIG_BLIND * (1 + Math.floor(Math.random() * 3));
      player.bank -= (toCall + raiseAmt);
      player.bet += (toCall + raiseAmt);
      setPot(pot + toCall + raiseAmt);
      setCurrentBet(player.bet);
      setMessage(`${player.name} raises to $${player.bet}`);
    }
    newPlayers[idx] = player;
    setPlayers(newPlayers);
    setTimeout(() => nextTurn(newPlayers, idx), 800);
  }

  // Next turn logic
  function nextTurn(newPlayers, prevIdx) {
    // Check for end of betting round
    const active = getActivePlayers(newPlayers);
    if (active.length === 1) {
      // Only one left, they win
      setShowdown(true);
      setWinnerIdx(newPlayers.findIndex(p => p.inHand));
      setMessage(`${newPlayers[newPlayers.findIndex(p => p.inHand)].name} wins the pot!`);
      setGameOver(true);
      return;
    }
    // Find next player
    let nextIdx = getNextActivePlayer(newPlayers, prevIdx);
    if (nextIdx === 0) {
      // End of round, deal next community card or showdown
      if (round === 'preflop') {
        setCommunity([deckRef.current.pop(), deckRef.current.pop(), deckRef.current.pop()]);
        setRound('flop');
        setMessage('Flop!');
      } else if (round === 'flop') {
        setCommunity(c => [...c, deckRef.current.pop()]);
        setRound('turn');
        setMessage('Turn!');
      } else if (round === 'turn') {
        setCommunity(c => [...c, deckRef.current.pop()]);
        setRound('river');
        setMessage('River!');
      } else if (round === 'river') {
        setShowdown(true);
        // For now, pick random winner among those still in hand
        const inHandIdxs = newPlayers.map((p, i) => p.inHand ? i : null).filter(i => i !== null);
        const winner = inHandIdxs[Math.floor(Math.random() * inHandIdxs.length)];
        setWinnerIdx(winner);
        setMessage(`${newPlayers[winner].name} wins the pot!`);
        setGameOver(true);
        return;
      }
      // Reset bets for next round
      setPlayers(ps => ps.map(p => ({ ...p, bet: 0 })));
      setCurrentBet(0);
      setTimeout(() => setCurrentPlayer(0), 1000);
      return;
    }
    setCurrentPlayer(nextIdx);
    if (nextIdx !== 0) {
      setTimeout(() => botAction(nextIdx), 1000);
    }
  }

  // Guard clause to prevent accessing properties of undefined players
  if (!players || players.length === 0) {
    return <div style={{textAlign:'center',marginTop:40}}>Loading game...</div>;
  }

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
