import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spinner, Label, Button, Modal, Textarea, TextInput, Select } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

const OrderDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [editForm, setEditForm] = useState({
    quantity: '',
    destination: '',
  });

  const orderId = new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setEditForm({
        quantity: order.quantity,
        destination: order.destination || '',
      });
    }
  }, [order]);

  const fetchOrder = async () => {

    try {
      const res = await fetch(`/api/order/${orderId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order');
      }
      else console.log("res ok", res

      )
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setModalMessage('Error fetching order details');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...order,
          quantity: Number(editForm.quantity),
          destination: editForm.destination,
          totalPrice: order.pricePerUnit * Number(editForm.quantity),
        }),
      });
      
      if (res.ok) {
        setModalMessage('Order updated successfully');
        setShowSuccessModal(true);
        setShowEditModal(false);
        fetchOrder();
        setTimeout(() => {
          navigate('/dashboard?tab=order');
        }, 2000);
      } else {
        const data = await res.json();
        setModalMessage(data.message || 'Failed to update order');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setModalMessage('Error updating order');
      setShowErrorModal(true);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}/cancel`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setModalMessage('Order cancelled successfully');
        setShowSuccessModal(true);
        setShowCancelModal(false);
        fetchOrder();
        setTimeout(() => {
          navigate('/dashboard?tab=order');
        }, 2000);
      } else {
        const data = await res.json();
        setModalMessage(data.message || 'Failed to cancel order');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      setModalMessage('Error cancelling order');
      setShowErrorModal(true);
    }
  };

  const handleReviewOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchOrder();
        setTimeout(() => {
        navigate('/dashboard?tab=order');
      }, 2000);
      }
    } catch (err) {
      console.error('Error reviewing order:', err);
    }
  };

  const handleApproveOrder = async (action) => {
    try {
      const res = await fetch(`/api/order/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });
      if (res.ok) {
        fetchOrder();

        setShowRejectionModal(false);
        setRejectionReason('');
        setTimeout(() => {
        navigate('/dashboard?tab=order');
      }, 2000);
      }
    } catch (err) {
      console.error('Error approving/rejecting order:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'reviewed': return 'blue';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Card>
          <h2 className="text-xl font-semibold mb-6">Order Not Found</h2>
          <Button onClick={() => navigate('/dashboard?tab=order')}>Back to Orders</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Card className='rounded-3xl'>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <Button color="gray" onClick={() => navigate('/dashboard?tab=order') }>
            Back to Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Order ID</Label>
            <p>{order._id}</p>
          </div>
          <div className="flex flex-col items-start">
  <Label>Status</Label>
  <p
    className={`px-2 py-1 rounded-full bg-${getStatusColor(order.status)}-500 inline-block text-white`}
  >
    {order.status}
  </p>
</div>

          <div>
            <Label>Product Name</Label>
            <p>{order.productName}</p>
          </div>
          <div>
            <Label>Product Type</Label>
            <p>{order.productType}</p>
          </div>
          <div>
            <Label>Quantity</Label>
            <p>{order.quantity}</p>
          </div>
          <div>
            <Label>Unit</Label>
            <p>{order.unit}</p>
          </div>
          <div>
            <Label>Total Price</Label>
            <p>{order.totalPrice}ETB</p>
          </div>
          <div>
            <Label>Price per Unit</Label>
            <p>{order.pricePerUnit}ETB</p>
          </div>
          {order.withShipping && (
            <div>
              <Label>Destination</Label>
              <p>{order.destination}</p>
            </div>
          )}
          {order.rejectionReason && (
            <div className="col-span-2">
              <Label>Rejection Reason</Label>
              <p className="text-red-500">{order.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          {/* Customer/Distributor Actions */}
          {['customer', 'distributor'].includes(currentUser?.role) && order.status === 'pending' && (
            <>
              <Button color="warning" onClick={() => setShowEditModal(true)}>
                Edit Order
              </Button>
              <Button color="failure" onClick={() => setShowCancelModal(true)}>
                Cancel Order
              </Button>
            </>
          )}

          {/* Marketing Actions */}
          {currentUser?.role === 'marketing' && order.status === 'pending' && (
            <Button color="info" onClick={handleReviewOrder} gradientDuoTone="purpleToPink">
              Review Order
            </Button>
          )}

          {/* Admin Actions */}
          {currentUser?.role === 'admin' && order.status === 'reviewed' && (
            <>
              <Button color="success" onClick={() => handleApproveOrder('approve')} >
                Approve Order
              </Button>
              <Button color="failure" onClick={() => setShowRejectionModal(true)}>
                Reject Order
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label>Quantity</Label>
              <TextInput
                type="number"
                name="quantity"
                value={editForm.quantity}
                onChange={handleEditChange}
                min="1"
                required
              />
            </div>
            {order.withShipping && (
              <div>
                <Label>Destination</Label>
                <TextInput
                  type="text"
                  name="destination"
                  value={editForm.destination}
                  onChange={handleEditChange}
                  placeholder="Enter destination"
                />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="warning" onClick={handleUpdateOrder}>
            Update Order
          </Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <Modal.Header className="bg-red-50 dark:bg-red-900 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiX className="w-10 h-10 text-red-600 dark:text-red-400" />
            <span className="ml-2 text-red-700 dark:text-red-300 text-xl font-semibold">
              Cancel Order
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center text-red-700 dark:text-red-300">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleCancelOrder}>
            Yes, Cancel Order
          </Button>
          <Button color="gray" onClick={() => setShowCancelModal(false)}>
            No, Keep Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <Modal.Header className="bg-green-50 dark:bg-green-900 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-green-700 dark:text-green-300 text-xl font-semibold">
              Success
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center text-green-700 dark:text-green-300">
            {modalMessage}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="success" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      <Modal show={showErrorModal} onClose={() => setShowErrorModal(false)}>
        <Modal.Header className="bg-red-50 dark:bg-red-900 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiX className="w-10 h-10 text-red-600 dark:text-red-400" />
            <span className="ml-2 text-red-700 dark:text-red-300 text-xl font-semibold">
              Error
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center text-red-700 dark:text-red-300">
            {modalMessage}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={() => setShowErrorModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rejection Modal */}
      <Modal show={showRejectionModal} onClose={() => setShowRejectionModal(false)}>
        <Modal.Header>Reject Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={() => handleApproveOrder('reject')}>
            Reject Order
          </Button>
          <Button color="gray" onClick={() => setShowRejectionModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderDetails; 