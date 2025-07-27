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
  const [sums, setSums] = useState({ byDay: {}, byWeek: {}, byMonth: {} });
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
          
          // Calculate sums for each period
          const calculateSums = (prices) => {
            return prices.reduce((acc, p) => ({
              Total: (parseFloat(acc.Total) + parseFloat(p.Total)).toString(),
              WinnerPrize: (parseFloat(acc.WinnerPrize) + parseFloat(p.WinnerPrize)).toString(),
              HostingRent: (parseFloat(acc.HostingRent) + parseFloat(p.HostingRent)).toString(),
              service: (parseFloat(acc.service) + parseFloat(p.service)).toString(),
            }), { Total: "0", WinnerPrize: "0", HostingRent: "0", service: "0" });
          };

          const calculateSumsByUser = (prices) => {
            const userSums = {};
            prices.forEach(p => {
              const userId = p.createdBy;
              if (!userSums[userId]) {
                userSums[userId] = { Total: "0", WinnerPrize: "0", HostingRent: "0", service: "0" };
              }
              userSums[userId].Total = (parseFloat(userSums[userId].Total) + parseFloat(p.Total)).toString();
              userSums[userId].WinnerPrize = (parseFloat(userSums[userId].WinnerPrize) + parseFloat(p.WinnerPrize)).toString();
              userSums[userId].HostingRent = (parseFloat(userSums[userId].HostingRent) + parseFloat(p.HostingRent)).toString();
              userSums[userId].service = (parseFloat(userSums[userId].service) + parseFloat(p.service)).toString();
            });
            return userSums;
          };

          const isAdmin = currentUser && currentUser.isAdmin;
          setSums({
            byDay: isAdmin ? calculateSumsByUser(result.data.byDay || []) : calculateSums(result.data.byDay || []),
            byWeek: isAdmin ? calculateSumsByUser(result.data.byWeek || []) : calculateSums(result.data.byWeek || []),
            byMonth: isAdmin ? calculateSumsByUser(result.data.byMonth || []) : calculateSums(result.data.byMonth || [])
          });
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
    <div className="max-w-5xl mx-auto mt-8 p-0 md:p-6 rounded-3xl shadow-lg bg-gradient-to-br from-red-50 via-yellow-100 to-green-200 border border-fuchsia-100">
      <h2 className="text-3xl font-extrabold text-fuchsia-700 mb-6 text-center tracking-tight drop-shadow">Game Prices</h2>
      
      {/* Sums Section */}
      <div className="mb-6 p-4 bg-white/80 rounded-xl border border-fuchsia-100">
        <h3 className="text-xl font-bold text-fuchsia-700 mb-4 text-center">Period Totals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(categoryLabels).filter(([key]) => key !== 'all').map(([key, label]) => (
            <div key={key} className="p-3 bg-gradient-to-r from-fuchsia-50 to-yellow-50 rounded-lg border border-fuchsia-200">
              <h4 className="font-bold text-fuchsia-700 text-center mb-2">{label}</h4>
              {isAdmin && typeof sums[key] === 'object' && !Array.isArray(sums[key]) ? (
                // Admin view: show user-grouped sums
                Object.entries(sums[key]).map(([userId, userSum]) => {
                  const user = data[key]?.find(p => p.createdBy === userId)?.user;
                  const userName = user ? `${user.firstname} ${user.lastname}` : 'Unknown User';
                  return (
                    <div key={userId} className="mb-3 p-2 bg-white/60 rounded border-l-4 border-fuchsia-400">
                      <div className="font-semibold text-fuchsia-700 text-sm mb-1">{userName}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-yellow-700">{userSum.Total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Winner Prize:</span>
                          <span className="font-bold text-green-700">{userSum.WinnerPrize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hosting Rent:</span>
                          <span className="font-bold text-yellow-600">{userSum.HostingRent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee:</span>
                          <span className="font-bold text-red-600">{userSum.service}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // User view: show total sums
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-yellow-700">{sums[key]?.Total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Winner Prize:</span>
                    <span className="font-bold text-green-700">{sums[key]?.WinnerPrize || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hosting Rent:</span>
                    <span className="font-bold text-yellow-600">{sums[key]?.HostingRent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="font-bold text-red-600">{sums[key]?.service || 0}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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

