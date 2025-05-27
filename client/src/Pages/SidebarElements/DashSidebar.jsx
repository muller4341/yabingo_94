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
            <HiUserCircle className="w-12 h-10" />
            <div className="flex flex-row justify-between  w-full">
              <div className=" text-yellow-300">
                {currentUser.firstname} {currentUser.lastname}
              </div>
              <div className="bg-gray-50 text-green-400 rounded-md">
                {currentUser.role}
              </div>
            </div>
          </div>
          {currentUser?.role === "production" && (
            <Link to="/dashboard?tab=addproduction">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "addproduction" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiHome className="w-12 h-10" />
                  Add production
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "finance" && (
            <Link to="/dashboard?tab=addprices">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "addprices" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiHome className="w-12 h-10" />
                 Add Prices
                </div>
              </div>
            </Link>
          )}
          {(currentUser?.role === "admin" ||
            currentUser?.role === "finance") && (
            <Link to="/dashboard?tab=prices">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "prices" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10" /> Prices
                </div>
              </div>
            </Link>
          )}

          {currentUser?.role === "admin" && (
            <Link to="/dashboard?tab=admin_dashboard">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "admin_dashboard" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiHome className="w-12 h-10" />
                  Dashboard
                </div>
              </div>
            </Link>
          )}

          {currentUser?.role === "admin" && (
            <Link to="/dashboard?tab=employees">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "employees" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiBriefcase className="w-12 h-10" /> Employees
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "marketing" && (
            <Link to="/dashboard?tab=add_distributor">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "add_distributor" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10" /> Add Distributor
                </div>
              </div>
            </Link>
          )}
          {(currentUser?.role === "guest" ||
            currentUser?.role === "customer") && (
            <Link to="/dashboard?tab=distributoraccount">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "distributoraccount" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10" /> + Distributor Account
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "guest" && (
            <Link to="/dashboard?tab=customeraccount">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "customeraccount" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10" /> + Customer Account
                </div>
              </div>
            </Link>
          )}
          {currentUser?.role === "admin" && (
            <Link to="/dashboard?tab=add_employee">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "add_employee" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiUserAdd className="w-12 h-10" /> Add Employee
                </div>
              </div>
            </Link>
          )}

          {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing") && (
            <Link to="/dashboard?tab=distributors">
                    <div
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        tab === "distributors" ? "bg-fuchsia-600" : ""
                      } text-white font-semibold md:text-[18px] text-[14px]`}
                    >
                      <div className="flex gap-3 items-center">
                        <HiTruck className="w-8 h-6" />
                        Distributors
                      </div>
                    </div>
                  </Link>
          )}

          {(currentUser?.role === "admin" ||
            currentUser?.role === "marketing") && (
            <Link to="/dashboard?tab=customer">
              <div
                className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "customer" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
              >
                <div className="flex gap-4 justify-center items-center">
                  {" "}
                  <HiClipboardList className="w-12 h-10" />
                  Customers
                </div>
              </div>
            </Link>
          )}

          <Link to="/dashboard?tab=orders">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "orders" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiClipboardList className="w-12 h-10" />
                Orders
              </div>
            </div>
          </Link>
           <Link to="/dashboard?tab=product">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "product" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiClipboardList className="w-12 h-10" />
                Products
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=payments">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "payments" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiCreditCard className="w-12 h-10" />
                Payments
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=reports">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "reports" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiChartBar className="w-12 h-10" />
                Reports
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=roles">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "roles" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiUserGroup className="w-12 h-12" />
                Roles
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=stocks">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "stocks" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-4 justify-center items-center">
                {" "}
                <HiCube className="w-12 h-10" />
                Stocks
              </div>
            </div>
          </Link>

          <div
            onClick={handelSignOut}
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-red-800 font-semibold md:text-[18px] text-[14px] bg-slate-50"
          >
            <HiArrowSmRight />
            Log Out
          </div>
        </div>
      </div>
    </div>
  );
}
