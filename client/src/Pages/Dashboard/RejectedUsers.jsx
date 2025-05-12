import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setRejectedUsers } from '../../redux/mediaReview/mediaReviewSlice';
import { Table, Alert, Spinner, Badge } from 'flowbite-react';
import { log } from '../../assets';

const RejectedUsersPage = () => {
  const dispatch = useDispatch();
  const rejectedUsers = useSelector((state) => state.mediaReview.rejectedUsers || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRejectedUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/users/rejected');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch rejected users');
        }

        dispatch(setRejectedUsers(
          Array.isArray(data.users) ? data.users.map(user => ({
            phoneNumber: user.phoneNumber,
            fullName: `${user.firstname} ${user.lastname}`,
            luckyNumber: user.luckyNumber,
            statusText: 'rejected',
            _id: user._id
          })) : []
        ));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRejectedUsers();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-3 text-gray-500">Loading rejected users...</span>
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

  if (rejectedUsers.length === 0) {
    return (
      <div className="p-4">
        <Alert color="info">
          No rejected users found.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center w-full">
      <div className='md:w-1/2  border rounded-lg  border-fuchsia-800  w-full md:p-4 p-1'>
      <div className="flex justify-between items-center mb-4 gap-2 md:gap-6">
        <h2 className="text-2xl font-bold text-fuchsia-800 md:text-[24px] text-[18px]">Rejected Users</h2>
        <Badge color="failure" size="lg" className='rounded-lg bg-fuchsia-100 '>
          Total: {rejectedUsers.length}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="text-fuchsia-800" style={{
                                                        backgroundImage: `url(${log})`,
                                                      
                                                        }}>Phone</Table.HeadCell>
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
            {rejectedUsers.map(user => (
              <Table.Row key={user._id} className=" hover:bg-gray-50">
                <Table.Cell className="text-fuchsia-800">{user.phoneNumber}</Table.Cell>
                <Table.Cell className="text-fuchsia-800">{user.fullName}</Table.Cell>
                <Table.Cell className="text-fuchsia-800">{user.luckyNumber}</Table.Cell>
                <Table.Cell className="text-fuchsia-800">
                  <Badge color="failure" className='rounded-lg bg-fuchsia-100 '>Rejected</Badge>
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

export default RejectedUsersPage;