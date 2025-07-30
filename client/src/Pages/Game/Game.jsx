// import React, { useRef, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// // Define static background colors for BINGO letters
// const bingoColumns = [
//   { letter: 'B', range: [1, 15], color: 'text-blue-600', bg: 'bg-blue-500' },
//   { letter: 'I', range: [16, 30], color: 'text-indigo-500', bg: 'bg-indigo-500' },
//   { letter: 'N', range: [31, 45], color: 'text-fuchsia-700', bg: 'bg-fuchsia-700' },
//   { letter: 'G', range: [46, 60], color: 'text-green-600', bg: 'bg-green-600' },
//   { letter: 'O', range: [61, 75], color: 'text-yellow-500', bg: 'bg-yellow-500' },
// ];

// const getColumnIndex = (num) => {
//   if (num >= 1 && num <= 15) return 0;
//   if (num >= 16 && num <= 30) return 1;
//   if (num >= 31 && num <= 45) return 2;
//   if (num >= 46 && num <= 60) return 3;
//   if (num >= 61 && num <= 75) return 4;
//   return -1;
// };

// // Helper to get bingo prefix for audio file
// function getBingoPrefix(number) {
//   if (number >= 1 && number <= 15) return 'b';
//   if (number >= 16 && number <= 30) return 'i';
//   if (number >= 31 && number <= 45) return 'n';
//   if (number >= 46 && number <= 60) return 'g';
//   if (number >= 61 && number <= 75) return 'o';
//   return '';
// }

// // Helper: Check win conditions for a cartela
// function checkBingoWin(grid, calledNumbers) {
//   if (!Array.isArray(grid) || grid.length !== 5) return false;
//   // 1. Straight line (horizontal or vertical)
//   for (let i = 0; i < 5; i++) {
//     // Horizontal
//     if (grid[i].every((val, j) => (typeof val !== 'number' && i === 2 && j === 2) || (typeof val === 'number' && calledNumbers.includes(val)))) {
//       return true;
//     }
//     // Vertical
//     if ([0,1,2,3,4].every(row => (typeof grid[row][i] !== 'number' && row === 2 && i === 2) || (typeof grid[row][i] === 'number' && calledNumbers.includes(grid[row][i])))) {
//       return true;
//     }
//   }
//   // 2. Diagonals
//   if ([0,1,2,3,4].every(i => (typeof grid[i][i] !== 'number' && i === 2) || (typeof grid[i][i] === 'number' && calledNumbers.includes(grid[i][i])))) {
//     return true;
//   }
//   if ([0,1,2,3,4].every(i => (typeof grid[i][4-i] !== 'number' && i === 2) || (typeof grid[i][4-i] === 'number' && calledNumbers.includes(grid[i][4-i])))) {
//     return true;
//   }
//   // 3. No green marks (except free space) and 15 numbers called
//   let marked = 0;
//   for (let i = 0; i < 5; i++) {
//     for (let j = 0; j < 5; j++) {
//       if (i === 2 && j === 2) continue; // skip free space
//       if (typeof grid[i][j] === 'number' && calledNumbers.includes(grid[i][j])) marked++;
//     }
//   }
//   if (marked === 0 && calledNumbers.length >= 15) {
//     return true;
//   }
//   // 4. Four outer corners
//   const corners = [ [0,0], [0,4], [4,0], [4,4] ];
//   if (corners.every(([i,j]) => typeof grid[i][j] === 'number' && calledNumbers.includes(grid[i][j]))) {
//     return true;
//   }
//   // 5. Four inner corners (surrounding free space)
//   const inner = [ [1,1], [1,3], [3,1], [3,3] ];
//   if (inner.every(([i,j]) => typeof grid[i][j] === 'number' && calledNumbers.includes(grid[i][j]))) {
//     return true;
//   }
//   return false;
// }

// const Game = () => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [calledNumbers, setCalledNumbers] = useState([]);
//   const [currentNumber, setCurrentNumber] = useState(null);
//   const { currentUser } = useSelector((state) => state.user);
//   const [price, setPrice] = useState(null);
//   const [recent, setRecent] = useState(null);
//   const [prizeInfo, setPrizeInfo] = useState(null);
//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null); // NEW: for initial timeout
//   const [showCurrent, setShowCurrent] = useState(false);
//     const navigate = useNavigate();
//   const [searchValue, setSearchValue] = useState('');
//   const [searchResult, setSearchResult] = useState(null); // null | { notFound: true } | { cartela: {...} }
//   const [showPopup, setShowPopup] = useState(false);
//   // Find the most recent called number that is present in the searched cartela
//   let lastFoundInCartela = null;
//   if (searchResult && searchResult.cartela && searchResult.cartela.grid) {
//     // Flatten the grid to a list of numbers
//     const cartelaNumbers = searchResult.cartela.grid.flat().filter(v => typeof v === 'number');
//     // Find the last called number that is in the cartela
//     for (let i = calledNumbers.length - 1; i >= 0; i--) {
//       if (cartelaNumbers.includes(calledNumbers[i])) {
//         lastFoundInCartela = calledNumbers[i];
//         break;
//       }
//     }
//   }

//   // Helper to get a random number not in the provided list
//   const getRandomNumberFromList = (list) => {
//     const available = [];
//     for (let i = 1; i <= 75; i++) {
//       if (!list.includes(i)) available.push(i);
//     }
//     if (available.length === 0) return null;
//     return available[Math.floor(Math.random() * available.length)];
//   };

//   const playStartAudio = (isResume = false) => {
//     const audio = new window.Audio(isResume ? '/images/Audio/bingo/c.mp3' : '/images/Audio/bingo/p.mp3');
//     audio.play().catch(() => {});
//   };

//   const playStopAudio = () => {
//     const audio = new window.Audio('/images/Audio/bingo/s.mp3');
//     audio.play().catch(() => {});
//   };

//   const startGame = async () => {
//     if (isPlaying) return;

//     // Only store allprice if not already stored
//     if (
//       !allPriceStored &&
//       price && recent &&
//       price.createdBy === currentUser._id &&
//       recent.createdBy === currentUser._id &&
//       prizeInfo &&
//       recent.totalselectedcartela > 3
//     ) {
//       try {
//         const res = await fetch('/api/price/allprice', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             createdBy: currentUser._id,
//             Total: prizeInfo.total.toString(),
//             WinnerPrize: prizeInfo.winnerPrize.toString(),
//             HostingRent: prizeInfo.rentAmount.toString(),
//           })
//         });
//         const data = await res.json();
//         if (res.ok && data.success) {
//           setAllPriceStored(true);
//         }
//       } catch (err) {
//         // Optionally handle error
//       }
//     }

//     // Clear any previous intervals/timeouts
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }

//     // Only reset if all numbers have been called (game over) or it's the very first play
//     if (calledNumbers.length === 75 || (calledNumbers.length === 0 && currentNumber === null)) {
//       setCalledNumbers([]);
//       setCurrentNumber(null);
//       playStartAudio(false); // Fresh start
//     } else {
//       playStartAudio(true); // Resume
//     }

//     setIsPlaying(true);

//     // Wait 3 seconds before generating the next number
//     timeoutRef.current = setTimeout(() => {
//       setCalledNumbers(prev => {
//         const next = getRandomNumberFromList(prev);
//         if (next !== null) {
//           setCurrentNumber(next);
//           return [...prev, next];
//         }
//         return prev;
//       });
//       intervalRef.current = setInterval(() => {
//         setCalledNumbers(prev => {
//           const num = getRandomNumberFromList(prev);
//           if (num === null) {
//             stopGame();
//             return prev;
//           }
//           setCurrentNumber(num);
//           return [...prev, num];
//         });
//       }, 5000);
//     }, 3000); // 3 seconds delay
//   };

//   const stopGame = () => {
//     playStopAudio();
//     setIsPlaying(false);
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   React.useEffect(() => {
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, []);

//   React.useEffect(() => {
//     if (currentNumber !== null) {
//       setShowCurrent(true);
//       const timeout = setTimeout(() => setShowCurrent(false), 2500);
//       return () => clearTimeout(timeout);
//     }
//   }, [currentNumber]);

//   // Play audio when currentNumber changes
  

//   useEffect(() => {
//     if (currentNumber !== null) {
//       const prefix = getBingoPrefix(currentNumber);
//       if (prefix) {
//         const audioPath = `/images/Audio/bingo/${prefix}${currentNumber}.mp3`;
//         const audio = new window.Audio(audioPath);
//         audio.play().catch(() => {}); // ignore play errors
//       }
//     }
//   }, [currentNumber]);

//   useEffect(() => {
//     if (!currentUser || !currentUser._id) return;
//     // Fetch price
//     fetch('/api/price/me')
//       .then(res => res.json())
//       .then(data => {
//         if (data.success && data.data && data.data.createdBy === currentUser._id) {
//           setPrice(data.data);
//         }
//       });
//     // Fetch recent selected cartelas
//     fetch('/api/selectedcartelas/recent')
//       .then(res => res.json())
//       .then(data => {
//         if (data.success && data.data && data.data.createdBy === currentUser._id) {
//           setRecent(data.data);
//         }
//       });
//   }, [currentUser]);

//   useEffect(() => {
//     if (price && recent) {
//       // Convert string fields to numbers
//       const amount = Number(price.amount);
//       const rentpercent = Number(price.rentpercent) / 100;
//       const totalselectedcartela = Number(recent.totalselectedcartela);
//       const total = amount * totalselectedcartela;
//       const rentAmount = amount * rentpercent * totalselectedcartela;
//       const winnerPrize = total - rentAmount 
//       setPrizeInfo({ total, rentAmount, winnerPrize });
//     }
//   }, [price, recent]);

//   const handleCheck = async () => {
//     setSearchResult(null);
//     setShowPopup(false);
//     if (!searchValue.trim()) return;
//     try {
//       const res = await fetch('/api/selectedcartelas/recent');
//       const data = await res.json();
//       if (!data.success || !data.data) {
//         setSearchResult({ notFound: true });
//         setShowPopup(true);
//         return;
//       }
//       const found = data.data.cartelas.find(
//         c => String(c.cartelaNumber) === String(searchValue.trim())
//       );
//       if (!found) {
//         setSearchResult({ notFound: true });
//         setShowPopup(true);
//         return;
//       }
//       setSearchResult({ cartela: found });
//       setShowPopup(true);
//     } catch (err) {
//       setSearchResult({ notFound: true });
//       setShowPopup(true);
//     }
//   };

//   // Animation CSS
//   const animationStyle = `
//   @keyframes moveInFromBottomRight {
//     0% {
//       opacity: 0;
//       transform: translate(120px, 120px) scale(0.2);
//     }
//     60% {
//       opacity: 1;
//       transform: translate(-10px, -10px) scale(1.1);
//     }
//     100% {
//       opacity: 1;
//       transform: translate(0, 0) scale(1);
//     }
//   }
//   @keyframes blink {
//     0%, 100% { opacity: 1; }
//     50% { opacity: 0.2; }
//   }
//   .blink {
//     animation: blink 1s linear infinite;
//   }
//   `;

//   const [allPriceStored, setAllPriceStored] = useState(false);
//   const [winAudioPlayed, setWinAudioPlayed] = useState(false);

//   // Reset allPriceStored if game is reset
//   useEffect(() => {
//     if (calledNumbers.length === 0 && !isPlaying) {
//       setAllPriceStored(false);
//     }
//   }, [calledNumbers.length, isPlaying]);

//   useEffect(() => {
//     // Reset win audio flag when popup closes
//     if (!showPopup) setWinAudioPlayed(false);
//   }, [showPopup]);

//   return (
//     <>
//       <style>{animationStyle}</style>
//       <div className='min-h-screen bg-green-800 flex flex-col items-center justify-start '>
//         <div className="flex flex-col  rounded-3xl shadow-xl  ">
//           {/* BINGO grid and number list + number display */}
//           <div className="flex flex-col md:flex-row w-full md:w-auto   bg-gray-800  rounded-md justify-center items-center mx-2 p-2">
//             {/* BINGO letters as buttons */}
//             <div className="flex flex-row md:flex-col font-extrabold text-2xl md:text-3xl tracking-widest h-full  w-full md:w-auto md:items-start p-2 gap-2">
//               {bingoColumns.map(col => (
//                 <button
//                   key={col.letter}
//                   className={`h-12 md:h-20 w-12 md:w-16 mb-0  rounded-md text-white shadow ${col.bg}`}
//                   disabled
//                 >
//                   {col.letter}
//                 </button>
//               ))}
//             </div>
//             {/* Number buttons */}
//             <div className="flex flex-col gap-2 md:gap-6 h-full w-full justify-center items-center p-2">
//               {bingoColumns.map((col, colIdx) => (
//                 <div key={col.letter} className="flex flex-row items-center h-12 md:h-16 w-full flex-wrap md:flex-nowrap justify-center">
//                   {Array.from({ length: col.range[1] - col.range[0] + 1 }, (_, i) => {
//                     const num = col.range[0] + i;
//                     const isCalled = calledNumbers.includes(num);
//                     return (
//                       <button
//                         key={num}
//                         className={`h-12 md:h-[5.5rem] w-12 md:w-[4.75rem] mr-1 md:mr-2 rounded-lg md:rounded-md font-bold text-lg md:text-3xl shadow-md border-2 transition-all duration-150
//                           ${isCalled
//                             ? `${col.bg} text-white border-fuchsia-600 scale-105`
//                             : 'bg-gradient-to-br from-blue-50 via-white to-green-50 text-blue-700 border-blue-200 hover:scale-105 hover:border-fuchsia-400'}
//                         `}
//                         disabled
//                       >
//                         {num}
//                       </button>
//                     );
//                   })}
//                 </div>
//               ))}
//             </div>
//             {/* Number display (removed from grid) */}
//           </div>
         
//         </div>
//          {/* Controls below grid and display */}
//           <div className='flex flex-col md:flex-row items-center justify-center w-full md:w-[90%] lg:w-[80%]  gap-16 py-2 px-10 bg-green-600 md:mt-10  rounded-lg mx-auto shadow-lg'>
//               <div className='flex-col  flex-1 w-full max-w-md mx-auto bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4  border-2 border-fuchsia-300'>
//                 <div className="flex flex-col md:flex-row items-center justify-center w-full gap-2">
//                   <button className="flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
//                     type="button" onClick={() => navigate('/play')}>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
//                     End 
//                   </button>
                 
//                   <button
//                     className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-white ${isPlaying ? 'bg-red-500' : 'bg-green-500'}`}
//                     type="button"
//                     onClick={isPlaying ? stopGame : startGame}
//                   >
//                     {isPlaying ? (
//                       <>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                         Stop
//                       </>
//                     ) : (
//                       <>
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
//                         Play
//                       </>
//                     )}
//                   </button>
//                    <button
//   className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
//   type="button"
//   onClick={() => {
//     const audio = new Audio('/images/Audio/bingo/sh.mp3');
//     audio.play();
//   }}
// >
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582l3.65-4.285A1 1 0 0110 5v14a1 1 0 01-1.768.64l-3.65-4.285H4v5h16V4H4z" />
//   </svg>
//   Shuffle
// </button>
                  
                 
//                 </div>
//                 <div className="bg-white flex flex-row items-center justify-center w-full max-w-md p-1 rounded-lg mt-2 shadow border border-yellow-200">
//                   <input
//                     type="text"
//                     placeholder='Search cartela number...'
//                     className="border-none outline-none rounded-lg h-9 p-2 w-full max-w-md text-fuchsia-800 placeholder-fuchsia-400 bg-transparent focus:ring-2 focus:ring-fuchsia-300 text-sm"
//                     value={searchValue}
//                     onChange={e => setSearchValue(e.target.value)}
//                     onKeyDown={e => { if (e.key === 'Enter') handleCheck(); }}
//                   />
//                   <button className="flex items-center gap-1 bg-blue-500 text-white rounded-lg p-2 ml-2 shadow hover:bg-blue-600 transition text-xs h-8" onClick={handleCheck}>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
//                     Check
//                   </button>
//                 </div>
//               </div>
            
//             <div className="flex flex-1 flex-col items-center justify-center w-full mt-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300">
//               <p className="text-xl mb-2 tracking-wide drop-shadow font-extrabold flex items-end gap-2">
//                 <span className="text-fuchsia-800">progress</span>
//                 <span className="text-green-700 text-3xl font-black">{calledNumbers.length}</span>
//                 <span className="text-fuchsia-400 text-3xl font-black">/</span>
//                 <span className="text-yellow-500 text-3xl font-black">75</span>
//               </p>
//               <div className="w-full max-w-md h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-fuchsia-200">
//                 <div
//                   className="h-full bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 transition-all duration-500"
//                   style={{ width: `${(calledNumbers.length / 75) * 100}%` }}
//                 ></div>
//               </div>
//               <span className="mt-1 text-sm text-fuchsia-700 font-semibold">{Math.round((calledNumbers.length / 75) * 100)}%</span>
//             </div>

//              <div className="flex  flex-1 flex-col items-center justify-center w-full mt-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300 gap-4">
//               <div>
//   <p className="text-2xl font-bold text-fuchsia-700">Winner’s Prize</p>
// </div>
// {prizeInfo && (
//   <div className="text-3xl font-extrabold text-green-600">
//     {prizeInfo.winnerPrize.toFixed(2)} Birr
//   </div>
// )}
//             </div>
//             </div> 

"use client"

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

// Define static background colors for BINGO letters
const bingoColumns = [
  { letter: "B", range: [1, 15], color: "text-blue-600", bg: "bg-blue-500" },
  { letter: "I", range: [16, 30], color: "text-indigo-500", bg: "bg-indigo-500" },
  { letter: "N", range: [31, 45], color: "text-fuchsia-700", bg: "bg-fuchsia-700" },
  { letter: "G", range: [46, 60], color: "text-green-600", bg: "bg-green-600" },
  { letter: "O", range: [61, 75], color: "text-yellow-500", bg: "bg-yellow-500" },
]

const getColumnIndex = (num) => {
  if (num >= 1 && num <= 15) return 0
  if (num >= 16 && num <= 30) return 1
  if (num >= 31 && num <= 45) return 2
  if (num >= 46 && num <= 60) return 3
  if (num >= 61 && num <= 75) return 4
  return -1
}

// Helper to get bingo prefix for audio file
function getBingoPrefix(number) {
  if (number >= 1 && number <= 15) return "b"
  if (number >= 16 && number <= 30) return "i"
  if (number >= 31 && number <= 45) return "n"
  if (number >= 46 && number <= 60) return "g"
  if (number >= 61 && number <= 75) return "o"
  return ""
}

// Helper: Check win conditions for a cartela
function checkBingoWin(grid, calledNumbers) {
  if (!Array.isArray(grid) || grid.length !== 5) return false

  // 1. Straight line (horizontal or vertical)
  for (let i = 0; i < 5; i++) {
    // Horizontal
    if (
      grid[i].every(
        (val, j) =>
          (typeof val !== "number" && i === 2 && j === 2) || (typeof val === "number" && calledNumbers.includes(val)),
      )
    ) {
      return true
    }
    // Vertical
    if (
      [0, 1, 2, 3, 4].every(
        (row) =>
          (typeof grid[row][i] !== "number" && row === 2 && i === 2) ||
          (typeof grid[row][i] === "number" && calledNumbers.includes(grid[row][i])),
      )
    ) {
      return true
    }
  }

  // 2. Diagonals
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (typeof grid[i][i] !== "number" && i === 2) ||
        (typeof grid[i][i] === "number" && calledNumbers.includes(grid[i][i])),
    )
  ) {
    return true
  }
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (typeof grid[i][4 - i] !== "number" && i === 2) ||
        (typeof grid[i][4 - i] === "number" && calledNumbers.includes(grid[i][4 - i])),
    )
  ) {
    return true
  }

  // 3. No green marks (except free space) and 15 numbers called
  let marked = 0
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 2 && j === 2) continue // skip free space
      if (typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j])) marked++
    }
  }
  if (marked === 0 && calledNumbers.length >= 15) {
    return true
  }

  // 4. Four outer corners
  const corners = [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
  ]
  if (corners.every(([i, j]) => typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j]))) {
    return true
  }

  // 5. Four inner corners (surrounding free space)
  const inner = [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ]
  if (inner.every(([i, j]) => typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j]))) {
    return true
  }

  return false
}

const Game = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [calledNumbers, setCalledNumbers] = useState([])
  const [currentNumber, setCurrentNumber] = useState(null)
  const { currentUser } = useSelector((state) => state.user)
  const [price, setPrice] = useState(null)
  const [recent, setRecent] = useState(null)
  const [prizeInfo, setPrizeInfo] = useState(null)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [allPriceStored, setAllPriceStored] = useState(false)
  const [winAudioPlayed, setWinAudioPlayed] = useState(false)

  // Audio refs for better performance and immediate playback
  const audioRefs = useRef({})
  const controlAudioRefs = useRef({})

  // Preload all audio files for instant playback
  useEffect(() => {
    // Preload number audio files
    for (let i = 1; i <= 75; i++) {
      const prefix = getBingoPrefix(i)
      if (prefix) {
        const audioPath = `/images/Audio/bingo/${prefix}${i}.mp3`
        audioRefs.current[i] = new Audio(audioPath)
        audioRefs.current[i].preload = "auto"
      }
    }

    // Preload control audio files
    controlAudioRefs.current.play = new Audio("/images/Audio/bingo/p.mp3")
    controlAudioRefs.current.continue = new Audio("/images/Audio/bingo/c.mp3")
    controlAudioRefs.current.stop = new Audio("/images/Audio/bingo/s.mp3")
    controlAudioRefs.current.shuffle = new Audio("/images/Audio/bingo/sh.mp3")

    // Set preload for control audios
    Object.values(controlAudioRefs.current).forEach((audio) => {
      audio.preload = "auto"
    })

    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      })
      Object.values(controlAudioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      })
    }
  }, [])

  // Find the most recent called number that is present in the searched cartela
  let lastFoundInCartela = null
  if (searchResult && searchResult.cartela && searchResult.cartela.grid) {
    const cartelaNumbers = searchResult.cartela.grid.flat().filter((v) => typeof v === "number")
    for (let i = calledNumbers.length - 1; i >= 0; i--) {
      if (cartelaNumbers.includes(calledNumbers[i])) {
        lastFoundInCartela = calledNumbers[i]
        break
      }
    }
  }

  // Helper to get a random number not in the provided list
  const getRandomNumberFromList = (list) => {
    const available = []
    for (let i = 1; i <= 75; i++) {
      if (!list.includes(i)) available.push(i)
    }
    if (available.length === 0) return null
    return available[Math.floor(Math.random() * available.length)]
  }

  // Optimized audio play functions with immediate playback
  const playControlAudio = (type) => {
    const audio = controlAudioRefs.current[type]
    if (audio) {
      audio.currentTime = 0 // Reset to start for immediate replay
      audio.play().catch(console.warn)
    }
  }

  const playNumberAudio = (number) => {
    const audio = audioRefs.current[number]
    if (audio) {
      audio.currentTime = 0 // Reset to start for immediate replay
      audio.play().catch(console.warn)
    }
  }

  // Generate next number with immediate audio
  const generateNextNumber = () => {
    setCalledNumbers((prev) => {
      const nextNumber = getRandomNumberFromList(prev)
      if (nextNumber !== null) {
        // Play audio immediately when number is generated
        playNumberAudio(nextNumber)
        setCurrentNumber(nextNumber)
        return [...prev, nextNumber]
      }
      return prev
    })
  }

  const startGame = async () => {
    if (isPlaying) return

    // Store price logic (unchanged)
    if (
      !allPriceStored &&
      price &&
      recent &&
      price.createdBy === currentUser._id &&
      recent.createdBy === currentUser._id &&
      prizeInfo &&
      recent.totalselectedcartela > 3
    ) {
      try {
        const res = await fetch("/api/price/allprice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            createdBy: currentUser._id,
            Total: prizeInfo.total.toString(),
            WinnerPrize: prizeInfo.winnerPrize.toString(),
            HostingRent: prizeInfo.rentAmount.toString(),
          }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setAllPriceStored(true)
        }
      } catch (err) {
        console.warn("Error storing price:", err)
      }
    }

    // Clear any previous intervals/timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Determine if it's a fresh start or resume
    const isResume = calledNumbers.length > 0 && currentNumber !== null

    // Play control audio immediately
    playControlAudio(isResume ? "continue" : "play")

    setIsPlaying(true)

    // Only reset if all numbers have been called or it's the very first play
    if (calledNumbers.length === 75 || (calledNumbers.length === 0 && currentNumber === null)) {
      setCalledNumbers([])
      setCurrentNumber(null)
    }

    // Start generating numbers with immediate first number
    timeoutRef.current = setTimeout(() => {
      generateNextNumber()

      // Set up interval for subsequent numbers
      intervalRef.current = setInterval(() => {
        setCalledNumbers((prev) => {
          const num = getRandomNumberFromList(prev)
          if (num === null) {
            stopGame()
            return prev
          }
          // Play audio immediately when number is generated
          playNumberAudio(num)
          setCurrentNumber(num)
          return [...prev, num]
        })
      }, 5000)
    }, 3000)
  }

  const stopGame = () => {
    // Play stop audio immediately
    playControlAudio("stop")

    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleShuffle = () => {
    // Play shuffle audio immediately
    playControlAudio("shuffle")
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Show current number animation
  useEffect(() => {
    if (currentNumber !== null) {
      setShowCurrent(true)
      const timeout = setTimeout(() => setShowCurrent(false), 2500)
      return () => clearTimeout(timeout)
    }
  }, [currentNumber])

  // Fetch price and recent data
  useEffect(() => {
    if (!currentUser || !currentUser._id) return

    fetch("/api/price/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.createdBy === currentUser._id) {
          setPrice(data.data)
        }
      })

    fetch("/api/selectedcartelas/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.createdBy === currentUser._id) {
          setRecent(data.data)
        }
      })
  }, [currentUser])

  // Calculate prize info
  useEffect(() => {
    if (price && recent) {
      const amount = Number(price.amount)
      const rentpercent = Number(price.rentpercent) / 100
      const totalselectedcartela = Number(recent.totalselectedcartela)
      const total = amount * totalselectedcartela
      const rentAmount = amount * rentpercent * totalselectedcartela
      const winnerPrize = total - rentAmount
      setPrizeInfo({ total, rentAmount, winnerPrize })
    }
  }, [price, recent])

  // Search functionality
  const handleCheck = async () => {
    setSearchResult(null)
    setShowPopup(false)
    if (!searchValue.trim()) return

    try {
      const res = await fetch("/api/selectedcartelas/recent")
      const data = await res.json()
      if (!data.success || !data.data) {
        setSearchResult({ notFound: true })
        setShowPopup(true)
        return
      }

      const found = data.data.cartelas.find((c) => String(c.cartelaNumber) === String(searchValue.trim()))
      if (!found) {
        setSearchResult({ notFound: true })
        setShowPopup(true)
        return
      }

      setSearchResult({ cartela: found })
      setShowPopup(true)
    } catch (err) {
      setSearchResult({ notFound: true })
      setShowPopup(true)
    }
  }

  // Reset states when needed
  useEffect(() => {
    if (calledNumbers.length === 0 && !isPlaying) {
      setAllPriceStored(false)
    }
  }, [calledNumbers.length, isPlaying])

  useEffect(() => {
    if (!showPopup) setWinAudioPlayed(false)
  }, [showPopup])

  // Animation CSS
  const animationStyle = `
    @keyframes moveInFromBottomRight {
      0% { opacity: 0; transform: translate(120px, 120px) scale(0.2); }
      60% { opacity: 1; transform: translate(-10px, -10px) scale(1.1); }
      100% { opacity: 1; transform: translate(0, 0) scale(1); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    .blink { animation: blink 1s linear infinite; }
  `

  return (
    <>
      <style>{animationStyle}</style>
      <div className="min-h-screen bg-green-800 flex flex-col items-center justify-start">
        <div className="flex flex-col rounded-3xl shadow-xl">
          {/* BINGO grid and number list + number display */}
          <div className="flex flex-col md:flex-row w-full md:w-auto bg-gray-800 rounded-md justify-center items-center mx-2 p-2">
            {/* BINGO letters as buttons */}
            <div className="flex flex-row md:flex-col font-extrabold text-2xl md:text-3xl tracking-widest h-full w-full md:w-auto md:items-start p-2 gap-2">
              {bingoColumns.map((col) => (
                <button
                  key={col.letter}
                  className={`h-12 md:h-20 w-12 md:w-16 mb-0 rounded-md text-white shadow ${col.bg}`}
                  disabled
                >
                  {col.letter}
                </button>
              ))}
            </div>

            {/* Number buttons */}
            <div className="flex flex-col gap-2 md:gap-6 h-full w-full justify-center items-center p-2">
              {bingoColumns.map((col, colIdx) => (
                <div
                  key={col.letter}
                  className="flex flex-row items-center h-12 md:h-16 w-full flex-wrap md:flex-nowrap justify-center"
                >
                  {Array.from({ length: col.range[1] - col.range[0] + 1 }, (_, i) => {
                    const num = col.range[0] + i
                    const isCalled = calledNumbers.includes(num)
                    return (
                      <button
                        key={num}
                        className={`h-12 md:h-[5.5rem] w-12 md:w-[4.75rem] mr-1 md:mr-2 rounded-lg md:rounded-md font-bold text-lg md:text-3xl shadow-md border-2 transition-all duration-150 ${
                          isCalled
                            ? `${col.bg} text-white border-fuchsia-600 scale-105`
                            : "bg-gradient-to-br from-blue-50 via-white to-green-50 text-blue-700 border-blue-200 hover:scale-105 hover:border-fuchsia-400"
                        }`}
                        disabled
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls below grid and display */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full md:w-[90%] lg:w-[80%] gap-16 py-2 px-10 bg-green-600 md:mt-10 rounded-lg mx-auto shadow-lg">
          <div className="flex-col flex-1 w-full max-w-md mx-auto bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300">
            <div className="flex flex-col md:flex-row items-center justify-center w-full gap-2">
              <button
                className="flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                type="button"
                onClick={() => navigate("/play")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                End
              </button>

              <button
                className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-white ${
                  isPlaying ? "bg-red-500" : "bg-green-500"
                }`}
                type="button"
                onClick={isPlaying ? stopGame : startGame}
              >
                {isPlaying ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Play
                  </>
                )}
              </button>

              <button
                className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                type="button"
                onClick={handleShuffle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582l3.65-4.285A1 1 0 0110 5v14a1 1 0 01-1.768.64l-3.65-4.285H4v5h16V4H4z"
                  />
                </svg>
                Shuffle
              </button>
            </div>

            <div className="bg-white flex flex-row items-center justify-center w-full max-w-md p-1 rounded-lg mt-2 shadow border border-yellow-200">
              <input
                type="text"
                placeholder="Search cartela number..."
                className="border-none outline-none rounded-lg h-9 p-2 w-full max-w-md text-fuchsia-800 placeholder-fuchsia-400 bg-transparent focus:ring-2 focus:ring-fuchsia-300 text-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheck()
                }}
              />
              <button
                className="flex items-center gap-1 bg-blue-500 text-white rounded-lg p-2 ml-2 shadow hover:bg-blue-600 transition text-xs h-8"
                onClick={handleCheck}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                  />
                </svg>
                Check
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center w-full mt-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300">
            <p className="text-xl mb-2 tracking-wide drop-shadow font-extrabold flex items-end gap-2">
              <span className="text-fuchsia-800">progress</span>
              <span className="text-green-700 text-3xl font-black">{calledNumbers.length}</span>
              <span className="text-fuchsia-400 text-3xl font-black">/</span>
              <span className="text-yellow-500 text-3xl font-black">75</span>
            </p>
            <div className="w-full max-w-md h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-fuchsia-200">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 transition-all duration-500"
                style={{ width: `${(calledNumbers.length / 75) * 100}%` }}
              ></div>
            </div>
            <span className="mt-1 text-sm text-fuchsia-700 font-semibold">
              {Math.round((calledNumbers.length / 75) * 100)}%
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center w-full mt-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300 gap-4">
            <div>
              <p className="text-2xl font-bold text-fuchsia-700">{"Winner's Prize"}</p>
            </div>
            {prizeInfo && (
              <div className="text-3xl font-extrabold text-green-600">{prizeInfo.winnerPrize.toFixed(2)} Birr</div>
            )}
          </div>
        </div>

        {/* Current Number Display */}
        {showCurrent && currentNumber !== null && calledNumbers.length > 0 && calledNumbers[calledNumbers.length - 1] === currentNumber && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className={`relative flex items-center justify-center w-[180px] h-[180px] md:w-[260px] md:h-[260px] border-4 border-fuchsia-400 rounded-full shadow-2xl ${bingoColumns[getColumnIndex(currentNumber)].bg} pointer-events-auto`}>
              <span
                style={{
                  fontSize: '8rem',
                  fontWeight: 900,
                  animation: 'moveInFromBottomRight 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
                className="drop-shadow-lg text-white"
              >
                {currentNumber}
              </span>
            </div>
          </div>
        )}
        {/* {showCurrent && currentNumber && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div
              className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white text-8xl font-black rounded-3xl p-8 shadow-2xl border-4 border-white blink"
              style={{
                animation: "moveInFromBottomRight 0.8s ease-out forwards, blink 1s linear infinite",
              }}
            >
              {getBingoPrefix(currentNumber).toUpperCase()}
              {currentNumber}
            </div>
          </div>
        )} */}

        {/* Search Result Popup */}
         {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center">
              {searchResult?.notFound ? (
                <>
                  <p className="text-red-600 text-xl font-bold mb-4">Cartela number not found</p>
                  {/* Play try audio if not found and not already played */}
                  {!winAudioPlayed && (() => { new window.Audio('/images/Audio/bingo/n.mp3').play().catch(()=>{}); setWinAudioPlayed(true); })()}
                  <button className="mt-4 px-6 py-2 bg-fuchsia-500 text-white rounded-lg font-semibold hover:bg-fuchsia-700 transition" onClick={() => setShowPopup(false)}>Close</button>
                </>
              ) : (
                (() => {
                  const grid = searchResult.cartela.grid;
                  const isWinner = checkBingoWin(grid, calledNumbers);
                  // Play audio only once per popup open
                  if (!winAudioPlayed) {
                    const audioPath = isWinner ? '/images/Audio/bingo/w.mp3' : '/images/Audio/bingo/t.mp3';
                    new window.Audio(audioPath).play().catch(()=>{});
                    setWinAudioPlayed(true);
                  }
                  return <>
                    <p className="text-green-700 text-2xl font-bold mb-4">Cartela #{searchResult.cartela.cartelaNumber}</p>
                    {isWinner && <p className="text-3xl font-extrabold text-green-600 mb-2">Winner!</p>}
                    <div className="flex flex-col gap-2 w-full">
                      {grid && grid.map((row, rowIdx) => (
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
                  </>;
                })()
              )}
            </div>
          </div>
        )}
        {/* {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Search Result</h3>
                <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {searchResult?.notFound ? (
                <p className="text-red-600">Cartela not found!</p>
              ) : searchResult?.cartela ? (
                <div>
                  <p className="mb-2">
                    <strong>Cartela #{searchResult.cartela.cartelaNumber}</strong>
                  </p>
                  {lastFoundInCartela && (
                    <p className="text-green-600 mb-2">
                      Last called number in this cartela:{" "}
                      <strong>
                        {getBingoPrefix(lastFoundInCartela).toUpperCase()}
                        {lastFoundInCartela}
                      </strong>
                    </p>
                  )}
                  {checkBingoWin(searchResult.cartela.grid, calledNumbers) && (
                    <p className="text-red-600 font-bold text-xl">🎉 BINGO! 🎉</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )} */}
      </div>
    </>
  )
}

export default Game

       

