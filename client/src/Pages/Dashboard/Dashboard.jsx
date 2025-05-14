
import { Navigate, useLocation, } from "react-router-dom"
import DashProfile from "./DashProfile";
import {DashSidebar} from "./DashSidebar";
import DashPosts from "./DashPosts";
import DashUsers from "./DashUsers";
import ComplatedUsers from "./complatedUsers";
import {  useEffect, useState } from "react";
import DashboardComponent from "./DashboardComponent";
import { useNavigate } from "react-router-dom";
import {log} from '../../assets';
import MediaReview from './MediaReview';
import EligibleUsersPage from "./EligibleUsers";
import RejectedUsersPage from "./RejectedUsers";
import Add_employee from "./Add_Employee";
import Customers from "./Customers";
import Employees from "./Employees";
import Orders from "./Orders"
const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
        if(tabFromUrl){
          setTab(tabFromUrl);}
          else{
            navigate('/dashboard?tab=profile')
          }
  }, [location.search, navigate]);


  return (
    <div className=" flex md:flex-row  flex-col   h-auto
    "
    style={{
            backgroundImage: `url(${log})`, // Path to the image
            backgroundSize: 'cover', // Makes the image cover the entire element
            backgroundPosition: 'center', // Centers the image
            height: 'auto', // Make the container take up the full height of the screen
            width: '100%', // Full width of the screen
          }}>
      {/* sidebar*/}
      <div>
        <DashSidebar />
      </div>

      {/* profile */}
      {tab==='profile' && <DashProfile />}
       {/* Employees */}
      {tab==='employees' && <Employees />}
       {/* Add_employee */}
      {tab==='add_employee' && <Add_employee/>}
       {/* Orders*/}
      {tab==='orders' && <Orders />}
       {/* Customers */}
      {tab==='customers' && <Customers/>}
      {/* posts */}
      {tab==='posts' && <DashPosts />}
      {/* users */}
      {tab==='users' && <DashUsers />}
      {/* comments */}
      {tab==='complatedusers' && <ComplatedUsers/>}
      {/* eligible users */}
      {tab==='acceptedusers' && <EligibleUsersPage/>}
      {/* rejected users */}
      {tab==='rejectedusers' && <RejectedUsersPage/>}
      {/* media review */}
      {/*dashboard comp*/}
      {tab==='dash' &&<DashboardComponent/>
      }
      {/* media review */}
      {tab === 'mediareview' && <MediaReview />}


    </div>
  );
}

export default Dashboard;
