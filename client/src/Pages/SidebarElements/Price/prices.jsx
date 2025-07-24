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

  const prices = data[tab] || [];
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Game Prices</h2>
      <div className="flex gap-2 mb-4">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-150 ${tab === key ? 'bg-fuchsia-500 text-white border-fuchsia-700' : 'bg-gray-100 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-fuchsia-600 font-semibold">Loading...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-fuchsia-200 rounded-lg">
            <thead>
              <tr className="bg-fuchsia-100">
                {isAdmin && <th className="px-4 py-2 border-b">User</th>}
                <th className="px-4 py-2 border-b">Total</th>
                <th className="px-4 py-2 border-b">Winner Prize</th>
                <th className="px-4 py-2 border-b">Hosting Rent</th>
                <th className="px-4 py-2 border-b">Service Fee</th>
                <th className="px-4 py-2 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-6 text-fuchsia-400">No prices found.</td>
                </tr>
              ) : (
                prices.map((p, idx) => (
                  <tr key={p._id || idx} className="hover:bg-fuchsia-50">
                    {isAdmin && (
                      <td className="px-4 py-2 border-b font-semibold">
                        {p.user ? `${p.user.firstname} ${p.user.lastname}` : 'Unknown'}
                      </td>
                    )}
                    <td className="px-4 py-2 border-b">{p.Total}</td>
                    <td className="px-4 py-2 border-b">{p.WinnerPrize}</td>
                    <td className="px-4 py-2 border-b">{p.HostingRent}</td>
                    <td className="px-4 py-2 border-b">{p.service}</td>
                    <td className="px-4 py-2 border-b">{new Date(p.createdAt).toLocaleString()}</td>
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

