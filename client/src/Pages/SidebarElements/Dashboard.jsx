import { Navigate, useLocation } from "react-router-dom";
import DashProfile from "./Profile";
import { DashSidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import { useSelector } from "react-redux";
import { FaMoon, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../redux/theme/themeSlice";
import { signOutSuccess } from "../../redux/user/userSlice";
import UserDashboard from "./Userdashboard"
import SetPrice from "./Price/setprice";
import Prices from "./Price/prices";
import UserManagement from"./UserManagement"
import Admindashboard from "./Admindashboard";




const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("");
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderId, setOrderId] = useState("");

  

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    const orderIdFromUrl = urlParams.get("orderId");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      if (currentUser && currentUser.isAdmin) {
        navigate("/dashboard?tab=admindashboard");
      } else {
        navigate("/dashboard?tab=dashboard");
      }
    }
    if (orderIdFromUrl) {
    setOrderId(orderIdFromUrl);
  } else {
    setOrderId("");
  }
  }, [location.search, navigate, currentUser]);

  const handelSignOut = async () => {
    try {
      const res = await fetch(`/api/user/signout`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
        navigate("/signin");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full  bg-gradient-to-br from-green-200 via-yellow-100 to-red-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden flex flex-col md:flex-row">
      {/* Decorative Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.12)_0,transparent_60%),radial-gradient(circle_at_80%_80%,rgba(132,204,22,0.10)_0,transparent_60%)]"></div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-40 transition-opacity md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:block`}
        style={{ minHeight: '100vh' }}
      >
        <div className="h-full w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-r border-fuchsia-100 dark:border-gray-800 flex flex-col">
          <DashSidebar />
        </div>
      </aside>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl bg-fuchsia-600 text-white shadow-2xl hover:bg-fuchsia-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen " >
        {/* Header */}
        <header className="sticky top-0 z-20 mx-2 md:mx-8 mt-4 md:mt-8 rounded-2xl shadow-xl bg-gradient-to-br from-green-300 via-yellow-100 to-red-100 dark:bg-gray-800/90 backdrop-blur-lg border border-fuchsia-100 dark:border-gray-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-3 ">
            <span className="text-2xl font-extrabold text-fuchsia-700 tracking-tight drop-shadow">Bingo Dashboard</span>
          </div>
          {/* Search Bar */}
          <div className="relative w-full md:w-96 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-fuchsia-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-fuchsia-200 dark:border-fuchsia-700 rounded-2xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-200 shadow-lg"
            />
          </div>
          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            
            {/* User Profile */}
            {currentUser ? (
              <div className="relative">
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <div className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-fuchsia-500 group-hover:border-fuchsia-600 transition-all duration-200 shadow-xl">
                        <img
                          src={currentUser.profilePicture}
                          alt="user"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="hidden md:block text-lg font-bold text-fuchsia-700 dark:text-fuchsia-200">
                        {currentUser.firstname} {currentUser.lastname}
                      </span>
                    </div>
                  }
                >
                  <Dropdown.Header>
                    <span className="block text-lg font-bold text-fuchsia-700 dark:text-fuchsia-200">
                      {currentUser.firstname} {currentUser.lastname}
                    </span>
                    <span className="block text-sm text-gray-500 truncate">
                      {currentUser.email}
                    </span>
                  </Dropdown.Header>
                  <Link to="/dashboard?tab=profile">
                    <Dropdown.Item className="text-fuchsia-700 dark:text-fuchsia-200 hover:bg-fuchsia-50 dark:hover:bg-gray-700">
                      Profile
                    </Dropdown.Item>
                  </Link>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handelSignOut}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign out
                  </Dropdown.Item>
                </Dropdown>
              </div>
            ) : (
              <Link
                to="/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-semibold rounded-2xl text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-400 transition-all duration-200 shadow-lg"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-1 p-2 sm:p-4 lg:p-8 overflow-x-hidden ">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-8 mt-8 ">
            {tab === "profile" && (
              <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                <DashProfile />
              </div>
            )}
            {currentUser.isAdmin ? (
              <>
                {tab === "dashboard" && (
                  <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                    <Admindashboard />
                  </div>
                )}
                {tab === "users" && (
                  <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                    <UserManagement />
                  </div>
                )}
               
              </>
            ) : (
              <>
                {tab === "dashboard" && (
                  <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                    <UserDashboard />
                  </div>
                )}
              </>
            )}
            {tab === "price" && (
              <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                <SetPrice />
              </div>
            )}
            {tab === "allprice" && (
              <div className="bg-gradient-to-br from-green-200 via-yellow-200 to-red-200 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 border border-fuchsia-100 dark:border-fuchsia-800">
                <Prices />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
