import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const UserDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [cartelaCount, setCartelaCount] = useState(0);
  const [recentCartela, setRecentCartela] = useState(null);
  const [price, setPrice] = useState(null);
  const [prizeStats, setPrizeStats] = useState({ byDay: 0, byWeek: 0, byMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all cartelas
        const cartelaRes = await fetch('/api/cartela/');
        const cartelas = await cartelaRes.json();
        setCartelaCount(cartelas.length);

        // Fetch most recent selected cartela
        const recentRes = await fetch('/api/selectedcartelas/recent', { credentials: 'include' });
        const recentData = await recentRes.json();
        setRecentCartela(recentData.success ? recentData.data : null);

        // Fetch current price
        const priceRes = await fetch('/api/price/me', { credentials: 'include' });
        const priceData = await priceRes.json();
        setPrice(priceData.success ? priceData.data : null);

        // Fetch prize stats
        const allPriceRes = await fetch('/api/price/allprice', { credentials: 'include' });
        const allPriceData = await allPriceRes.json();
        if (allPriceData.success && allPriceData.data) {
          const sum = arr => arr.reduce((acc, p) => acc + parseFloat(p.WinnerPrize || 0), 0);
          setPrizeStats({
            byDay: sum(allPriceData.data.byDay),
            byWeek: sum(allPriceData.data.byWeek),
            byMonth: sum(allPriceData.data.byMonth),
          });
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome, {currentUser?.firstname || 'Player'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Profile Card */}
        <div className="bg-fuchsia-50 rounded-lg shadow p-6 flex flex-col items-center">
          <img
            src={currentUser?.profilePicture || '/images/pp.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-fuchsia-400 mb-4 object-cover"
          />
          <div className="text-xl font-bold text-fuchsia-700">{currentUser?.firstname} {currentUser?.lastname}</div>
          <div className="text-gray-600">{currentUser?.phoneNumber}</div>
          <div className="text-gray-600">{currentUser?.location}</div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 rounded-lg p-4 flex flex-col items-center shadow">
            <div className="text-2xl font-bold text-green-700">{cartelaCount}</div>
            <div className="text-green-800 font-semibold">Total Cartelas</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow">
            <div className="text-2xl font-bold text-yellow-700">{recentCartela?.totalselectedcartela || 0}</div>
            <div className="text-yellow-800 font-semibold">Selected Cartelas</div>
          </div>
          <div className="bg-fuchsia-100 rounded-lg p-4 flex flex-col items-center shadow col-span-2">
            <div className="text-lg font-bold text-fuchsia-700">Most Recent Selection</div>
            {recentCartela ? (
              <>
                <div className="text-fuchsia-800">Cartela #{recentCartela.cartelas?.[0]?.cartelaNumber || '-'}</div>
                <div className="text-gray-600 text-sm">{recentCartela.createdAt ? new Date(recentCartela.createdAt).toLocaleString() : ''}</div>
              </>
            ) : (
              <div className="text-gray-400">No recent selection</div>
            )}
          </div>
        </div>
      </div>
      {/* Price and Prize Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow">
          <div className="text-lg font-bold text-blue-700 mb-2">Current Price</div>
          {price ? (
            <>
              <div className="text-2xl font-bold text-blue-800">{price.amount} Birr</div>
              <div className="text-blue-600">Rent: {price.rentpercent}%</div>
            </>
          ) : (
            <div className="text-gray-400">No price set</div>
          )}
        </div>
        <div className="bg-green-50 rounded-lg p-6 flex flex-col items-center shadow">
          <div className="text-lg font-bold text-green-700 mb-2">Today's Winnings</div>
          <div className="text-2xl font-bold text-green-800">{prizeStats.byDay.toFixed(2)} Birr</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6 flex flex-col items-center shadow">
          <div className="text-lg font-bold text-yellow-700 mb-2">This Week's Winnings</div>
          <div className="text-2xl font-bold text-yellow-800">{prizeStats.byWeek.toFixed(2)} Birr</div>
        </div>
        <div className="bg-fuchsia-50 rounded-lg p-6 flex flex-col items-center shadow md:col-span-3">
          <div className="text-lg font-bold text-fuchsia-700 mb-2">This Month's Winnings</div>
          <div className="text-2xl font-bold text-fuchsia-800">{prizeStats.byMonth.toFixed(2)} Birr</div>
        </div>
      </div>
      {loading && <div className="text-fuchsia-600 font-semibold mt-6">Loading dashboard...</div>}
    </div>
  );
};

export default UserDashboard;
