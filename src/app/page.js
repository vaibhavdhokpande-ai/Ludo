'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [diceValue, setDiceValue] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Apni baari kheliye!');
  
  const players = [
    { name: 'Red (Aap)', color: '#ff4d4d', isBot: false },
    { name: 'Green (Bot)', color: '#4dff4d', isBot: true },
    { name: 'Yellow (Bot)', color: '#ffff4d', isBot: true },
    { name: 'Blue (Bot)', color: '#4d4dff', isBot: true }
  ];

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);

  const [tokens, setTokens] = useState([
    [-1, -1, -1, -1], 
    [-1, -1, -1, -1], 
    [-1, -1, -1, -1], 
    [-1, -1, -1, -1]  
  ]);

  const BOARD_PATH = [
    91, 76, 61, 46, 31, 16, 17, 18, 19, 20, 21, 36, 51, 66, 81, 96, 97, 98, 
    83, 68, 53, 38, 23, 24, 25, 26, 27, 28, 29, 44, 59, 74, 89, 104, 119, 134, 
    133, 132, 131, 130, 129, 143, 158, 173, 188, 203, 218, 217, 216, 201, 186, 
    171, 156, 141, 126, 125, 124, 123, 122, 121, 120, 105, 90
  ];

  const START_POINTS = [0, 22, 35, 48];
  const SAFE_ZONES = [0, 22, 35, 48, 8, 30, 43, 55];

  const rollDice = () => {
    if (isRolling || winner) return;
    
    setIsRolling(true);
    setMessage('');
    setTimeout(() => {
      const randomNum = Math.floor(Math.random() * 6) + 1;
      setDiceValue(randomNum);
      setIsRolling(false);

      let canMove = false;
      for (let i = 0; i < 4; i++) {
        if (tokens[currentPlayer][i] === -1 && randomNum === 6) canMove = true;
        else if (tokens[currentPlayer][i] !== -1 && tokens[currentPlayer][i] + randomNum <= 63) canMove = true;
      }

      if (!canMove) {
        setMessage(`Koi move nahi ho sakta. Turn pass!`);
        setTimeout(() => {
          setCurrentPlayer((prev) => (prev + 1) % 4);
          setDiceValue(0);
        }, 1500);
      } else {
        if (players[currentPlayer].isBot) {
          setMessage('Bot soch raha hai...');
        } else {
          setMessage('Token select karein jo move kare!');
        }
      }
    }, 500);
  };

  const handleTokenClick = (pIdx, tIdx) => {
    if (pIdx !== currentPlayer || diceValue === 0 || isRolling || winner) return;

    let currentPos = tokens[pIdx][tIdx];
    let newPos;

    if (currentPos === -1) {
      if (diceValue === 6) newPos = START_POINTS[pIdx];
      else return;
    } else {
      newPos = currentPos + diceValue;
      if (newPos > 63) return;
    }

    let newTokens = tokens.map(p => [...p]);
    newTokens[pIdx][tIdx] = newPos;
    
    let killed = false;

    if (newPos !== 63 && !SAFE_ZONES.includes(newPos)) {
      for (let i = 0; i < 4; i++) {
        if (i !== pIdx) {
          for (let j = 0; j < 4; j++) {
            if (newTokens[i][j] !== -1 && BOARD_PATH[newTokens[i][j]] === BOARD_PATH[newPos]) {
              newTokens[i][j] = -1;
              killed = true;
              setMessage(`Boom! ${players[pIdx].name} ne ${players[i].name} ka token cut kar diya!`);
            }
          }
        }
      }
    }

    setTokens(newTokens);

    if (newTokens[pIdx].every(pos => pos === 63)) {
      setWinner(pIdx);
      setMessage(`🎉 ${players[pIdx].name} Jeet Gaya! 🎉`);
      return;
    }

    if (diceValue !== 6 && !killed) {
      setCurrentPlayer((prev) => (prev + 1) % 4);
    } else {
      setMessage(message + ' Ek aur baar roll karein!');
    }

    setDiceValue(0);
  };

  useEffect(() => {
    if (players[currentPlayer].isBot && !winner && diceValue === 0 && !isRolling) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (players[currentPlayer].isBot && diceValue > 0 && !isRolling) {
      const timer = setTimeout(() => {
        let validMoves = [];
        for (let tIdx = 0; tIdx < 4; tIdx++) {
          let pos = tokens[currentPlayer][tIdx];
          if (pos === -1 && diceValue === 6) validMoves.push(tIdx);
          else if (pos !== -1 && pos + diceValue <= 63) validMoves.push(tIdx);
        }

        if (validMoves.length > 0) {
          let bestMove = validMoves[0];
          let maxPos = -1;
          
          validMoves.forEach(tIdx => {
            let pos = tokens[currentPlayer][tIdx];
            if (diceValue === 6 && pos === -1) {
              bestMove = tIdx;
              return;
            }
            if (pos > maxPos && pos !== -1) {
              maxPos = pos;
              bestMove = tIdx;
            }
          });

          handleTokenClick(currentPlayer, bestMove);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, diceValue, isRolling, winner, tokens]);

  const cells = [];
  for (let i = 0; i < 225; i++) {
    const row = Math.floor(i / 15) + 1;
    const col = (i % 15) + 1;
    let cellClass = styles.cell;

    if (row <= 6 && col <= 6) cellClass += ` ${styles.redHomeArea}`;
    else if (row <= 6 && col >= 10) cellClass += ` ${styles.greenHomeArea}`;
    else if (row >= 10 && col <= 6) cellClass += ` ${styles.blueHomeArea}`;
    else if (row >= 10 && col >= 10) cellClass += ` ${styles.yellowHomeArea}`;
    else if (row >= 7 && row <= 9 && col >= 7 && col <= 9) cellClass += ` ${styles.centerArea}`;
    else if (row === 8 && col >= 2 && col <= 6) cellClass += ` ${styles.redPath}`;
    else if (col === 8 && row >= 2 && row <= 6) cellClass += ` ${styles.greenPath}`;
    else if (col === 8 && row >= 10 && row <= 14) cellClass += ` ${styles.yellowPath}`;
    else if (row === 8 && col >= 10 && col <= 14) cellClass += ` ${styles.bluePath}`;

    let tokensInCell = [];
    players.forEach((player, pIdx) => {
      for (let tIdx = 0; tIdx < 4; tIdx++) {
        let pos = tokens[pIdx][tIdx];
        if (pos !== -1 && BOARD_PATH[pos] === i) {
          let isMovable = pIdx === currentPlayer && diceValue > 0 && !isRolling && !player.isBot;
          tokensInCell.push(
            <div 
              key={`${pIdx}-${tIdx}`} 
              className={`${styles.token} ${isMovable ? styles.movableToken : ''}`}
              style={{ backgroundColor: player.color }}
              onClick={() => handleTokenClick(pIdx, tIdx)}
            ></div>
          );
        }
      }
    });

    cells.push(
      <div key={i} className={cellClass}>
        <div className={styles.tokenContainer}>{tokensInCell}</div>
      </div>
    );
  }

  const renderYardTokens = (pIdx) => {
    let yardTokens = [];
    for (let tIdx = 0; tIdx < 4; tIdx++) {
      if (tokens[pIdx][tIdx] === -1) {
        let isMovable = pIdx === currentPlayer && diceValue === 6 && !isRolling && !winner && !players[pIdx].isBot;
        yardTokens.push(
          <div 
            key={tIdx} 
            className={`${styles.token} ${isMovable ? styles.movableToken : ''}`}
            style={{ backgroundColor: players[pIdx].color }}
            onClick={() => handleTokenClick(pIdx, tIdx)}
          ></div>
        );
      }
    }
    return yardTokens;
  };

  const activeColor = players[currentPlayer].color;

  return (
    <div className={styles.gameContainer}>
      <h1>Ludo Web (Next.js)</h1>
      
      <div className={styles.mainWrapper}>
        <div className={styles.board}>
          <div className={styles.yardArea} style={{ top: '10px', left: '10px' }}>{renderYardTokens(0)}</div>
          <div className={styles.yardArea} style={{ top: '10px', right: '10px' }}>{renderYardTokens(1)}</div>
          <div className={styles.yardArea} style={{ bottom: '10px', left: '10px' }}>{renderYardTokens(2)}</div>
          <div className={styles.yardArea} style={{ bottom: '10px', right: '10px' }}>{renderYardTokens(3)}</div>
          
          {cells}
        </div>

        {/* Dice aur Controls ko flex-direction column mein rakhne ke liye */}
        <div className={styles.controls} style={{ borderColor: activeColor }}>
          <h2 style={{ color: activeColor }}>
            {winner ? `Winner: ${players[winner].name}` : `${players[currentPlayer].name} Ki Baari`}
          </h2>
          
          {/* Dice Box ko bada aur visible banaya */}
          <div className={styles.diceBox} style={{ backgroundColor: activeColor }}>
            <div className={`${styles.dice} ${isRolling ? styles.rolling : ''}`}>
              {isRolling ? '?' : (diceValue === 0 ? '🎲' : diceValue)}
            </div>
          </div>
          
          <button 
            className={styles.rollBtn} 
            onClick={rollDice}
            disabled={isRolling || diceValue > 0 || winner || players[currentPlayer].isBot}
            style={{ backgroundColor: activeColor }}
          >
            {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
          </button>
          
          <p className={styles.statusText}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
