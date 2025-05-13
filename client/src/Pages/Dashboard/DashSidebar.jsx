

import { Sidebar } from 'flowbite-react';
//import { BiBuoy } from 'react-icons/bi';
import { HiAnnotation, HiArrowSmRight, HiChartPie, HiDocumentText, HiOutlineUserGroup, HiUser,  } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { signOutSuccess } from '../../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export function DashSidebar() {
    const location = useLocation();   
    const dispatch = useDispatch();
    const {currentUser }= useSelector((state) => state.user);
  const [tab, setTab] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
        if(tabFromUrl){
          setTab(tabFromUrl);}
  }, [location.search]);

  const handelSignOut = async () => {
    try {
      const res= await fetch(`/api/user/signout`,{
        method: 'POST',
      });  
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        
        dispatch(signOutSuccess());
        navigate('/');
       
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    
    <div className="w-64 h-screen bg-fuchsia-800 border rounded-lg mt-0">
      {/* bg-cyan-900 */}
  <div className="w-full h-full  rounded-lg overflow-y-auto">
    <div className="flex flex-col gap-2  p-2">

      <Link to="/dashboard?tab=profile">
        <div
          className={`flex items-center gap-2 p-2 rounded 
 ${
            tab === 'profile' ? 'bg-gray-800' : ''
          } text-white  font-semibold md:text-[18px] text-[14px]`}
        > 
          <HiUser />  profile
          {currentUser.isAdmin ? 'Admin' : 'User'}
        </div>
      </Link>

      {currentUser.isAdmin && (
        <>
          <Link to="/dashboard?tab=dash">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'dash' || !tab ? 'bg-white' : ''
              } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
            >
              <HiChartPie />
              Overview
            </div>
          </Link>

          <Link to="/dashboard?tab=posts">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'posts' ? 'bg-white' : ''
              } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
            >
              <HiDocumentText />
              Tasks
            </div>
          </Link>

          <Link to="/dashboard?tab=users">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'users' ? 'bg-white' : ''
              } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
            >
              <HiOutlineUserGroup />
              Users
            </div>
          </Link>

          <Link to="/dashboard?tab=acceptedusers">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'acceptedusers' ? 'bg-white' : ''
              } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
            >
              <HiOutlineUserGroup />
              Accepted Users
            </div>
          </Link>

          <Link to="/dashboard?tab=rejectedusers">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'rejectedusers' ? 'bg-white' : ''
              } text-fuchsia-900 font-semibold md:text-[18px] text-[14px]`}
            >
              <HiOutlineUserGroup />
              Rejected Users
            </div>
          </Link>

          <Link to="/dashboard?tab=complatedusers">
            <div
              className={`flex items-center gap-2 p-2 rounded ${
                tab === 'complatedusers' ? 'bg-white' : ''
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
        className="flex items-center gap-2 p-2 rounded cursor-pointer text-red-800 font-semibold md:text-[18px] text-[14px]"
      >
        <HiArrowSmRight />
        Log Out
      </div>
    </div>
  </div>
</div>

    
  );
}
