
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
        (val, j) => (val === "FREE" && i === 2 && j === 2) || (typeof val === "number" && calledNumbers.includes(val)),
      )
    ) {
      return true
    }
    // Vertical
    if (
      [0, 1, 2, 3, 4].every((rowIdx) => {
        const cellValue = grid[rowIdx][i]
        return (
          (cellValue === "FREE" && rowIdx === 2 && i === 2) ||
          (typeof cellValue === "number" && calledNumbers.includes(cellValue))
        )
      })
    ) {
      return true
    }
  }
  // 2. Diagonals
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (grid[i][i] === "FREE" && i === 2) || (typeof grid[i][i] === "number" && calledNumbers.includes(grid[i][i])),
    )
  ) {
    return true
  }
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (grid[i][4 - i] === "FREE" && i === 2) ||
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

// MODIFIED: getWinningPattern now returns an array of all winning patterns
function getWinningPattern(grid, calledNumbers) {
  if (!Array.isArray(grid) || grid.length !== 5) return []
  const foundPatterns = []

  // Check horizontal lines
  for (let i = 0; i < 5; i++) {
    if (
      grid[i].every(
        (val, j) => (val === "FREE" && i === 2 && j === 2) || (typeof val === "number" && calledNumbers.includes(val)),
      )
    ) {
      foundPatterns.push({ type: "horizontal", index: i })
    }
  }
  // Check vertical lines
  for (let i = 0; i < 5; i++) {
    if (
      [0, 1, 2, 3, 4].every((rowIdx) => {
        const cellValue = grid[rowIdx][i]
        return (
          (cellValue === "FREE" && rowIdx === 2 && i === 2) ||
          (typeof cellValue === "number" && calledNumbers.includes(cellValue))
        )
      })
    ) {
      foundPatterns.push({ type: "vertical", index: i })
    }
  }
  // Check main diagonal (top-left to bottom-right)
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (grid[i][i] === "FREE" && i === 2) || (typeof grid[i][i] === "number" && calledNumbers.includes(grid[i][i])),
    )
  ) {
    foundPatterns.push({ type: "diagonal", direction: "main" })
  }
  // Check anti-diagonal (top-right to bottom-left)
  if (
    [0, 1, 2, 3, 4].every(
      (i) =>
        (grid[i][4 - i] === "FREE" && i === 2) ||
        (typeof grid[i][4 - i] === "number" && calledNumbers.includes(grid[i][4 - i])),
    )
  ) {
    foundPatterns.push({ type: "diagonal", direction: "anti" })
  }
  // Check four outer corners
  const corners = [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
  ]
  if (corners.every(([i, j]) => typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j]))) {
    foundPatterns.push({ type: "corners", pattern: "outer" })
  }
  // Check four inner corners
  const inner = [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ]
  if (inner.every(([i, j]) => typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j]))) {
    foundPatterns.push({ type: "corners", pattern: "inner" })
  }
  // Check no green marks pattern
  let marked = 0
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 2 && j === 2) continue
      if (typeof grid[i][j] === "number" && calledNumbers.includes(grid[i][j])) marked++
    }
  }
  if (marked === 0 && calledNumbers.length >= 15) {
    foundPatterns.push({ type: "nomarks" })
  }
  return foundPatterns
}

// MODIFIED: isCellInWinningPattern now checks against an array of patterns
function isCellInWinningPattern(rowIdx, colIdx, allWinningPatterns) {
  if (!allWinningPatterns || allWinningPatterns.length === 0) return false
  for (const pattern of allWinningPatterns) {
    switch (pattern.type) {
      case "horizontal":
        if (rowIdx === pattern.index) return true
        break
      case "vertical":
        if (colIdx === pattern.index) return true
        break
      case "diagonal":
        if (pattern.direction === "main" && rowIdx === colIdx) return true
        if (pattern.direction === "anti" && rowIdx === 4 - colIdx) return true
        break
      case "corners":
        if (pattern.pattern === "outer") {
          if (
            (rowIdx === 0 && colIdx === 0) ||
            (rowIdx === 0 && colIdx === 4) ||
            (rowIdx === 4 && colIdx === 0) ||
            (rowIdx === 4 && colIdx === 4)
          )
            return true
        } else if (pattern.pattern === "inner") {
          if (
            (rowIdx === 1 && colIdx === 1) ||
            (rowIdx === 1 && colIdx === 3) ||
            (rowIdx === 3 && colIdx === 1) ||
            (rowIdx === 3 && colIdx === 3)
          )
            return true
        }
        break
      case "nomarks":
        // Only the free space is part of the 'nomarks' pattern visually
        if (rowIdx === 2 && colIdx === 2) return true
        break
    }
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
  const [gameSpeed, setGameSpeed] = useState(5) // Default 5 seconds
  // Tracks only non-winning cartelas that have been checked and should be locked
  const [lockedNonWinners, setLockedNonWinners] = useState({}) // { [cartelaNumber]: true }

  // CRITICAL FIX: Use refs to track the current state for immediate access
  const calledNumbersRef = useRef([])
  const availableNumbersRef = useRef([])
  // Audio refs for immediate playback - CRITICAL FOR ZERO DELAY
  const audioRefs = useRef({})
  const controlAudioRefs = useRef({})

  // SEPARATE LOADING STATES - This is the key fix!
  const [controlAudioLoaded, setControlAudioLoaded] = useState(false) // Only for control audios
  const [allAudioLoaded, setAllAudioLoaded] = useState(false) // For all audios (boolean)
  const [audioLoadingProgress, setAudioLoadingProgress] = useState(0) // For progress bar (0-100)

  // Initialize available numbers pool
  useEffect(() => {
    availableNumbersRef.current = Array.from({ length: 75 }, (_, i) => i + 1)
  }, [])

  // Keep refs in sync with state
  useEffect(() => {
    calledNumbersRef.current = calledNumbers
    // Update available numbers by removing called numbers
    availableNumbersRef.current = Array.from({ length: 75 }, (_, i) => i + 1).filter(
      (num) => !calledNumbers.includes(num),
    )
  }, [calledNumbers])

  // Service Worker Registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, []) // Run once on mount

  // PRIORITY AUDIO LOADING - Load control audios first!
  useEffect(() => {
    const preloadAudio = async () => {
      try {
        console.log("Starting priority audio preload...")
        // STEP 1: Load control audio files FIRST (highest priority)
        const controlAudios = {
          play: "/images/Audio/bingo/p.mp3", // Local path
          continue: "/images/Audio/bingo/c.mp3", // Local path
          stop: "/images/Audio/bingo/s.mp3", // Local path
          shuffle: "/images/Audio/bingo/sh.mp3", // Local path
          winner: "/images/Audio/bingo/w.mp3", // Local path
          try: "/images/Audio/bingo/t.mp3", // Local path
          notFound: "/images/Audio/bingo/n.mp3", // Local path
        }
        console.log("Loading control audios first...")
        const controlPromises = Object.entries(controlAudios).map(([key, path]) => {
          return new Promise((resolve) => {
            const audio = new Audio()
            audio.preload = "auto"
            audio.volume = 1.0
            const onReady = () => {
              controlAudioRefs.current[key] = audio
              console.log(`✅ Loaded control audio: ${key}`)
              resolve(true)
            }
            const onError = () => {
              console.warn(`❌ Failed to load control audio: ${key}`)
              // Still store the audio object for fallback
              controlAudioRefs.current[key] = audio
              resolve(false)
            }
            // Listen for multiple ready states
            audio.addEventListener("canplaythrough", onReady, { once: true })
            audio.addEventListener("canplay", onReady, { once: true })
            audio.addEventListener("error", onError, { once: true })
            // Set source and force load
            audio.src = path
            audio.load()
            // Timeout fallback for control audios (shorter timeout)
            setTimeout(() => {
              if (!controlAudioRefs.current[key]) {
                console.warn(`⏰ Timeout loading control audio: ${key}`)
                controlAudioRefs.current[key] = audio
                resolve(false)
              }
            }, 3000) // 3 seconds timeout for control audios
          })
        })
        // Wait for control audios to load
        const controlResults = await Promise.all(controlPromises)
        const controlSuccessCount = controlResults.filter(Boolean).length
        console.log(`🎮 Control audios loaded: ${controlSuccessCount}/${controlResults.length}`)
        // Enable play button as soon as control audios are loaded
        setControlAudioLoaded(true)
        setAudioLoadingProgress(10) // 10% progress after control audios

        // STEP 2: Load number audio files in background (lower priority)
        console.log("Loading number audios in background...")
        const numberPromises = []
        const totalNumbers = 75
        let loadedNumberCount = 0

        for (let i = 1; i <= totalNumbers; i++) {
          const prefix = getBingoPrefix(i)
          if (!prefix) {
            console.warn(`Skipping audio for number ${i}: No prefix found.`)
            continue
          }
          const filename = `${prefix}${i}.mp3`
          const audioPath = `/images/Audio/bingo/${filename}` // Direct local path

          const promise = new Promise((resolve) => {
            const audio = new Audio()
            audio.preload = "auto"
            audio.volume = 1.0
            const onReady = () => {
              audioRefs.current[i] = audio
              loadedNumberCount++
              // Update progress as each number audio loads
              const currentProgress = 10 + (loadedNumberCount / totalNumbers) * 90
              setAudioLoadingProgress(Math.round(currentProgress))
              resolve(true)
            }
            const onError = () => {
              console.warn(`❌ Failed to load number audio: ${filename}`)
              // Still store the audio object for fallback
              audioRefs.current[i] = audio
              loadedNumberCount++ // Count as attempted
              const currentProgress = 10 + (loadedNumberCount / totalNumbers) * 90
              setAudioLoadingProgress(Math.round(currentProgress))
              resolve(false)
            }
            // Listen for multiple ready states
            audio.addEventListener("canplaythrough", onReady, { once: true })
            audio.addEventListener("canplay", onReady, { once: true })
            audio.addEventListener("error", onError, { once: true })
            // Set source and force load
            audio.src = audioPath
            audio.load()
            // Longer timeout for number audios
            setTimeout(() => {
              if (!audioRefs.current[i]) {
                console.warn(`⏰ Timeout loading number audio: ${filename}`)
                audioRefs.current[i] = audio
                loadedNumberCount++ // Count as attempted
                const currentProgress = 10 + (loadedNumberCount / totalNumbers) * 90
                setAudioLoadingProgress(Math.round(currentProgress))
                resolve(false)
              }
            }, 8000) // 8 seconds timeout for number audios
          })
          numberPromises.push(promise)
        }
        // Wait for all number audios to load (but don't block the game)
        const numberResults = await Promise.all(numberPromises)
        const numberSuccessCount = numberResults.filter(Boolean).length
        console.log(`🔢 Number audios loaded: ${numberSuccessCount}/${numberResults.length}`)
        setAllAudioLoaded(true) // Set to true when all attempted
        setAudioLoadingProgress(100)
      } catch (error) {
        console.warn("Audio preloading error:", error)
        // Still enable the game to proceed
        setControlAudioLoaded(true)
        setAllAudioLoaded(true)
        setAudioLoadingProgress(100)
      }
    }
    preloadAudio()
    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.currentTime = 0
          audio.src = ""
        }
      })
      Object.values(controlAudioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.currentTime = 0
          audio.src = ""
        }
      })
    }
  }, [])

  // IMPROVED AUDIO PLAY FUNCTIONS with better error handling
  const playControlAudio = (type) => {
    try {
      const audio = controlAudioRefs.current[type]
      if (audio) {
        // Reset audio to beginning
        audio.currentTime = 0
        // Check if audio is ready to play
        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA or better
          // Audio is ready, play immediately
          const playPromise = audio.play()
          if (playPromise) {
            playPromise.catch((error) => {
              console.warn(`Failed to play control audio ${type}:`, error)
            })
          }
        } else {
          // Audio not ready, force load and play when ready
          console.warn(`Control audio ${type} not ready, forcing load...`)
          audio.load()
          audio.addEventListener(
            "canplay",
            () => {
              audio.play().catch((error) => {
                console.warn(`Failed to play control audio ${type} after load:`, error)
              })
            },
            { once: true },
          )
        }
      } else {
        console.warn(`Control audio ${type} not found`)
      }
    } catch (error) {
      console.warn(`Error playing control audio ${type}:`, error)
    }
  }

  const playNumberAudio = (number) => {
    try {
      const audio = audioRefs.current[number]
      if (audio) {
        // Reset audio to beginning
        audio.currentTime = 0
        // Check if audio is ready to play
        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA or better
          // Audio is ready, play immediately
          const playPromise = audio.play()
          if (playPromise) {
            playPromise.catch((error) => {
              console.warn(`Failed to play number audio ${number}:`, error)
            })
          }
        } else {
          // Audio not ready, force load and play when ready
          console.warn(`Number audio ${number} not ready, forcing load...`)
          audio.load()
          audio.addEventListener(
            "canplay",
            () => {
              audio.play().catch((error) => {
                console.warn(`Failed to play number audio ${number} after load:`, error)
              })
            },
            { once: true },
          )
        }
      } else {
        console.warn(`Number audio ${number} not found`)
      }
    } catch (error) {
      console.warn(`Error playing number audio ${number}:`, error)
    }
  }

  // Find the most recent called number that is present in the searched cartela
  let lastFoundInCartela = null
  if (searchResult?.cartela?.grid) {
    const cartelaNumbers = searchResult.cartela.grid.flat().filter((v) => typeof v === "number")
    for (let i = calledNumbers.length - 1; i >= 0; i--) {
      if (cartelaNumbers.includes(calledNumbers[i])) {
        lastFoundInCartela = calledNumbers[i]
        break
      }
    }
  }

  // CRITICAL FIX: Optimized number generation with immediate access to current state
  const generateNextNumber = () => {
    // Use ref for immediate access to current available numbers
    const available = availableNumbersRef.current
    // Filter available numbers to only include those with loaded audio
    const loadedAvailableNumbers = available.filter((num) => {
      const audio = audioRefs.current[num]
      return audio && audio.readyState >= 2 // Check if audio object exists and is ready
    })

    if (loadedAvailableNumbers.length === 0) {
      console.warn("No more numbers with loaded audio available to call.")
      // If no loaded numbers are available, stop the game or handle appropriately
      if (isPlaying) {
        stopGame() // Stop the game if no more loaded numbers can be called
      }
      return null
    }

    // Get random index and select number from the loaded available numbers
    const randomIndex = Math.floor(Math.random() * loadedAvailableNumbers.length)
    const nextNumber = loadedAvailableNumbers[randomIndex]
    console.log(`Generated number: ${nextNumber}, Available loaded count: ${loadedAvailableNumbers.length}`)

    // Play audio IMMEDIATELY - before any state updates
    playNumberAudio(nextNumber)

    // Update state using functional updates to ensure we have the latest state
    setCurrentNumber(nextNumber)
    setCalledNumbers((prev) => {
      const newCalledNumbers = [...prev, nextNumber]
      console.log(`Updated called numbers: ${newCalledNumbers.length}/75`)
      return newCalledNumbers
    })
    // Immediately update the ref to prevent race conditions
    calledNumbersRef.current = [...calledNumbersRef.current, nextNumber]
    // Filter from the original available numbers to keep track of all numbers
    availableNumbersRef.current = available.filter((num) => num !== nextNumber)
    return nextNumber
  }

  const startGame = async () => {
    if (isPlaying) return

    // Store price logic (re-added)
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
    // Set playing state BEFORE playing audio to prevent double clicks
    setIsPlaying(true)
    // Play control audio IMMEDIATELY when button is clicked - NO DELAY
    setTimeout(() => {
      playControlAudio(isResume ? "continue" : "play")
    }, 0)

    // Only reset if all numbers have been called or it's the very first play
    if (calledNumbers.length === 75 || (calledNumbers.length === 0 && currentNumber === null)) {
      setCalledNumbers([])
      setCurrentNumber(null)
      calledNumbersRef.current = []
      availableNumbersRef.current = Array.from({ length: 75 }, (_, i) => i + 1)
      setLockedNonWinners({}) // Reset locked non-winners for a new game
    }

    // Start generating numbers with immediate first number
    timeoutRef.current = setTimeout(() => {
      const firstNumber = generateNextNumber()
      if (firstNumber === null) {
        stopGame()
        return
      }
      // Set up interval for subsequent numbers using dynamic speed
      intervalRef.current = setInterval(() => {
        const num = generateNextNumber()
        if (num === null) {
          stopGame()
        }
      }, gameSpeed * 1000) // Convert seconds to milliseconds
    }, 3000)
  }

  const stopGame = () => {
    // Play stop audio IMMEDIATELY when button is clicked
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
    // Play shuffle audio IMMEDIATELY when button is clicked
    playControlAudio("shuffle")
  }

  const updateGameSpeed = () => {
    if (isPlaying && intervalRef.current) {
      // Clear current interval
      clearInterval(intervalRef.current)
      // Set new interval with updated speed
      intervalRef.current = setInterval(() => {
        const num = generateNextNumber()
        if (num === null) {
          stopGame()
        }
      }, gameSpeed * 1000)
    }
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

  // Fetch price and recent data (re-added)
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

  // Calculate prize info (re-added)
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

  // Search functionality (simplified for local demo)
  const handleCheck = async () => {
    setSearchResult(null)
    setShowPopup(false)
    if (!searchValue.trim()) return

    const cartelaNumber = String(searchValue.trim())

    // Simulate a cartela grid for demonstration
    const mockCartelaGrid = [
      [1, 16, 31, 46, 61],
      [2, 17, 32, 47, 62],
      [3, 18, "FREE", 48, 63],
      [4, 19, 34, 49, 64],
      [5, 20, 35, 50, 65],
    ]

    // Check if this cartela was previously checked as a non-winner and is now locked
    if (lockedNonWinners[cartelaNumber]) {
      setSearchResult({
        cartela: { cartelaNumber: cartelaNumber, grid: mockCartelaGrid },
        isWinner: false, // It's not a winner
        isLocked: true, // It's locked
      })
      setShowPopup(true)
      return
    }

    // Simulate finding a cartela
    const foundCartela = {
      cartelaNumber: cartelaNumber,
      grid: mockCartelaGrid, // Use mock grid
    }

    const isWinner = checkBingoWin(foundCartela.grid, calledNumbers)
    if (!isWinner) {
      // If it's not a winner, lock it for this game
      setLockedNonWinners((prev) => ({
        ...prev,
        [cartelaNumber]: true,
      }))
    }
    // Winners are NOT locked, so no update to lockedNonWinners for them
    setSearchResult({
      cartela: foundCartela,
      isWinner: isWinner,
      isLocked: !isWinner && lockedNonWinners[cartelaNumber],
    })
    setShowPopup(true)
  }

  // Reset states when needed (re-added allPriceStored)
  useEffect(() => {
    if (calledNumbers.length === 0 && !isPlaying) {
      setAllPriceStored(false)
    }
  }, [calledNumbers.length, isPlaying])

  useEffect(() => {
    if (!showPopup) setWinAudioPlayed(false)
  }, [showPopup])

  // Update game speed during gameplay
  useEffect(() => {
    if (isPlaying) {
      updateGameSpeed()
    }
  }, [gameSpeed, isPlaying])

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
        {/* Audio Loading Progress Indicator - Custom Tailwind CSS implementation */}
        {!allAudioLoaded && (
          <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-50">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading Audio: {audioLoadingProgress}%</span>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${audioLoadingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        <div className="flex flex-col rounded-3xl shadow-xl">
          {/* BINGO grid and number list + number display */}
          <div className="flex flex-col md:flex-row w-full md:w-auto bg-gray-800 rounded-md justify-center items-center mx-2 p-2">
            {/* BINGO letters as buttons */}
            <div className="flex flex-row md:flex-col font-extrabold text-2xl md:text-4xl tracking-widest h-full w-full md:w-auto md:items-start p-2 gap-2">
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
                        className={`h-12 md:h-[5.5rem] w-12 md:w-[4.75rem] mr-1 md:mr-2 rounded-lg md:rounded-md font-bold text-lg md:text-4xl shadow-md border-2 transition-all duration-150 ${
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
        <div className="flex flex-col md:flex-row items-center justify-center w-full md:w-[95%] lg:w-[88%] gap-16 py-2 px-10 bg-green-600 md:mt-4 rounded-lg mx-auto shadow-lg">
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
                disabled={!controlAudioLoaded} // Only check control audio loaded!
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
                    {controlAudioLoaded ? "Play" : "Loading..."}
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
          {/* Speed Control Bar */}
          <div className="flex flex-col items-center w-full mt-3 gap-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300 ">
            <label className="text-sm font-semibold text-fuchsia-800">Speed: {gameSpeed}s</label>
            <div className="flex items-center gap-2 w-full max-w-xs">
              <span className="text-xs text-fuchsia-600 font-medium">1s</span>
              <input
                type="range"
                min="1"
                max="10"
                value={gameSpeed}
                onChange={(e) => setGameSpeed(Number(e.target.value))}
                disabled={isPlaying}
                className="flex-1 h-2 bg-gradient-to-r from-green-200 to-fuchsia-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fuchsia-500 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-fuchsia-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
              />
              <span className="text-xs text-fuchsia-600 font-medium">10s</span>
            </div>
            <p className="text-xs text-fuchsia-600 text-center">
              {isPlaying ? "Speed locked during game" : "Adjust speed"}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center w-full mt-2 bg-gradient-to-r from-fuchsia-200 via-yellow-100 to-green-200 rounded-xl shadow-lg p-4 border-2 border-fuchsia-300 gap-4">
            <div>
              {" "}
              <p className="text-2xl font-bold text-fuchsia-700">Win</p>{" "}
            </div>
            {prizeInfo && (
              <div className="flex items-end gap-1">
                <span className="text-6xl font-extrabold text-green-600">{Math.trunc(prizeInfo.winnerPrize)}</span>
                <span className="text-2xl font-bold text-fuchsia-500">Birr</span>
              </div>
            )}
          </div>
        </div>
        {/* Current Number Display */}
        {showCurrent &&
          currentNumber !== null &&
          calledNumbers.length > 0 &&
          calledNumbers[calledNumbers.length - 1] === currentNumber && (
            <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
              <div
                className={`relative flex items-center justify-center w-[180px] h-[180px] md:w-[260px] md:h-[260px] border-4 border-fuchsia-400 rounded-full shadow-2xl ${bingoColumns[getColumnIndex(currentNumber)].bg} pointer-events-auto`}
              >
                <span
                  style={{
                    fontSize: "8rem",
                    fontWeight: 900,
                    animation: "moveInFromBottomRight 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  className="drop-shadow-lg text-white"
                >
                  {currentNumber}
                </span>
              </div>
            </div>
          )}
        {/* Search Result Popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ">
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-4 border-gradient-to-r from-blue-400 to-purple-400">
              {searchResult?.notFound ? (
                <>
                  {/* Not Found Section */}
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-red-600 mb-2">Cartela Not Found</h2>
                      <p className="text-gray-600">The cartela number you searched for doesn't exist.</p>
                    </div>
                    {/* Play not found audio immediately */}
                    {!winAudioPlayed &&
                      (() => {
                        playControlAudio("notFound")
                        setWinAudioPlayed(true)
                        return null
                      })()}
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
                      onClick={() => setShowPopup(false)}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                (() => {
                  const grid = searchResult.cartela.grid
                  const isWinner = searchResult.isWinner
                  const isLocked = searchResult.isLocked // New flag for locked non-winners
                  // MODIFIED: Get ALL winning patterns if it's a winner
                  const allWinningPatterns = isWinner ? getWinningPattern(grid, calledNumbers) : []
                  // Play audio based on current status, but only if not already played for this popup instance
                  if (!winAudioPlayed) {
                    if (isLocked) {
                      // Do not play audio for re-searched locked non-winners
                      console.log("Cartela already locked as non-winner, not playing audio again.")
                    } else {
                      playControlAudio(isWinner ? "winner" : "try")
                    }
                    setWinAudioPlayed(true)
                  }
                  return (
                    <>
                      {/* Header Section */}
                      <div className="text-center ">
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              isWinner
                                ? "bg-gradient-to-br from-green-400 to-blue-500"
                                : "bg-gradient-to-br from-red-400 to-orange-500"
                            }`}
                          >
                            {isWinner ? (
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              Cartela #{searchResult.cartela.cartelaNumber}
                            </h2>
                          </div>
                        </div>
                        {/* Status Message */}
                        <div className={`text-xl font-semibold mb-4 ${isWinner ? "text-green-700" : "text-red-700"}`}>
                          {isWinner
                            ? "Congratulations! This cartela is a winner!"
                            : isLocked
                              ? "This cartela was checked and is not a winner. It is locked for this game."
                              : "This cartela is not a winner. It has been locked for this game."}
                        </div>
                      </div>
                      {/* BINGO Card Section */}
                      <div className=" rounded-2xl p-2 shadow-inner border-2 border-gray-200 ">
                        {/* BINGO Header */}
                        <div className="flex justify-center mb-4">
                          {bingoColumns.map((col, index) => (
                            <div
                              key={col.letter}
                              className={`w-16 h-12 bg-fuchsia-300 flex items-center justify-center rounded-t-lg font-black text-4xl text-white shadow-md ${col.bg} ${index === 0 ? "rounded-tl-lg" : ""} ${index === bingoColumns.length - 1 ? "rounded-tr-lg" : ""}`}
                            >
                              {col.letter}
                            </div>
                          ))}
                        </div>
                        {/* BINGO Grid */}
                        <div className="flex flex-col gap-1">
                          {grid &&
                            grid.map((row, rowIdx) => (
                              <div key={rowIdx} className="flex gap-1 justify-center">
                                {row.map((val, colIdx) => {
                                  const isNum = typeof val === "number"
                                  const isCalled = isNum && calledNumbers.includes(val)
                                  const isLast = isNum && val === lastFoundInCartela
                                  const columnColor = bingoColumns[colIdx]
                                  // MODIFIED: Pass allWinningPatterns to check if cell is in ANY winning pattern
                                  const isInWinningPattern =
                                    isWinner && isCellInWinningPattern(rowIdx, colIdx, allWinningPatterns)
                                  return (
                                    <div
                                      key={colIdx}
                                      className={`w-16 h-16 flex items-center justify-center rounded-lg font-bold text-lg border-3 transition-all duration-300 ${
                                        isNum
                                          ? isInWinningPattern
                                            ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg transform scale-105 ring-2 ring-green-300"
                                            : isCalled
                                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-700 shadow-lg transform scale-105"
                                              : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-300 hover:shadow-md"
                                          : isInWinningPattern
                                            ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 font-black text-xl ring-2 ring-green-300"
                                            : "bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-yellow-500 font-black text-xl"
                                      } ${isLast ? "ring-4 ring-pink-400 ring-opacity-75 animate-pulse" : ""}`}
                                    >
                                      {val === "FREE" ? <span className="text-sm font-black">FREE</span> : val}
                                    </div>
                                  )
                                })}
                              </div>
                            ))}{" "}
                        </div>
                        {/* Stats Section */}
                        <div className="mt-6 flex justify-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Called Numbers</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {grid
                                ? grid.flat().filter((val) => typeof val === "number" && calledNumbers.includes(val))
                                    .length
                                : 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Numbers</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {grid ? grid.flat().filter((val) => typeof val === "number").length : 0}
                            </p>
                          </div>
                          {lastFoundInCartela && (
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Last Called</p>
                              <p className="text-2xl font-bold text-pink-600">
                                {getBingoPrefix(lastFoundInCartela).toUpperCase()}
                                {lastFoundInCartela}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Close Button */}
                      <div className="text-center mt-6">
                        <button
                          className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
                          onClick={() => setShowPopup(false)}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )
                })()
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
export default Game
