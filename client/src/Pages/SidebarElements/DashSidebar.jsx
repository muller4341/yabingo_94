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
    <div className="w-78 h-screen bg-fuchsia-800 border rounded-lg mt-0 dark:bg-gray-900 dark:border-gray-700">
      {/* bg-cyan-900 */}
      <div className="w-full h-full  rounded-lg overflow-y-auto">
        <div className="flex flex-col gap-2  p-2">
          <div className=" font-semibold md:text-[18px] text-[14px] text-white flex  p-2  items-center gap-4">
            {" "}
            <HiUserCircle className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
            <div className="flex flex-row justify-between  w-full">
              <div className=" text-yellow-300">
                {currentUser.firstname} {currentUser.lastname}
              </div>
              <div className="bg-gray-50 text-green-400 rounded-md">
                {currentUser.role}
              </div>
            </div>
          </div>
           <Link to="/dashboard?tab=dashboard">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "dashboard" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiCollection className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Dashboard
              </div>
            </div>
          </Link>
          {(currentUser?.role === "admin" ||
            currentUser?.role === "production") && (
           <Link to="/dashboard?tab=product">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "product" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiCollection className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Products
              </div>
            </div>
          </Link>
            )}
          {currentUser?.role === "production" && (
            <Link to="/dashboard?tab=addproduction">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "addproduction" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiDocumentAdd className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Add production
                </div>
              </div>
            </Link>
          )}
           {(currentUser?.role === "admin" ||
            currentUser?.role === "finance") && (
            <Link to="/dashboard?tab=prices">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "prices" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiCash className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Prices
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "finance" && (
            <Link to="/dashboard?tab=addprices">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "addprices" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiCurrencyDollar className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                 Add Prices
                </div>
              </div>
            </Link>
          )}
         

          {currentUser?.role === "admin" && (
            <Link to="/dashboard?tab=employees">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "employees" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUsers className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Employees
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "marketing" && (
            <Link to="/dashboard?tab=add_distributor">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "add_distributor" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Add Distributor
                </div>
              </div>
            </Link>
          )}
          {(currentUser?.role === "guest" ||
            currentUser?.role === "customer") && (
            <Link to="/dashboard?tab=distributoraccount">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "distributoraccount" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  + Distributor Account
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "guest" && (
            <Link to="/dashboard?tab=customeraccount">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "customeraccount" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  + Customer Account
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "admin" && (
            <Link to="/dashboard?tab=add_employee">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "add_employee" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Add Employee
                </div>
              </div>
            </Link>
          )}

          {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing") && (
            <Link to="/dashboard?tab=distributors">
                    <div
                      className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                        tab === "distributors" ? "bg-fuchsia-600" : ""
                      } text-white font-semibold md:text-[18px] text-[14px]`}
                    >
                      <div className="flex gap-4 justify-center items-center">
                        <HiTruck className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                        Distributors
                      </div>
                    </div>
                  </Link>
          )}

          {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing") && (
            <Link to="/dashboard?tab=customer">
              <div
                className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                  tab === "customer" ? "bg-fuchsia-600" : ""
                } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUser className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                  Customers
                </div>
              </div>
            </Link>
          )}

          {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing"  ||
            currentUser?.role === "customer"  ||
            currentUser?.role === "distributor") && (
          <Link to="/dashboard?tab=order">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "order" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiShoppingBag className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Orders
              </div>
            </div>
          </Link>
            )}
             {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing"  ||
            currentUser?.role === "customer"  ||
            currentUser?.role === "distributor") && (
          <Link to="/dashboard?tab=payments">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "payments" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiCreditCard className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Payments
              </div>
            </div>
          </Link>
            )}
          {currentUser?.role === "admin" &&(
          <Link to="/dashboard?tab=reports">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "reports" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiDocumentReport className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Reports
              </div>
            </div>
          </Link>
          )}
           {currentUser?.role === "admin" && (
          <Link to="/dashboard?tab=roles">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "roles" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiShieldCheck className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Roles
              </div>
            </div>
          </Link>
            )}
          <Link to="/dashboard?tab=stocks">
            <div
              className={`flex items-center justify-between p-2 rounded hover:bg-fuchsia-700 transition-colors duration-200 ${
                tab === "stocks" ? "bg-fuchsia-600" : ""
              } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiArchive className="w-12 h-10 hover:text-yellow-300 transition-colors duration-200" />
                Stocks
              </div>
            </div>
          </Link>

          <div
            onClick={handelSignOut}
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-red-800 font-semibold md:text-[18px] text-[14px] bg-slate-50 hover:bg-red-50 transition-colors duration-200"
          >
            <HiLogout className="w-12 h-10 hover:text-red-600 transition-colors duration-200" />
            Log Out
          </div>
        </div>
      </div>
    </div>
  );
}
