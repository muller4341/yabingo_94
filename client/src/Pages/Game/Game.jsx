import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const bingoColumns = [
  { letter: 'B', range: [1, 15], color: 'text-blue-600' },
  { letter: 'I', range: [16, 30], color: 'text-indigo-500' },
  { letter: 'N', range: [31, 45], color: 'text-fuchsia-700' },
  { letter: 'G', range: [46, 60], color: 'text-green-600' },
  { letter: 'O', range: [61, 75], color: 'text-yellow-500' },
];

const getColumnIndex = (num) => {
  if (num >= 1 && num <= 15) return 0;
  if (num >= 16 && num <= 30) return 1;
  if (num >= 31 && num <= 45) return 2;
  if (num >= 46 && num <= 60) return 3;
  if (num >= 61 && num <= 75) return 4;
  return -1;
};

const Game = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const intervalRef = useRef(null);
  const [showCurrent, setShowCurrent] = useState(false);
    const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null | { notFound: true } | { cartela: {...} }
  const [showPopup, setShowPopup] = useState(false);
  // Find the most recent called number that is present in the searched cartela
  let lastFoundInCartela = null;
  if (searchResult && searchResult.cartela && searchResult.cartela.grid) {
    // Flatten the grid to a list of numbers
    const cartelaNumbers = searchResult.cartela.grid.flat().filter(v => typeof v === 'number');
    // Find the last called number that is in the cartela
    for (let i = calledNumbers.length - 1; i >= 0; i--) {
      if (cartelaNumbers.includes(calledNumbers[i])) {
        lastFoundInCartela = calledNumbers[i];
        break;
      }
    }
  }

  // Generate a random number from 1-75 that hasn't been called yet
  const getRandomNumber = () => {
    const available = [];
    for (let i = 1; i <= 75; i++) {
      if (!calledNumbers.includes(i)) available.push(i);
    }
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const startGame = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    // Generate first number immediately
    const first = getRandomNumber();
    if (first !== null) {
      setCurrentNumber(first);
      setCalledNumbers(prev => [...prev, first]);
    }
    intervalRef.current = setInterval(() => {
      const num = getRandomNumber();
      if (num === null) {
        stopGame();
        return;
      }
      setCurrentNumber(num);
      setCalledNumbers(prev => [...prev, num]);
    }, 5000);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (currentNumber !== null) {
      setShowCurrent(true);
      const timeout = setTimeout(() => setShowCurrent(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [currentNumber]);

  const handleCheck = async () => {
    setSearchResult(null);
    setShowPopup(false);
    if (!searchValue.trim()) return;
    try {
      const res = await fetch('/api/selectedcartelas/recent');
      const data = await res.json();
      if (!data.success || !data.data) {
        setSearchResult({ notFound: true });
        setShowPopup(true);
        return;
      }
      const found = data.data.cartelas.find(
        c => String(c.cartelaNumber) === String(searchValue.trim())
      );
      if (!found) {
        setSearchResult({ notFound: true });
        setShowPopup(true);
        return;
      }
      setSearchResult({ cartela: found });
      setShowPopup(true);
    } catch (err) {
      setSearchResult({ notFound: true });
      setShowPopup(true);
    }
  };

  // Animation CSS
  const animationStyle = `
  @keyframes moveInFromBottomRight {
    0% {
      opacity: 0;
      transform: translate(120px, 120px) scale(0.2);
    }
    60% {
      opacity: 1;
      transform: translate(-10px, -10px) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }
  .blink {
    animation: blink 1s linear infinite;
  }
  `;

  return (
    <>
      <style>{animationStyle}</style>
      <div className='min-h-screen bg-gradient-to-br from-green-100 via-yellow-50 to-fuchsia-100'>
        <div className="flex md:flex-col flex-row rounded-3xl shadow-xl">
          {/* BINGO grid and number list + number display */}
          <div className="flex flex-col md:flex-row w-full md:w-auto  m-4 p-4 md:p-8">
            {/* BINGO letters */}
            <div className="flex flex-row md:flex-col items-center md:items-end font-extrabold text-2xl md:text-3xl tracking-widest md:mr-8 mb-4 md:mb-0">
              {bingoColumns.map(col => (
                <div key={col.letter} className={`h-12 md:h-16 mb-0 md:mb-4 ${col.color}`}>{col.letter}</div>
              ))}
            </div>
            {/* Number buttons */}
            <div className="flex flex-col gap-2 md:gap-4">
              {bingoColumns.map((col, colIdx) => (
                <div key={col.letter} className="flex flex-row items-center h-12 md:h-16 flex-wrap md:flex-nowrap">
                  {Array.from({ length: col.range[1] - col.range[0] + 1 }, (_, i) => {
                    const num = col.range[0] + i;
                    const isCalled = calledNumbers.includes(num);
                    return (
                      <button
                        key={num}
                        className={`w-10 md:w-12 h-12 md:h-16 mr-1 md:mr-2 rounded-lg md:rounded-xl font-bold text-lg md:text-2xl shadow-md border-2 transition-all duration-150
                          ${isCalled
                            ? 'bg-gradient-to-br from-red-400 via-yellow-300 to-yellow-400 text-white border-fuchsia-600 scale-105'
                            : 'bg-gradient-to-br from-blue-50 via-white to-green-50 text-blue-700 border-blue-200 hover:scale-105 hover:border-fuchsia-400'}
                        `}
                        disabled
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Number display */}
            <div className="flex items-center justify-center flex-1">
              <div className="relative flex items-center justify-center w-[180px] h-[180px] md:w-[260px] md:h-[260px] bg-gradient-to-br from-fuchsia-100 via-yellow-50 to-green-100 border-4 border-fuchsia-400 rounded-3xl shadow-2xl">
                {showCurrent && currentNumber !== null && (
                  <span
                    style={{
                      fontSize: '8rem',
                      fontWeight: 900,
                      animation: 'moveInFromBottomRight 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
                    }}
                    className={`drop-shadow-lg ${bingoColumns[getColumnIndex(currentNumber)].color}`}
                  >
                    {currentNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Controls below grid and display */}
          <div className="w-full flex md:flex-row items-center justify-center gap-4 px-4 pb-8">
            <div className='flex md:flex-col items-center justify-center w-full gap-4'>
              <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4">
                <button
                  className={`font-semibold py-3 px-12 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-white ${isPlaying ? 'bg-red-500' : 'bg-green-500'}`}
                  type="button"
                  onClick={isPlaying ? stopGame : startGame}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button className=" bg-yellow-500 text-white font-semibold py-3 px-12 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="button" onClick={() => navigate('/play')}>Back</button>
              </div>
              <div className="bg-yellow-50 flex flex-row items-center justify-center w-full max-w-xl p-2 rounded-lg mt-2">
                <input
                  type="text"
                  placeholder='Search'
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCheck(); }}
                />
                <button className="bg-blue-500 text-white rounded-lg p-2 ml-2" onClick={handleCheck}>Check</button>
              </div>
            </div>
            <div className="flex items-center justify-center w-full mt-2">
              <p className="text-fuchsia-700 font-bold text-lg">Price</p>
            </div>
          </div>
        </div>
        {/* Popup for search result */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center">
              {searchResult?.notFound ? (
                <>
                  <p className="text-red-600 text-xl font-bold mb-4">Cartela number not found</p>
                  <button className="mt-4 px-6 py-2 bg-fuchsia-500 text-white rounded-lg font-semibold hover:bg-fuchsia-700 transition" onClick={() => setShowPopup(false)}>Close</button>
                </>
              ) : (
                <>
                  <p className="text-green-700 text-2xl font-bold mb-4">Cartela #{searchResult.cartela.cartelaNumber}</p>
                  <div className="flex flex-col gap-2 w-full">
                    {searchResult.cartela.grid && searchResult.cartela.grid.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex flex-row gap-2 justify-center">
                        {row.map((val, colIdx) => {
                          // Check if value is a number and if it has been called
                          const isNum = typeof val === 'number';
                          const isCalled = isNum && calledNumbers.includes(val);
                          const isLast = isNum && val === lastFoundInCartela;
                          return (
                            <span
                              key={colIdx}
                              className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg border-2
                                ${isNum ? (isCalled ? 'bg-green-400 text-white border-green-600' : 'bg-yellow-300 text-yellow-900 border-yellow-500') : 'bg-green-400 text-gray-700 border-gray-300'}
                                ${isLast ? 'blink ring-4 ring-fuchsia-400' : ''}`}
                            >
                              {val}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 px-6 py-2 bg-fuchsia-500 text-white rounded-lg font-semibold hover:bg-fuchsia-700 transition" onClick={() => setShowPopup(false)}>Close</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Game;
