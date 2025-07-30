import { Sidebar } from "flowbite-react";
//import { BiBuoy } from 'react-icons/bi';
import {
  HiArrowSmRight,
  HiUserGroup,
  HiUserAdd,
  HiUsers,
  HiChartBar,
  HiTruck,
  HiUserCircle,
  HiClipboardList,
  HiHome,
  HiTag,
  HiCube,
  HiBriefcase,
  HiCreditCard,
  HiIdentification,
  HiShoppingCart,
  HiCurrencyDollar,
  HiDocumentReport,
  HiShieldCheck,
  HiCog,
  HiLogout,
  HiViewGrid,
  HiCollection,
  HiCash,
  HiDocumentAdd,
  HiUser,
  HiShoppingBag,
  HiDocumentText,
  HiChartPie,
  HiKey,
  HiArchive
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOutSuccess } from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleNavigate = (value) => {
    navigate(`/dashboard?tab=${value}`);
  };

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
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Icon mapping for sidebar items
  const iconMap = {
    dashboard: <HiViewGrid className="w-7 h-7" />, // Dashboard
    play: <HiChartPie className="w-7 h-7" />, // Play
    users: <HiUsers className="w-7 h-7" />, // Users
    allprice: <HiCurrencyDollar className="w-7 h-7" />, // All Prices
    price: <HiTag className="w-7 h-7" />, // Price
    logout: <HiLogout className="w-7 h-7" />, // Logout
  };

  return (
    <aside className="h-full w-full min-h-screen bg-gradient-to-br from-red-600 via-yellow-400 to-yellow-600 shadow-2xl border-r border-fuchsia-100 dark:border-gray-800 flex flex-col px-0 py-0">
      {/* Logo/Title */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-fuchsia-100 dark:border-gray-800">
        <HiCube className="w-9 h-9 text-white drop-shadow-lg" />
        <span className="text-xl font-extrabold text-white tracking-tight drop-shadow">Bingo</span>
      </div>
      {/* User Info */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-fuchsia-50 dark:border-gray-800">
        <HiUserCircle className="w-10 h-10 text-white drop-shadow" />
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold truncate max-w-[120px] md:max-w-none">{currentUser.firstname} {currentUser.lastname}</span>
          <span className="text-xs text-yellow-100 truncate">{currentUser.email}</span>
        </div>
      </div>
      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-1 py-4 px-2">
        <Link to="/dashboard?tab=dashboard">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base group
              ${tab === "dashboard" ? "bg-white/20 text-white shadow-md border-l-4 border-white" : "hover:bg-white/10 hover:text-yellow-100 text-white"}`}
          >
            {iconMap.dashboard}
            <span className="truncate">Dashboard</span>
          </div>
        </Link>
        <Link to="/play">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base group
              ${tab === "play" ? "bg-white/20 text-white shadow-md border-l-4 border-white" : "hover:bg-white/10 hover:text-yellow-100 text-white"}`}
          >
            {iconMap.play}
            <span className="truncate">Play</span>
          </div>
        </Link>
        {currentUser.isAdmin && (
          <Link to="/dashboard?tab=users">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base group
                ${tab === "users" ? "bg-white/20 text-white shadow-md border-l-4 border-white" : "hover:bg-white/10 hover:text-yellow-100 text-white"}`}
            >
              {iconMap.users}
              <span className="truncate">Users</span>
            </div>
          </Link>
        )}
        {currentUser.isAdmin ? (
          <Link to="/dashboard?tab=allprice">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base group
                ${tab === "allprice" ? "bg-white/20 text-white shadow-md border-l-4 border-white" : "hover:bg-white/10 hover:text-yellow-100 text-white"}`}
            >
              {iconMap.allprice}
              <span className="truncate">All Prices</span>
            </div>
          </Link>
        ) : (
          <Link to="/dashboard?tab=price">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base group
                ${tab === "price" ? "bg-white/20 text-white shadow-md border-l-4 border-white" : "hover:bg-white/10 hover:text-yellow-100 text-white"}`}
            >
              {iconMap.price}
              <span className="truncate">Price</span>
            </div>
          </Link>
        )}
      </nav>
      {/* Logout */}
      <div className="mt-auto px-2 pb-6">
        <button
          onClick={handelSignOut}
          className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl cursor-pointer text-white font-semibold text-base bg-red-500/80 hover:bg-red-600/90 transition-all duration-200 shadow group"
        >
          {iconMap.logout}
          <span className="truncate">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
