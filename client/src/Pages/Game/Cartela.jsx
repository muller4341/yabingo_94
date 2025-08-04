// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';

// const TOGGLED_STORAGE_KEY = 'cartela_toggled_state';

// const Cartela = () => {
//   const [cartelas, setCartelas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showLimitModal, setShowLimitModal] = useState(false);

//   const [toggled, setToggled] = useState(() => {
//     // Load from localStorage if available
//     try {
//       const saved = localStorage.getItem(TOGGLED_STORAGE_KEY);
//       return saved ? JSON.parse(saved) : {};
//     } catch {
//       return {};
//     }
//   });
//   const [submitStatus, setSubmitStatus] = useState(null); // For feedback
//    const { currentUser } = useSelector((state) => state.user);
//     const navigate = useNavigate();

//   // Save toggled state to localStorage whenever it changes
//   useEffect(() => {
//     try {
//       localStorage.setItem(TOGGLED_STORAGE_KEY, JSON.stringify(toggled));
//     } catch {}
//   }, [toggled]);

//   useEffect(() => {
//     fetch('/api/cartelas')
//       .then(res => {
//         if (!res.ok) throw new Error('Failed to fetch cartelas');
//         return res.json();
//       })
//       .then(data => {
//         setCartelas(data.sort((a, b) => a.cartelaNumber - b.cartelaNumber));
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   // Toggle on single click, untoggle on double click
//   const handleToggle = (cartelaNumber, isDoubleClick = false) => {
//     setToggled(prev => {
//       if (isDoubleClick) {
//         // Only untoggle if currently toggled
//         if (prev[cartelaNumber]) {
//           return { ...prev, [cartelaNumber]: false };
//         }
//         return prev;
//       } else {
//         // Toggle on single click
//         return { ...prev, [cartelaNumber]: !prev[cartelaNumber] };
//       }
//     });
//   };

//   // Clear all toggled buttons
//   const handleClear = () => {
//     setToggled({});
//     try {
//       localStorage.removeItem(TOGGLED_STORAGE_KEY);
//     } catch {}
//   };


//   // const handleSave = async () => {
//   //   // Collect selected cartelas
//   //   const selected = cartelas.filter(c => toggled[c.cartelaNumber]);
//   //   if (selected.length === 0) {
//   //     setSubmitStatus({ success: false, message: 'No cartelas selected.' });
//   //     return;
//   //   }
//   //   const createdBy = currentUser ? currentUser._id : null;
//   //   const totalselectedcartela = selected.length;
//   //   try {
//   //     const res = await fetch('/api/selectedcartelas', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({
//   //         createdBy,
//   //         cartelas: selected.map(c => ({ cartelaNumber: c.cartelaNumber, grid: c.grid })),
//   //         totalselectedcartela
//   //       })
//   //     });
//   //     const data = await res.json();
//   //     if (res.ok) {
//   //       navigate('/game');
//   //     } else {
//   //       setSubmitStatus({ success: false, message: data.message || 'Failed to save selection.' });
//   //     }
//   //   } catch (err) {
//   //     setSubmitStatus({ success: false, message: err.message });
//   //   }
//   // };
//   const handleSave = async () => {
//   // Collect selected cartelas
//   const selected = cartelas.filter(c => toggled[c.cartelaNumber]);
//   if (selected.length === 0) {
//     setSubmitStatus({ success: false, message: 'No cartelas selected.' });
//     return;
//   }

//   const createdBy = currentUser ? currentUser._id : null;
//   const totalselectedcartela = selected.length;

//   try {
//     // Fetch HostingRent check first
//     const res = await fetch('/api/price/allprice');
//     if (!res.ok) throw new Error('Failed to fetch price summary');

//     const result = await res.json();
//     const { sumAll } = result.data;

//     let hostingRent;

//     if (currentUser.isAdmin) {
//       const userSum = sumAll[currentUser._id];
//       hostingRent = userSum ? parseFloat(userSum.HostingRent || 0) : 0;
//     } else {
//       hostingRent = parseFloat(sumAll.HostingRent || 0);
//     }

//     // Only allow if hostingRent is under 20,000
//     if (hostingRent > 20000) {
//       setShowLimitModal(true);
//       return;
//     }

//     // If eligible, proceed with saving
//     const saveRes = await fetch('/api/selectedcartelas', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         createdBy,
//         cartelas: selected.map(c => ({ cartelaNumber: c.cartelaNumber, grid: c.grid })),
//         totalselectedcartela
//       })
//     });

//     const data = await saveRes.json();
//     if (saveRes.ok) {
//       navigate('/game');
//     } else {
//       setSubmitStatus({ success: false, message: data.message || 'Failed to save selection.' });
//     }

//   } catch (err) {
//     setSubmitStatus({ success: false, message: err.message });
//   }
// };


//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className='flex flex-col items-center  min-h-screen  bg-green-800'>
//     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }} >
//       {cartelas.map(cartela => {
//         const isToggled = toggled[cartela.cartelaNumber];
//         return (
//           <button
//           className="rounded-md"
//             key={cartela.cartelaNumber}
//             data-grid={JSON.stringify(cartela.grid)}
//             onClick={() => handleToggle(cartela.cartelaNumber, false)}
//             onDoubleClick={() => handleToggle(cartela.cartelaNumber, true)}
//             style={{
//               width: 88,
//               height: 80,
//               background: isToggled
//                 ? '#ef4444' // red-500
//                 : 'linear-gradient(135deg, #f3f4f6 60%, #e0e7ef 100%)',
//               border: '1.5px solid #e5e7eb',
              
//               boxShadow: '0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)',
//               color: isToggled ? '#fff' : '#a21caf', // white text on red, purple otherwise
//               fontSize: 32,
//               fontWeight: 'bold',
//               cursor: 'pointer',
//               transition: 'transform 0.13s, filter 0.13s, box-shadow 0.13s, background 0.13s, color 0.13s',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               outline: 'none',
//             }}
//             onMouseOver={e => {
//               e.currentTarget.style.transform = 'scale(1.10)';
//               e.currentTarget.style.filter = 'brightness(1.08)';
//               e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(59,130,246,0.13), 0 2px 8px 0 rgba(0,0,0,0.08)';
//             }}
//             onMouseOut={e => {
//               e.currentTarget.style.transform = 'scale(1)';
//               e.currentTarget.style.filter = 'brightness(1)';
//               e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)';
//             }}
//           >
//             {cartela.cartelaNumber}
//           </button>
//         );
//       })}
//     </div>
    
//     <div className='flex gap-10 mt-6  flex-col md:flex-row justify-start'>
//         <div className="mb-2 text-2xl font-extrabold">
//   <span className="text-white">Selected Cartelas:</span>{' '}
//   <span className="text-yellow-300">{Object.values(toggled).filter(Boolean).length}</span>
// </div>
       
//         <button className="w-full md:flex-1 bg-yellow-500 text-white font-semibold  px-10  rounded-md shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed "
//               type="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
//               <button className="w-full md:flex-1 bg-green-500 text-white font-semibold  px-10 rounded-md  shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
//               type="button" onClick={handleSave}>Play</button>
//                <button className="w-full md:flex-1 bg-gradient-to-r bg-red-500 text-white font-semibold  px-10  rounded-md shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed "
//               type="button" onClick={handleClear}>Clear</button>
//     </div>
//     {showLimitModal && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//     <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
//       <h2 className="text-2xl font-bold text-red-600 mb-4">Limit Exceeded</h2>
//       <p className="text-gray-700 mb-6">You already passed the limit of <strong>20,000 Br</strong> Hosting Rent.</p>
//       <button
//         onClick={() => setShowLimitModal(false)}
//         className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition duration-200"
//       >
//         Close
//       </button>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default Cartela;
"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const TOGGLED_STORAGE_KEY = "cartela_toggled_state"

const Cartela = () => {
  const [cartelas, setCartelas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [toggled, setToggled] = useState(() => {
    // Load from localStorage if available
    try {
      const saved = localStorage.getItem(TOGGLED_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [submitStatus, setSubmitStatus] = useState(null) // For feedback
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  // Save toggled state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TOGGLED_STORAGE_KEY, JSON.stringify(toggled))
    } catch {}
  }, [toggled])

  useEffect(() => {
    fetch("/api/cartelas")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cartelas")
        return res.json()
      })
      .then((data) => {
        setCartelas(data.sort((a, b) => a.cartelaNumber - b.cartelaNumber))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Toggle on single click, untoggle on double click
  const handleToggle = (cartelaNumber, isDoubleClick = false) => {
    setToggled((prev) => {
      if (isDoubleClick) {
        // Only untoggle if currently toggled
        if (prev[cartelaNumber]) {
          return { ...prev, [cartelaNumber]: false }
        }
        return prev
      } else {
        // Toggle on single click
        return { ...prev, [cartelaNumber]: !prev[cartelaNumber] }
      }
    })
  }

  // Clear all toggled buttons
  const handleClear = () => {
    setToggled({})
    try {
      localStorage.removeItem(TOGGLED_STORAGE_KEY)
    } catch {}
  }

  const handleSave = async () => {
    // Collect selected cartelas
    const selected = cartelas.filter((c) => toggled[c.cartelaNumber])
    if (selected.length === 0) {
      setSubmitStatus({ success: false, message: "No cartelas selected." })
      return
    }
    const createdBy = currentUser ? currentUser._id : null
    const totalselectedcartela = selected.length
    try {
      // Fetch HostingRent check first
      const res = await fetch("/api/price/allprice")
      if (!res.ok) throw new Error("Failed to fetch price summary")
      const result = await res.json()
      const { sumAll } = result.data
      let hostingRent
      if (currentUser.isAdmin) {
        const userSum = sumAll[currentUser._id]
        hostingRent = userSum ? Number.parseFloat(userSum.HostingRent || 0) : 0
      } else {
        hostingRent = Number.parseFloat(sumAll.HostingRent || 0)
      }
      // Only allow if hostingRent is under 20,000
      if (hostingRent > 20000) {
        setShowLimitModal(true)
        return
      }
      // If eligible, proceed with saving
      const saveRes = await fetch("/api/selectedcartelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy,
          cartelas: selected.map((c) => ({ cartelaNumber: c.cartelaNumber, grid: c.grid })),
          totalselectedcartela,
        }),
      })
      const data = await saveRes.json()
      if (saveRes.ok) {
        navigate("/game")
      } else {
        setSubmitStatus({ success: false, message: data.message || "Failed to save selection." })
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message })
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // Group cartelas into rows of 20
  const rows = []
  for (let i = 0; i < cartelas.length; i += 20) {
    rows.push(cartelas.slice(i, i + 20))
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-green-800 p-4">
      {" "}
      {/* Added padding for overall layout */}
      <div className="flex flex-col gap-1 md:gap-2">
        {" "}
        {/* Container for all rows, with vertical gap */}
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap justify-center gap-1 md:flex-nowrap md:justify-center" // Each row
          >
            {row.map((cartela) => {
              const isToggled = toggled[cartela.cartelaNumber]
              return (
                <button
                  key={cartela.cartelaNumber}
                  data-grid={JSON.stringify(cartela.grid)}
                  onClick={() => handleToggle(cartela.cartelaNumber, false)}
                  onDoubleClick={() => handleToggle(cartela.cartelaNumber, true)}
                  className="rounded-md w-[88px] h-[80px] md:w-[64px] md:h-[96px] text-3xl font-bold cursor-pointer outline-none flex items-center justify-center transition-all duration-150"
                  style={{
                    background: isToggled
                      ? "#ef4444" // red-500
                      : "linear-gradient(135deg, #f3f4f6 60%, #e0e7ef 100%)",
                    border: "1.5px solid #e5e7eb",
                    boxShadow: "0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)",
                    color: isToggled ? "#fff" : "#a21caf", // white text on red, purple otherwise
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.10)"
                    e.currentTarget.style.filter = "brightness(1.08)"
                    e.currentTarget.style.boxShadow = "0 8px 24px 0 rgba(59,130,246,0.13), 0 2px 8px 0 rgba(0,0,0,0.08)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                    e.currentTarget.style.filter = "brightness(1)"
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)"
                  }}
                >
                  {cartela.cartelaNumber}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-10 mt-6 flex-col md:flex-row justify-start">
        <div className="mb-2 text-2xl font-extrabold">
          <span className="text-white">Selected Cartelas:</span>{" "}
          <span className="text-yellow-300">{Object.values(toggled).filter(Boolean).length}</span>
        </div>
        <button
          className="w-full md:flex-1 bg-yellow-500 text-white font-semibold px-10 rounded-md shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed "
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        <button
          className="w-full md:flex-1 bg-green-500 text-white font-semibold px-10 rounded-md shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          type="button"
          onClick={handleSave}
        >
          Play
        </button>
        <button
          className="w-full md:flex-1 bg-gradient-to-r bg-red-500 text-white font-semibold px-10 rounded-md shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed "
          type="button"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Limit Exceeded</h2>
            <p className="text-gray-700 mb-6">
              You already passed the limit of <strong>20,000 Br</strong> Hosting Rent.
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cartela
