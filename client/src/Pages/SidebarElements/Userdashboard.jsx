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
          const filterByUser = arr => arr.filter(p => (p.user?._id || p.createdBy) === (currentUser._id || currentUser.id));
          setPrizeStats({
            byDay: sum(filterByUser(allPriceData.data.byDay)),
            byWeek: sum(filterByUser(allPriceData.data.byWeek)),
            byMonth: sum(filterByUser(allPriceData.data.byMonth)),
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
    <div className="max-w-5xl mx-auto mt-10 p-6 rounded-3xl shadow-lg bg-gradient-to-br from-red-50 via-yellow-100 to-green-200">
      <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome, {currentUser?.firstname || 'Player'}!</h1>
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
