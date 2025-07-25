import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const categoryLabels = {
  byDay: 'Today',
  byWeek: 'This Week',
  byMonth: 'This Month',
  all: 'All',
};

const Prices = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [data, setData] = useState({ byDay: [], byWeek: [], byMonth: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('byDay');

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/price/allprice', {
          credentials: 'include',
        });
        const result = await res.json();
        if (result.success && result.data) {
          console.log('API /api/price/allprice result.data:', result.data);
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch prices.');
        }
      } catch (err) {
        setError('Failed to fetch prices.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    console.log('Current tab:', tab);
    console.log('Prices for tab:', data[tab]);
  }, [tab, data]);

  const prices = data[tab] || [];
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-0 md:p-6 bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 rounded-3xl shadow-2xl border border-fuchsia-100">
      <h2 className="text-3xl font-extrabold text-fuchsia-700 mb-6 text-center tracking-tight drop-shadow">Game Prices</h2>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            className={`px-5 py-2 rounded-full font-bold border-2 transition-all duration-150 shadow-sm text-base
              ${tab === key ? 'bg-gradient-to-r from-fuchsia-500 to-yellow-400 text-white border-fuchsia-700 scale-105 shadow-md' : 'bg-white/80 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100 hover:text-fuchsia-800'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-fuchsia-600 font-semibold text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold text-center py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-fuchsia-100 bg-white/80">
          <table className="min-w-full text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-fuchsia-100 via-yellow-100 to-green-100">
                {isAdmin && <th className="px-4 py-3 border-b font-bold text-fuchsia-700">User</th>}
                <th className="px-4 py-3 border-b font-bold text-fuchsia-700">Total</th>
                <th className="px-4 py-3 border-b font-bold text-green-700">Winner Prize</th>
                <th className="px-4 py-3 border-b font-bold text-yellow-700">Hosting Rent</th>
                <th className="px-4 py-3 border-b font-bold text-red-700">Service Fee</th>
                <th className="px-4 py-3 border-b font-bold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-fuchsia-400 font-semibold">No prices found.</td>
                </tr>
              ) : (
                prices.map((p, idx) => (
                  <tr key={p._id || idx} className={
                    `hover:bg-fuchsia-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-fuchsia-50/40'}`
                  }>
                    {isAdmin && (
                      <td className="px-4 py-3 border-b font-semibold text-fuchsia-700">
                        {p.user ? `${p.user.firstname} ${p.user.lastname}` : 'Unknown'}
                      </td>
                    )}
                    <td className="px-4 py-3 border-b">
                      <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold shadow-sm">{p.Total}</span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold shadow-sm">{p.WinnerPrize}</span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className="inline-block px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 font-bold shadow-sm">{p.HostingRent}</span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold shadow-sm">{p.service}</span>
                    </td>
                    <td className="px-4 py-3 border-b text-gray-600">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Prices;

