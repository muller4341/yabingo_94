import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table } from "flowbite-react";
import { useNavigate } from 'react-router-dom';
import { removeUserFromPending } from '../../redux/mediaReview/mediaReviewSlice';


const CompletedUsers = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { pendingUsers } = useSelector((state) => state.mediaReview)
  const [completedUsers, setCompletedUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const fetchCompletedUsers = async () => {
      try {
        const res = await fetch('/api/admin/completed-users');
        const data = await res.json();
        
        if (data.success) {
          // Fix: Access 'data' instead of 'users'
          setCompletedUsers(data.data.map(user => ({
            ...user,
            statusText: user.approvalStatus || 'pending'
          })));
        } else {
          console.warn('Unexpected response format:', data);
        }
      } catch (err) {
        console.error('Error fetching completed users:', err);
      }
    };
  
    fetchCompletedUsers();
  }, []);
  

  // const handleReviewClick = (luckyNumber) => {
  //   // Remove from pending list when going to review
    
  //   navigate(`/dashboard?tab=mediareview&luckyNumber=${user.luckyNumber}`);

  // };
  const handleReviewClick = (user) => {
    if (!user || !user._id) {
      console.error("Invalid user or missing _id", user);
      return;
    }
  
    // Remove user from Redux
    dispatch(removeUserFromPending(user._id));
  
    // Navigate to media review using luckyNumber (if you still use it in the URL)
    navigate(`/dashboard?tab=mediareview&luckyNumber=${user.luckyNumber}`);
  };
  

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin && completedUsers.length > 0 ? (
        <>
          <Table hoverable>
      <Table.Head>
        <Table.HeadCell>First Name</Table.HeadCell>
        <Table.HeadCell>Last Name</Table.HeadCell>
        <Table.HeadCell>Phone Number</Table.HeadCell>
        <Table.HeadCell>Lucky Number</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
      </Table.Head>
      
      <Table.Body className="divide-y">
        {completedUsers.map((user) => (
          <Table.Row key={user.luckyNumber} className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="text-fuchsia-800">{user.firstname}</Table.Cell>
            <Table.Cell className="text-fuchsia-800">{user.lastname}</Table.Cell>
            <Table.Cell className="text-fuchsia-800">{user.phoneNumber}</Table.Cell>
            <Table.Cell className="text-fuchsia-800">{user.luckyNumber}</Table.Cell>
            <Table.Cell className="text-fuchsia-800">
              <button
                onClick={() => handleReviewClick(user)}
                className={`text-white w-16 h-8 rounded-lg ${
                  user.statusText === 'accepted'
                    ? 'bg-green-600 hover:bg-green-700'
                    : user.statusText === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-fuchsia-800 hover:bg-fuchsia-900'
                }`}
              >
                {user.statusText}
              </button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
        </>
      ) : (
        <p>No completed users found.</p>
      )}
    </div>
  );
};

export default CompletedUsers;
