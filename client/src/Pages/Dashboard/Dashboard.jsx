import { Navigate, useLocation } from "react-router-dom";
import DashProfile from "./Profile";
import { DashSidebar } from "./DashSidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Add_employee from "./Add_Employee";
import Customers from "./Customers";
import Employees from "./Employees";
import Add_Distributor from "./Add_Distributor";
import Orders from "./Orders";
import Admin_Dashboard from "./Admin_Dashboard";
import AcceptedDistributors from "./Distributors/Accepted";
import PendingDistributors from "./Distributors/Pending";
import RejectedDistributors from "./Distributors/Rejected";
import Make_Customer_Account from "./Make_Customer_Account";
import Make_Distributor_Account from "./Make_Distributor_Account";
import Payments from "./Payments";
import Prices from "./Prices";
import Reports from "./Reports";
import Roles from "./Roles";
import Stocks from "./Stocks";
import { Dropdown } from "flowbite-react";
import { useSelector } from "react-redux";
import { FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../../redux/theme/themeSlice";
import { signOutSuccess } from "../../redux/user/userSlice";
import Notification from "./Notification";
const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("");
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState();

  const handleClick = () => {
    console.log("Notification clicked");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      navigate("/dashboard?tab=profile");
    }
  }, [location.search, navigate]);
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
    <div
      className=" flex md:flex-row  flex-col   h-auto overflow-x-hidden w-screen
    "
    >
      {/* sidebar*/}
      <div>
        <DashSidebar />
      </div>
      <div className="flex flex-col w-5/6 ">
        <div className=" ml-10 w-auto h-40 bg-white flex justify-center items-center p-4 gap-4 border-b shadow-sm">
          <input
            type="text"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3 w-2/3 h-1/2 px-3 py-2 rounded-lg shadow-sm border border-gray-50 focus:outline-none focus:ring-1 focus:ring-fuchsia-800"
          />
          <div className="w-1/3  h-1/2 flex justify-center gap-8">
            <div className="flex justify-center w-auto h-auto  items-center">
              <button
                className="w-16 h-12  sm:inline  dark:bg-gray-800 bg-white 
                    dark:hover:bg-gray-900 hover:bg-gray-100 rounded-lg border flex justify-items-center"
                onClick={() => dispatch(toggleTheme())}
              >
                <FaMoon className="text-2xl dark:text-white text-black w-8 h-6 " />
              </button>
            </div>
            <Notification
              count={count}
              setCount={setCount}
              onClick={handleClick}
            />
            <div>
              {currentUser ? (
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <div
                      className=" flex w-[60px] h-[60px] border-1  rounded-full hover:scale-105 transition-transform duration-300 overflow-hidden justify-center items-center
                                        border border-fuchsia-800 bg-white"
                    >
                      <img
                        src={currentUser.profilePicture}
                        alt="user"
                        className="w-1/2 h-2/3 object-cover  "
                      />
                    </div>
                  }
                >
                  <Dropdown.Header>
                    <span className="block text-sm font-medium truncate text-yellow-400 hover:text-yellow-600">
                      {currentUser.firstname} {currentUser.lastname}
                    </span>
                  </Dropdown.Header>
                  <Link to={"/dashboard?tab=profile"}>
                    <Dropdown.Item className="text-yellow-400 hover:bg-fuchsia-100 hover:text-yellow-600 text-sm">
                      Manage Profile
                    </Dropdown.Item>
                  </Link>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handelSignOut}
                    className="text-red-700 hover:bg-fuchsia-100 hover:text-red-900 text-sm font-semibold"
                  >
                    Sign out
                  </Dropdown.Item>
                </Dropdown>
              ) : (
                <Link to="/signin">
                  <button
                    className=" border rounded-lg hover:bg-gray-1000
                                    w-20 h-10 border-gray-400"
                  >
                    <p
                      className="text-[18px] font-[cursive] italic tracking-wide ml-2 hover:text-yellow-600 text-yellow-400"
                      style={{ fontFamily: "Garamond, Georgia, serif" }}
                    >
                      {" "}
                      sign in
                    </p>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* profile */}
        {tab === "profile" && <DashProfile />}
        {/* Employees */}
        {tab === "employees" && <Employees />}
        {/* Make_Distributor_Account */}
        {tab === "distributoraccount" && <Make_Distributor_Account />}
        {/* Make_Customer_Account */}
        {tab === "customeraccount" && <Make_Customer_Account />}
        {/* Add_employee */}
        {tab === "add_employee" && <Add_employee />}
        {/* Add_distributor */}
        {tab === "add_distributor" && <Add_Distributor />}
        {/* Orders*/}
        {tab === "orders" && <Orders />}
        {/* AcceptedDistributors */}
        {tab === "accepteddistributors" && <AcceptedDistributors />}
        {/* RejectedDistributors */}
        {tab === "rejecteddistributors" && <RejectedDistributors />}
        {/* PendingDistributors */}
        {tab === "pendingdistributors" && <PendingDistributors />}
        {/* Single Customer */}
        {tab === "customer" && <Customers />}
        {/* Admin_Dashboard */}
        {tab === "admin_dashboard" && <Admin_Dashboard />}
        {/* Payments */}
        {tab === "payments" && <Payments />}
        {/* Price */}
        {tab === "prices" && <Prices />}
        {/* Reports */}
        {tab === "reports" && <Reports />}
        {/* Roles */}
        {tab === "roles" && <Roles />}
        {/* Stocks */}
        {tab === "stokes" && <Stocks />}
        {tab === "complatedusers" && <ComplatedUsers />}
        {/* eligible users */}
        {tab === "acceptedusers" && <EligibleUsersPage />}
        {/* rejected users */}
        {tab === "rejectedusers" && <RejectedUsersPage />}
        {/*dashboard comp*/}
        {tab === "dash" && <DashboardComponent />}
        {/* media review */}
        {tab === "mediareview" && <MediaReview />}
      </div>
    </div>
  );
};

export default Dashboard;
