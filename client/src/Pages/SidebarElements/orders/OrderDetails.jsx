import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spinner, Label, Button, Modal, Textarea } from 'flowbite-react';

const OrderDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (updatedData) => {
    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}/cancel`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const handleReviewOrder = async () => {
    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchOrder();
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
      }
    } catch (err) {
      console.error('Error approving/rejecting order:', err);
    }
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
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <Button color="gray" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Order ID</Label>
            <p>{order._id}</p>
          </div>
          <div>
            <Label>Status</Label>
            <p className={`px-2 py-1 rounded-full text-white bg-${getStatusColor(order.status)}-500 inline-block`}>
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
            <p>${order.totalPrice}</p>
          </div>
          <div>
            <Label>Price per Unit</Label>
            <p>${order.pricePerUnit}</p>
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
              <Button color="warning" onClick={() => handleUpdateOrder(order)}>
                Edit Order
              </Button>
              <Button color="failure" onClick={handleCancelOrder}>
                Cancel Order
              </Button>
            </>
          )}

          {/* Marketing Actions */}
          {currentUser?.role === 'marketing' && order.status === 'pending' && (
            <Button color="info" onClick={handleReviewOrder}>
              Review Order
            </Button>
          )}

          {/* Admin Actions */}
          {currentUser?.role === 'admin' && order.status === 'reviewed' && (
            <>
              <Button color="success" onClick={() => handleApproveOrder('approve')}>
                Approve Order
              </Button>
              <Button color="failure" onClick={() => setShowRejectionModal(true)}>
                Reject Order
              </Button>
            </>
          )}
        </div>
      </Card>

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