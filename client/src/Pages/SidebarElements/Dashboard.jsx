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
import UserDashboard from "./UserDashboard"
import SetPrice from "./price/SetPrice"
import Prices from "./price/prices"
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-fuchsia-600 text-white shadow-lg hover:bg-fuchsia-700 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          className="w-6 h-6"
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

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                >
                  <FaMoon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>          
                {/* Notifications */}
                

                {/* User Profile */}
                {currentUser ? (
                  <div className="relative">
                    <Dropdown
                      arrowIcon={false}
                      inline
                      label={
                        <div className="flex items-center space-x-3 cursor-pointer group">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-500 group-hover:border-fuchsia-600 transition-all duration-200 shadow-md">
                            <img
                              src={currentUser.profilePicture}
                              alt="user"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                            {currentUser.firstname} {currentUser.lastname}
                          </span>
                        </div>
                      }
                    >
                      <Dropdown.Header>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {currentUser.firstname} {currentUser.lastname}
                        </span>
                        <span className="block text-sm text-gray-500 truncate">
                          {currentUser.email}
                        </span>
                      </Dropdown.Header>
                      <Link to="/dashboard?tab=profile">
                        <Dropdown.Item className="text-gray-700 dark:text-gray-200 hover:bg-fuchsia-50 dark:hover:bg-gray-700">
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-all duration-200 shadow-md"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "profile" && <DashProfile />}
          </div>
          { currentUser.isAdmin? ( <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "dashboard" && <Admindashboard />}
          </div>
          ):(
             <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "dashboard" && <UserDashboard />}
          </div>
          )
        }

         
          <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "price" && <SetPrice />}
          </div>
          <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "allprice" && <Prices />}
          </div>
          {currentUser.isAdmin&&(

          <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "users" && <UserManagement />}
          </div>
          )
}
          <div className="w-full max-w-[95%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {tab === "admindashboard" && currentUser?.isAdmin && <Admindashboard />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
