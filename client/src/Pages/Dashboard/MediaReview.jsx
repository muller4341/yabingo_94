import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  updateTaskStatus,
  markUserEligible,
  markUserRejected,
  removeUserFromPending
} from '../../redux/mediaReview/mediaReviewSlice';
import { Table, Alert, Spinner, Badge, Button } from 'flowbite-react';

const MediaReview = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mediaList, setMediaList] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localTaskStatus, setLocalTaskStatus] = useState({});

  const luckyNumber = new URLSearchParams(location.search).get('luckyNumber');

  useEffect(() => {
   
    // Log and verify if luckyNumber is a string
    console.log("luckyNumber:", luckyNumber);  
    // This should log the correct luckyNumber
    console.log('location.search:', location.search);

    if (typeof luckyNumber === 'string' && luckyNumber) {
      const fetchMedia = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/admin/media-by-lucky-number/${luckyNumber}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Failed to fetch media');
          }

          if (data.success) {
            setUser(data.user);
            setMediaList(data.media);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchMedia();
    } else {
      setError('Lucky number is not valid or missing.');
      setLoading(false);
    }
  }, [location.search]);

  const updateLocalStatus = (mediaId, status) => {
    setLocalTaskStatus(prev => ({
      ...prev,
      [mediaId]: status
    }));
  };

  // const handleSubmitReview = async () => {
  //   try {
  //     // First update all statuses on the server
  //     const updatePromises = Object.entries(localTaskStatus).map(([mediaId, status]) => {
  //       if (status === 'pending') {
  //         return Promise.resolve(); // Skip pending tasks
  //       }
  //       const action = status === 'approved' ? 'approve' : 'reject';
  //       return fetch(`/api/admin/media/${mediaId}/${action}`, { 
  //         method: 'PATCH' 
  //       });
  //     });

  //     await Promise.all(updatePromises);

  //     // Check if any task is rejected
  //     const hasRejected = Object.values(localTaskStatus).some(
  //       status => status === 'rejected'
  //     );

  //     // Check if all tasks are approved
  //     const allApproved = Object.values(localTaskStatus).every(
  //       status => status === 'approved'
  //     );

  //     if (allApproved) {
  //       // Add to eligible and remove from pending
  //       dispatch(markUserEligible({
  //         ...user,
  //         statusText: 'accepted'
  //       }));
  //       dispatch(removeUserFromPending(user._id)); // This is the key line
  //       navigate('/dashboard?tab=acceptedusers');
  //     } else if (hasRejected) {
  //       // Add to rejected and remove from pending
  //       dispatch(markUserRejected({
  //         ...user,
  //         statusText: 'rejected'
  //       }));
  //       dispatch(removeUserFromPending(user._id)); // This is the key line
  //       navigate('/dashboard?tab=rejectedusers');
  //     } else {
  //       alert('Please review all tasks before submitting.');
  //       return;
  //     }
      
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  const handleSubmitReview = async () => {
    try {
      // 1. Update media statuses on the server
      const updatePromises = Object.entries(localTaskStatus).map(([mediaId, status]) => {
        if (status === 'pending') return Promise.resolve();
        const action = status === 'approved' ? 'approve' : 'reject';
        return fetch(`/api/admin/media/${mediaId}/${action}`, {
          method: 'PATCH'
        });
      });
  
      const results = await Promise.all(updatePromises);
      const allSucceeded = results.every(res => res.ok);
      if (!allSucceeded) {
        setError("Some updates failed. Please try again.");
        return;
      }
  
      const totalReviewed = Object.keys(localTaskStatus).length === 10;
if (!totalReviewed) {
  alert("Please review all 10 tasks.");
  return;
}
      const hasRejected = Object.values(localTaskStatus).some(status => status === 'rejected');
      const allApproved = Object.values(localTaskStatus).every(status => status === 'approved');
  
      // 2. Update user's taskFinalStatus in DB
      const statusToSet = allApproved ? 'accepted' : (hasRejected ? 'rejected' : null);
      if (!statusToSet) {
        alert('Please review all tasks before submitting.');
        return;
      }
  
      const updateUserRes = await fetch(`/api/admin/update-user-status/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskFinalStatus: statusToSet })
      });
  
      if (!updateUserRes.ok) {
        const errData = await updateUserRes.json();
        throw new Error(errData.message || 'Failed to update user status');
      }
  
      // 3. Update Redux state and navigate
      if (statusToSet === 'accepted') {
        dispatch(markUserEligible({ ...user, statusText: 'accepted' }));
        dispatch(removeUserFromPending(user._id));
        navigate('/dashboard?tab=acceptedusers');
      } else if (statusToSet === 'rejected') {
        dispatch(markUserRejected({ ...user, statusText: 'rejected' }));
        dispatch(removeUserFromPending(user._id));
        navigate('/dashboard?tab=rejectedusers');
      }
  
    } catch (err) {
      setError(err.message);
    }
  };
  
  const allReviewed = Object.values(localTaskStatus).every(
    status => status !== 'pending'
  );

  const allApproved = Object.values(localTaskStatus).every(
    status => status === 'approved'
  );

  if (loading) {
    return <div className="text-center p-8"><Spinner size="xl" /></div>;
  }

  if (error) {
    return <Alert color="failure">{error}</Alert>;
  }

  if (!user) {
    return <Alert color="info">User not found</Alert>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {user.firstname} {user.lastname}'s Task Submissions
      </h2>
      
      <Table hoverable className="mb-6">
        <Table.Head>
          <Table.HeadCell>Task</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>URL</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {mediaList.map((media) => (
            <Table.Row key={media._id}>
              <Table.Cell>{media.slug}</Table.Cell>
              <Table.Cell>{media.type}</Table.Cell>
              <Table.Cell>
                <a href={media.url} target="_blank" rel="noreferrer">View</a>
              </Table.Cell>
              <Table.Cell>
                <Badge color={
                  localTaskStatus[media._id] === 'approved' ? 'success' : 
                  localTaskStatus[media._id] === 'rejected' ? 'failure' : 'gray'
                }>
                  {localTaskStatus[media._id] || 'pending'}
                </Badge>
              </Table.Cell>
              
              <Table.Cell className="flex gap-2">
                <Button
                  size="xs"
                  disabled={localTaskStatus[media._id] === 'approved'}
                  onClick={() => updateLocalStatus(media._id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  size="xs"
                  color="failure"
                  disabled={localTaskStatus[media._id] === 'rejected'}
                  onClick={() => updateLocalStatus(media._id, 'rejected')}
                >
                  Reject
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-between items-center">
        <Button color="gray" onClick={() => navigate(-1)}>
          Back
        </Button>
        
        <Button
          onClick={handleSubmitReview}
          disabled={!allReviewed}
          gradientMonochrome={allApproved ? "success" : "failure"}
        >
          {allReviewed ? 
            (allApproved ? 'Accept All Tasks' : 'Reject User') : 
            'Complete All Reviews First'}
        </Button>
      </div>
    </div>
  );
};

export default MediaReview;