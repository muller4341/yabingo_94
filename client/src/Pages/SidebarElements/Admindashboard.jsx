import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Admindashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [stats, setStats] = useState({ users: 0, cartelas: 0, revenue: 0, byDay: 0, byWeek: 0, byMonth: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) return;
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all users
        const usersRes = await fetch('/api/user/getusers', { credentials: 'include' });
        const usersData = await usersRes.json();
        // Fetch all cartelas
        const cartelaRes = await fetch('/api/cartela/');
        const cartelas = await cartelaRes.json();
        // Fetch all price stats
        const allPriceRes = await fetch('/api/price/allprice', { credentials: 'include' });
        const allPriceData = await allPriceRes.json();
        let byDay = 0, byWeek = 0, byMonth = 0, revenue = 0;
        if (allPriceData.success && allPriceData.data) {
          const sum = arr => arr.reduce((acc, p) => acc + parseFloat(p.WinnerPrize || 0), 0);
          byDay = sum(allPriceData.data.byDay);
          byWeek = sum(allPriceData.data.byWeek);
          byMonth = sum(allPriceData.data.byMonth);
          revenue = sum([...(allPriceData.data.byDay || []), ...(allPriceData.data.byWeek || []), ...(allPriceData.data.byMonth || [])]);
        }
        setStats({
          users: usersData.length,
          cartelas: cartelas.length,
          revenue,
          byDay,
          byWeek,
          byMonth,
        });
        // Show 5 most recent users
        setRecentUsers(usersData.slice(-5).reverse());
      } catch (err) {
        setError('Failed to fetch admin stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  if (!currentUser || !currentUser.isAdmin) {
    return <div className="text-red-600 font-bold text-center mt-10">Access denied. Admins only.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-lg bg-gradient-to-br from-red-50 via-yellow-100 to-green-200">
      <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome, Admin {currentUser?.firstname}!</h1>
      {/* Quick Links */}
      <div className="flex flex-wrap gap-4 mt-10">
        <Link to="/dashboard?tab=users" className="bg-fuchsia-600 text-white px-6 py-3 rounded-lg shadow hover:bg-fuchsia-700 font-semibold transition-all">Manage Users</Link>
        <Link to="/dashboard?tab=allprice" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 font-semibold transition-all">View All Prices</Link>
        <Link to="/dashboard?tab=price" className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 font-semibold transition-all">Set Price</Link>
      </div>
      {/* Recent Users */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-fuchsia-200 rounded-lg">
            <thead>
              <tr className="bg-fuchsia-100">
                <th className="px-4 py-2 border-b">First Name</th>
                <th className="px-4 py-2 border-b">Last Name</th>
                <th className="px-4 py-2 border-b">Phone Number</th>
                <th className="px-4 py-2 border-b">Location</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-fuchsia-400">No recent users found.</td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-fuchsia-50">
                    <td className="px-4 py-2 border-b">{user.firstname}</td>
                    <td className="px-4 py-2 border-b">{user.lastname}</td>
                    <td className="px-4 py-2 border-b">{user.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">{user.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {loading && <div className="text-fuchsia-600 font-semibold mt-6">Loading admin dashboard...</div>}
      {error && <div className="text-red-600 font-semibold mt-6">{error}</div>}
    </div>
  );
};

export default Admindashboard;




