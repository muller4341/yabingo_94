import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { markUserEligible } from '../../redux/mediaReview/mediaReviewSlice';
import { Table, Alert, Spinner, Badge } from 'flowbite-react';
import { log } from '../../assets';

const EligibleUsersPage = () => {
  const dispatch = useDispatch();
  const eligibleUsers = useSelector((state) => state.mediaReview.eligibleUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  // Fetch eligible users from the server
  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/users/eligible');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success) {
          // Transform data to match expected format
          const formattedUsers = data.users.map(user => ({
            phoneNumber: user.phoneNumber,
            fullName: `${user.firstname} ${user.lastname}`,
            firstname: user.firstname,
            lastname: user.lastname,
            luckyNumber: user.luckyNumber,
            statusText: 'accepted',
            _id: user._id
          }));
          dispatch(markUserEligible(formattedUsers));
        } else {
          throw new Error(data.message || 'Failed to fetch eligible users');
        }
      } catch (err) {
        console.error('Error fetching eligible users:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEligibleUsers();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3 text-gray-500">Loading eligible users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  if (eligibleUsers.length === 0) {
    return (
      <div className="p-4">
        <Alert color="info">
          No eligible users found. All tasks must be approved to appear here.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full">
      <div className='md:w-1/2  border rounded-lg  border-fuchsia-800  w-full md:p-4 p-1'>
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="md:text-[24px] text-[18px] font-bold text-fuchsia-800">Eligible Users </h2>
        <Badge color="fuchsia" size="lg" className='rounded-lg bg-fuchsia-100 '>
          Total: {eligibleUsers.length}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="text-fuchsia-800" style={{
                                            backgroundImage: `url(${log})`,
                                          
                                            }}>Phone Number</Table.HeadCell>
            <Table.HeadCell className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}>Full Name</Table.HeadCell>
            <Table.HeadCell className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}>Lucky Number</Table.HeadCell>
            <Table.HeadCell className="text-fuchsia-800" style={{
                                backgroundImage: `url(${log})`,
                              
                                }}>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {eligibleUsers.map(user => (
              <Table.Row key={user._id} className=" hover:bg-gray-50">
                <Table.Cell className='text-fuchsia-800'>{user.phoneNumber}</Table.Cell>
                <Table.Cell className='text-fuchsia-800'>{user.firstname}  {user.lastname}</Table.Cell>
                <Table.Cell  className='text-fuchsia-800'>{user.luckyNumber}</Table.Cell>
                <Table.Cell className='text-fuchsia-800'>
                  <Badge color="success" className="w-20 justify-center bg-fuchsia-100 ">
                    Accepted
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      </div>
    </div>
  );
};

export default EligibleUsersPage;