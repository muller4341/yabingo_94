import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Cartela = () => {
  const [cartelas, setCartelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggled, setToggled] = useState({}); // Track toggled state by cartelaNumber
  const [submitStatus, setSubmitStatus] = useState(null); // For feedback
   const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/cartelas')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cartelas');
        return res.json();
      })
      .then(data => {
        setCartelas(data.sort((a, b) => a.cartelaNumber - b.cartelaNumber));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleToggle = (cartelaNumber) => {
    setToggled(prev => ({
      ...prev,
      [cartelaNumber]: !prev[cartelaNumber]
    }));
  };

  const handleSave = async () => {
    // Collect selected cartelas
    const selected = cartelas.filter(c => toggled[c.cartelaNumber]);
    if (selected.length === 0) {
      setSubmitStatus({ success: false, message: 'No cartelas selected.' });
      return;
    }
    const createdBy = currentUser ? currentUser._id : null;
    try {
      const res = await fetch('/api/selectedcartelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy,
          cartelas: selected.map(c => ({ cartelaNumber: c.cartelaNumber, grid: c.grid }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/game');
      } else {
        setSubmitStatus({ success: false, message: data.message || 'Failed to save selection.' });
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: err.message });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='flex md:flex-col items-center  min-h-screen md:py-6'>
        <p className='m:text-xl font-bold text-green-800'>Select  Cartelas to Play</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: 32 }}>
      {cartelas.map(cartela => {
        const isToggled = toggled[cartela.cartelaNumber];
        return (
          <button
            key={cartela.cartelaNumber}
            data-grid={JSON.stringify(cartela.grid)}
            onClick={() => handleToggle(cartela.cartelaNumber)}
            style={{
              width: 60,
              height: 60,
              background: isToggled
                ? '#ef4444' // red-500
                : 'linear-gradient(135deg, #f3f4f6 60%, #e0e7ef 100%)',
              border: '1.5px solid #e5e7eb',
              borderRadius: 16,
              boxShadow: '0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)',
              color: isToggled ? '#fff' : '#a21caf', // white text on red, purple otherwise
              fontSize: 28,
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.13s, filter 0.13s, box-shadow 0.13s, background 0.13s, color 0.13s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.10)';
              e.currentTarget.style.filter = 'brightness(1.08)';
              e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(59,130,246,0.13), 0 2px 8px 0 rgba(0,0,0,0.08)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.04)';
            }}
          >
            {cartela.cartelaNumber}
          </button>
        );
      })}
    </div>
    {submitStatus && (
      <div className={`mt-4 px-4 py-2 rounded-xl font-semibold ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {submitStatus.message}
      </div>
    )}
    <div className='flex gap-10 mt-6 py-6 flex-col md:flex-row'>
        <button className="w-full md:flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="button" onClick={handleSave}>Save</button>
        <button className="w-full md:flex-1 bg-yellow-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="button">Cancel</button>
        <button className="w-full md:flex-1 bg-gradient-to-r bg-red-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="button">dashboard</button>
    </div>
    </div>
  );
};

export default Cartela;
