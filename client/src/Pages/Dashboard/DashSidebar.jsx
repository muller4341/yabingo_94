import { Sidebar } from "flowbite-react";
//import { BiBuoy } from 'react-icons/bi';
import {
  HiAnnotation,
  HiArrowSmRight,
  HiChartPie,
  HiDocumentText,
  HiOutlineUserGroup,
  HiUser,
  HiUserGroup,
} from "react-icons/hi";

import { AiOutlineUsergroupAdd } from "react-icons/ai";
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
    <div className="w-64 h-screen bg-fuchsia-800 border rounded-lg mt-0">
      {/* bg-cyan-900 */}
      <div className="w-full h-full  rounded-lg overflow-y-auto">
        <div className="flex flex-col gap-2  p-2">
          <div className=" font-semibold md:text-[18px] text-[14px] text-white flex  p-2  items-center">
            {" "}
            <HiUser />
            <div className="flex flex-row justify-between  w-full">
              <div className=" text-yellow-300">
                {currentUser.firstname} {currentUser.lastname}
              </div>
              <div className="bg-gray-50 text-green-400 rounded-md">
                {currentUser.role}
              </div>
            </div>
          </div>

         {currentUser?.role === "admin" && ( <Link to="/dashboard?tab=employees">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "employees" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser /> Employees
              </div>
            </div>
          </Link>
         )}
          {currentUser?.role === "marketing" && ( <Link to="/dashboard?tab=add_distributor">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "add_distributor" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser /> Add Distributor
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
                <div className="flex gap-2 justify-center items-center">
                  {" "}
                  <HiUser /> Add Employee
                </div>
              </div>
            </Link>
          )}
          <li className=" flex flex-col">
            {/* Top-level menu item */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center w-full p-2 text-[14px] md:text-[18px] text-white hover:bg-fuchsia-600 rounded-md"
            >
              <AiOutlineUsergroupAdd className="text-fuchsia-400" />
              <span className="ml-3">Customers</span>
            </button>

            {/* Submenu */}
            {isOpen && (
              <ul className="flex flex-col ml-6 mt-1 space-y-1">
                 <Link to="/dashboard?tab=distributors">
                  <div
              
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      tab === "distributors" ? "bg-fuchsia-600" : ""
                    } text-white font-semibold md:text-[18px] text-[14px]`}
                  >
                    <div className="flex gap-2 items-center">
                      <HiUserGroup />
                      Distributors
                    </div>
                  </div>
                </Link>
                <Link to="/dashboard?tab=users">
                  <div
                    
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      tab === "users" ? "bg-fuchsia-600" : ""
                    } text-white font-semibold md:text-[18px] text-[14px]`}
                  >
                    <div className="flex gap-2 items-center">
                      <HiUser />
                      Users
                    </div>
                  </div>
               </Link>
              </ul>
            )}
          </li>
          <Link to="/dashboard?tab=orders">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "orders" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
                Orders
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=admin_dashboard">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "admin_dashboard" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
                Dashboard
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
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
                Payments
              </div>
            </div>
          </Link>
          <Link to="/dashboard?tab=prices">
            <div
              className={`flex items-center justify-between p-2 rounded 
 ${
   tab === "prices" ? "bg-fuchsia-600" : ""
 } text-white  font-semibold md:text-[18px] text-[14px]`}
            >
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
                Prices
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
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
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
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
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
              <div className="flex gap-2 justify-center items-center">
                {" "}
                <HiUser />
                Stocks
              </div>
            </div>
          </Link>

          {currentUser?.role === "admin" && (
            <>
              <Link to="/dashboard?tab=dash">
                <div
                  className={`flex items-center justify-between p-2 rounded ${
                    tab === "dash" || !tab ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiChartPie />
                  Overview
                </div>
              </Link>

              <Link to="/dashboard?tab=posts">
                <div
                  className={`flex items-center gap-2 p-2 rounded ${
                    tab === "posts" ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiDocumentText />
                  Tasks
                </div>
              </Link>

              <Link to="/dashboard?tab=users">
                <div
                  className={`flex items-center gap-2 p-2 rounded ${
                    tab === "users" ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiOutlineUserGroup />
                  Users
                </div>
              </Link>

              <Link to="/dashboard?tab=acceptedusers">
                <div
                  className={`flex items-center gap-2 p-2 rounded ${
                    tab === "acceptedusers" ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiOutlineUserGroup />
                  Accepted Users
                </div>
              </Link>

              <Link to="/dashboard?tab=rejectedusers">
                <div
                  className={`flex items-center gap-2 p-2 rounded ${
                    tab === "rejectedusers" ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiOutlineUserGroup />
                  Rejected Users
                </div>
              </Link>

              <Link to="/dashboard?tab=complatedusers">
                <div
                  className={`flex items-center gap-2 p-2 rounded ${
                    tab === "complatedusers" ? "bg-white" : ""
                  } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
                >
                  <HiAnnotation />
                  Pending Users
                </div>
              </Link>
            </>
          )}

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
