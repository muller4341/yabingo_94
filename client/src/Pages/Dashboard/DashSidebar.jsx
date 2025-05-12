

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
    
    <Sidebar aria-label=" with content separator example  " className=' border rounded-lg '>
      <Sidebar.Items className=' w-full h-full overflow-y-auto rounded-lg'>
        <Sidebar.ItemGroup className='flex flex-col md:gap-2  gap-1'>
        
        <Link to='/dashboard?tab=profile'>
        <Sidebar.Item  
        icon={HiUser } 
        label={currentUser.isAdmin ? 'Admin' : 'User'} 
        active={tab==='profile'}
        as='div'
        className="text-fuchsia-900 font-semibold  md:text-[18px] text-[14px] ">
            Profile
          </Sidebar.Item>
          </Link>
          {currentUser.isAdmin &&
           ( <Link to='/dashboard?tab=dash'>
          <Sidebar.Item  
          icon={HiChartPie } label={'dashboard'}
          active={tab==='dash' || !tab}
          as='div'
          className="text-fuchsia-900 font-semibold  md:text-[18px] text-[14px]">
            Overview
          </Sidebar.Item>
          </Link>)
          
          }  

          {currentUser.isAdmin &&
           ( <Link to='/dashboard?tab=posts'>
          <Sidebar.Item  
          icon={HiDocumentText } 
          label={'Tasks'}
         
          active={tab==='posts'}
          as='div'
          className="text-fuchsia-900 font-semibold  md:text-[18px] text-[14px]">
            Tasks
          </Sidebar.Item>
          </Link>)
          
          }  

          {currentUser.isAdmin &&
          ( <Link to='/dashboard?tab=users'>
          <Sidebar.Item  
          icon={HiOutlineUserGroup } label={'users'}
          active={tab==='users'}
          as='div'
          className="text-fuchsia-900 font-semibold  md:text-[18px] text-[14px]">
            Users
          </Sidebar.Item>
          </Link>)
            
            }
            {/* accepted users */}
            {currentUser.isAdmin &&
          ( <Link to='/dashboard?tab=acceptedusers'>
          <Sidebar.Item  
          icon={HiOutlineUserGroup } label={'accepted '}
          active={tab==='acceptedusers'}
          as='div'
          className="text-fuchsia-900 font-semibold  md:text-[18px] text-[14px]">
          Accepted users
          </Sidebar.Item>
          </Link>)
            
            }
            {/* rejected users */}
            {currentUser.isAdmin &&
          ( <Link to='/dashboard?tab=rejectedusers'>
          <Sidebar.Item  
          icon={HiOutlineUserGroup } label={'rejected '}
          active={tab==='rejectedusers'}
          as='div'
          className="text-fuchsia-900  font-semibold  md:text-[18px] text-[14px]">
          Rejected users
          </Sidebar.Item>
          </Link>)
            
            }
            

           
            {currentUser.isAdmin &&
          ( <Link to='/dashboard?tab=complatedusers'>
          <Sidebar.Item  
          icon={HiAnnotation } label={'pending'}
          active={tab==='complatedusers'}
          as='div'
          className="text-fuchsia-900  font-semibold  md:text-[18px] text-[14px]">
          pending Users
          </Sidebar.Item>
          </Link>)
            
            }


        <Sidebar.Item 
         icon={HiArrowSmRight} 
         onClick={handelSignOut}
         className="text-red-800 font-semibold  md:text-[18px] text-[14px]">
          
            Log Out
          </Sidebar.Item>
          
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
    
  );
}
