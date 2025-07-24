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

  return (
    <div className="w-64 md:w-[250px] lg:w-[280px] xl:w-[320px] h-full md:h-screen bg-green-800 border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-y-auto">
      {/* bg-cyan-900 */}
      <div className="w-full h-full rounded-lg overflow-y-auto">
        <div className="flex flex-col gap-2 p-2">
          <div className="font-semibold md:text-[18px] text-[14px] text-white flex p-2 items-center gap-2 md:gap-4">
            {" "}
            <HiUserCircle className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
            <div className="flex flex-row justify-between w-full min-w-0">
              <div className="text-yellow-300 truncate max-w-[80px] md:max-w-none">
                {currentUser.firstname} {currentUser.lastname}
              </div>
              
            </div>
          </div>
           <Link to="/dashboard?tab=dashboard">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
                tab === "dashboard" ? "bg-green-800" : ""
              } text-white font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 md:gap-4 justify-center items-center">
                {" "}
                <HiCollection className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
                <span className="truncate">Dashboard</span>
              </div>
            </div>
          </Link>
          <Link to="/play">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
                tab === "play" ? "bg-green-800" : ""
              } text-white font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 md:gap-4 justify-center items-center">
                {" "}
                <HiCollection className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
                <span className="truncate">Play</span>
              </div>
            </div>
            </Link>
            {currentUser.isAdmin && (
            <Link to="/dashboard?tab=admindashboard">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
                  tab === "admindashboard" ? "bg-green-800" : ""
                } text-white font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-2 md:gap-4 justify-center items-center">
                  <HiViewGrid className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
                  <span className="truncate">Admin Dashboard</span>
                </div>
              </div>
            </Link>
          )}
          {currentUser.isAdmin && (
  <Link to="/dashboard?tab=users">
    <div
      className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
        tab === "allprice" ? "bg-green-800" : ""
      } text-white font-semibold md:text-[18px] text-[14px]`}
    >
      <div className="flex gap-2 md:gap-4 justify-center items-center">
        <HiCollection className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
        <span className="truncate">Users</span>
      </div>
    </div>
  </Link>
)
}
          {currentUser.isAdmin ? (
  <Link to="/dashboard?tab=allprice">
    <div
      className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
        tab === "allprice" ? "bg-green-800" : ""
      } text-white font-semibold md:text-[18px] text-[14px]`}
    >
      <div className="flex gap-2 md:gap-4 justify-center items-center">
        <HiCollection className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
        <span className="truncate">All Prices</span>
      </div>
    </div>
  </Link>
) : (
  <Link to="/dashboard?tab=price">
    <div
      className={`flex items-center justify-between p-2 rounded hover:bg-green-700 transition-colors duration-200 ${
        tab === "price" ? "bg-green-800" : ""
      } text-white font-semibold md:text-[18px] text-[14px]`}
    >
      <div className="flex gap-2 md:gap-4 justify-center items-center">
        <HiCollection className="w-10 h-10 md:w-12 md:h-10 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0" />
        <span className="truncate">Price</span>
      </div>
    </div>
  </Link>
)}

            
            
          

          
            
           

          <div
            onClick={handelSignOut}
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-red-800 font-semibold md:text-[18px] text-[14px] bg-slate-50 hover:bg-red-50 transition-colors duration-200"
          >
            <HiLogout className="w-10 h-10 md:w-12 md:h-10 hover:text-red-600 transition-colors duration-200 flex-shrink-0" />
            <span className="truncate">Log Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
