import { Button, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { HiAnnotation, HiArrowSmUp, HiDocument, HiDocumentText, HiOutlineUserGroup } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { log } from '../../assets';
const DashboardComponent = () => {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [acceptedUsers, setAcceptedUsers] = useState([]);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPendingUsers, setTotalPendingUsers] = useState(0);
    const [totalAcceptedUsers, setTotalAcceptedUsers] = useState(0);
    const [totalRejectedUsers, setTotalRejectedUsers] = useState(0);
 
    const [lastMonthUsers, setLastMonthUsers] = useState(0);
   
    const [lastMonthAcceptedUsers, setLastMonthAcceptedUsers] = useState(0);
    const [lastMonthRejectedUsers, setLastMonthRejectedUsers] = useState(0);
    const [lastMonthPendingUsers, setLastMonthPendingUsers] = useState(0);
      const currentUser = useSelector((state) => state.user.currentUser);
      useEffect(() => {
        const fetchUsers = async () => {
            try {
            const res = await fetch('/api/user/getusers?limit=5');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
                setTotalUsers(data.totalUsers);
                setLastMonthUsers(data.lastMonthUsers);
                console.log('lastMonthUsers:', data.lastMonthUsers);
            }
        }
    
     catch (error) {
        console.log(error.message);
    }
        }
        const fetchPending = async () => {
            try{
            const res = await fetch('/api/admin/users/totalpending?limit=5');
            const data = await res.json();
            if (res.ok) {
                setPosts(data.pendingUsers);
                setTotalPendingUsers(data.totalPendingUsers);
                setLastMonthPendingUsers(data.lastMonthPendingUsers);
                console.log('lastMonthpendingUsers:', data.lastMonthPendingUsers);

        }
    }catch (error) {
        console.log(error.message);
        }
    }
    const fetchAccepted = async () => {
        try{
        const res = await fetch('/api/admin/users/totalaccepted?limit=5');
        const data = await res.json();
        if (res.ok) {
            setPosts(data.acceptedUsers);
            setTotalAcceptedUsers(data.totalAcceptedUsers);
            setLastMonthAcceptedUsers(data.lastMonthAcceptedUsers);
    }
}catch (error) {
    console.log(error.message);
    }
}
    
        const fetchRejected = async () => {
                try {
            const res = await fetch('/api/admin/users/totalrejected?limit=5');
            const data = await res.json();
            if (res.ok) {
                setComments(data.rejectedUsers);
                setTotalRejectedUsers(data.totalRejectedUsers);
                setLastMonthRejectedUsers(data.lastMonthRejectedUsers);
            }
        }
        catch (error) {
            console.log(error.message);
        } 

        }
        if (currentUser.isAdmin) {
        fetchUsers();
        fetchPending();
        fetchAccepted();
        fetchRejected();
        }
        
    }
    , [currentUser] );
    



    


    return (
        <div className='p-3 md:mx-auto'>
         <div className='flex-wrap gap-4 flex justify-center '>
        <div className='flex flex-col p3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-lg shadow-md border border-fuchsia-800'>
            <div className='flex justify-between'>
                <div className=" ">
                    <h3 className='text-fuchsia-800 text-md font-bold '>Total Users</h3>
                    <p className='text-2x1 text-yellow-800'>{totalUsers}</p>
                </div>
                    <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-[30px] p3 shadow-lg'/> 
            </div>
                <div className='flex gap-2 text-sm'>
                    <span className=" text-green-500 flex items-center">
                        <HiArrowSmUp/>
                       {lastMonthUsers}
                    </span>
                    <div className='text-fuchsia-800'> Last moth users </div>
                </div>
        </div>
        <div className='flex flex-col p3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-lg shadow-md border border-fuchsia-800'>
            <div className='flex justify-between'>
                <div className="">
                    <h3 className='text-fuchsia-800 text-md font-bold '>Total Accepted Users</h3>
                    <p className='text-2x1 text-yellow-800' >{totalAcceptedUsers}</p>
                </div>
                <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-[30px] p3 shadow-lg'/> 
            </div>
                <div className='flex gap-2 text-sm'>
                    <span className=" text-green-500 flex items-center">
                        <HiArrowSmUp/>
                       {lastMonthAcceptedUsers}
                    </span>
                    <div className='text-fuchsia-800'> Last moth Accepted Users </div>
                </div>
        </div>
        <div className='flex flex-col p3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-lg shadow-md border border-fuchsia-800'>
            <div className='flex justify-between'>
                <div className="">
                    <h3 className='text-fuchsia-800 text-md font-bold '>Total Rejectes Users</h3>
                    <p className='text-2x1 text-yellow-800'>{totalRejectedUsers}</p>
                </div>
                <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-[30px] p3 shadow-lg'/>
            </div>
                <div className='flex gap-2 text-sm'>
                    <span className=" text-green-500 flex items-center">
                        <HiArrowSmUp/>
                       {lastMonthRejectedUsers}
                    </span>
                    <div className='text-fuchsia-800'> Last moth Rejectes Users </div>
                </div>
        </div>
        <div className='flex flex-col p3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-lg shadow-md border border-fuchsia-800'>
            <div className='flex justify-between'>
                <div className="">
                    <h3 className='text-fuchsia-800 text-md font-bold '>Total pending Users</h3>
                    <p className='text-2x1 text-yellow-800'>{totalPendingUsers}</p>
                </div>
                <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-[30px] p3 shadow-lg'/>
            </div>
                <div className='flex gap-2 text-sm'>
                    <span className=" text-green-500 flex items-center">
                        <HiArrowSmUp/>
                       {lastMonthPendingUsers}
                    </span>
                    <div className='text-fuchsia-800'> Last month pending Users </div>
                </div>
        </div>
        
        </div>
        <div className=' flex flex-wrap gap-4 justify-center py-3 mx-auto'>
            <div className='flex flex-col p-2  gap-4 md:w-auto w-full rounded-lg shadow-md border border-fuchsia-800'>
                <div className=' flex justify-between p-3 text-sm font-semibold'>
                    <h1 className='text-center p-2 text-fuchsia-800'>Recent users</h1>
                    <Button  className='bg-fuchsia-800 text-white hover:bg-fuchsia-900'>
                        <Link to={"/dashboard?tab=users"}>View all </Link>
                    </Button>
                </div>
                <Table hoverable>
                    <Table.Head>
                        <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'> User image </Table.HeadCell>
                        <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'> User name</Table.HeadCell>
                    </Table.Head>
                    {users && users.map((user) => (
                    <Table.Body key={user._id} className='divide-y'>
                        <Table.Row className=' dark:border-gray-700 dark:bg-gray-800'>
                            <Table.Cell>
                                <img src={user.profilePicture} alt="user" className='w-10 h-10 rounded-full bg-gray-500'/>
                            </Table.Cell>
                            <Table.Cell className='text-fuchsia-800'>
                                {user.firstname} {user.lastname}
                            </Table.Cell>
                        </Table.Row>
                        
                            
                    
                    </Table.Body>
                    ))}
                         

                </Table>
            </div>
            <div className='flex flex-col p-2 dark:bg-gray-800 gap-4 md:w-auto w-full rounded-lg shadow-md border border-fuchsia-800'>
                <div className=' flex justify-between p-3 text-sm font-semibold'>
                    <h1 className='text-center p-2 text-fuchsia-800'>Recent accepted users</h1>
                    <Button  className='bg-fuchsia-800 text-white hover:bg-fuchsia-900'>
                        <Link to={"/dashboard?tab=acceptedusers"}>View all </Link>
                    </Button>
                </div>
                <Table hoverable>
  <Table.Head>
    <Table.HeadCell   style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'>User image</Table.HeadCell>
    <Table.HeadCell  style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }} className='text-fuchsia-800'>User name</Table.HeadCell>
  </Table.Head>

  <Table.Body className="divide-y">
    {users && users
      .filter(user => user.taskFinalStatus === 'accepted')
      .map((user) => (
        <Table.Row key={user._id} className=" dark:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            <img src={user.profilePicture} alt="user" className="w-10 h-10 rounded-full bg-gray-500" />
          </Table.Cell>
          <Table.Cell className="text-fuchsia-800"> 
            {user.firstname} {user.lastname}
          </Table.Cell>
        </Table.Row>
      ))}
  </Table.Body>
</Table>

            </div>
            <div className='flex flex-col p-2 dark:bg-gray-800 gap-4 md:w-auto w-full rounded-lg shadow-md border border-fuchsia-800'>
                <div className=' flex justify-between p-3 text-sm font-semibold'>
                    <h1 className='text-center p-2 text-fuchsia-800'>Recent Rejected Users</h1>
                    <Button  className='bg-fuchsia-800 text-white hover:bg-fuchsia-900'>
                        <Link to={"/dashboard?tab=rejectedusers"}>View all </Link>
                    </Button>
                </div>
                <Table hoverable>
  <Table.Head>
    <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'>User image</Table.HeadCell>
    <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'>User name</Table.HeadCell>
  </Table.Head>

  <Table.Body className="divide-y">
    {users && users
      .filter(user => user.taskFinalStatus === 'rejected')
      .map((user) => (
        <Table.Row key={user._id} className=" dark:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            <img src={user.profilePicture} alt="user" className="w-10 h-10 rounded-full bg-gray-500" />
          </Table.Cell >
          <Table.Cell className='text-fuchsia-800'>
            {user.firstname} {user.lastname}
          </Table.Cell>
        </Table.Row>
      ))}
  </Table.Body>
</Table>

            </div>
            <div className='flex flex-col p-2 dark:bg-gray-800 gap-4 md:w-auto w-fullrounded-lg shadow-md border border-fuchsia-800'>
                <div className=' flex justify-between p-3 text-sm font-semibold'>
                    <h1 className='text-center p-2 text-fuchsia-800'>Recent Pending users</h1>
                    <Button className='bg-fuchsia-800 text-white hover:bg-fuchsia-900'>
                        <Link to={"/dashboard?tab=complatedusers"}>View all </Link>
                    </Button>
                </div>
                <Table hoverable>
  <Table.Head>
    <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'>User image</Table.HeadCell>
    <Table.HeadCell style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}  className='text-fuchsia-800'>User name</Table.HeadCell>
  </Table.Head>

  <Table.Body className="divide-y">
    {users && users
      .filter(user => user.taskFinalStatus === 'pending')
      .map((user) => (
        <Table.Row key={user._id} className=" dark:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            <img src={user.profilePicture} alt="user" className="w-10 h-10 rounded-full bg-gray-500" />
          </Table.Cell>
          <Table.Cell className='text-fuchsia-800'>
            {user.firstname} {user.lastname}
          </Table.Cell>
        </Table.Row>
      ))}
  </Table.Body>
</Table>

            </div>
  
        </div>
      
    
        </div>
    );
    }

export default DashboardComponent;