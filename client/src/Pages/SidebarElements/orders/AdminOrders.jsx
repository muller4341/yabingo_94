import React, { useEffect, useState } from 'react';
import { Card, Spinner, Button, Table, Modal, Textarea } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { Label } from 'flowbite-react';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId, action) => {
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
        fetchOrders();
        setShowRejectionModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Error approving/rejecting order:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Orders for Approval</h2>
        </div>

        <Table>
          <Table.Head>
            <Table.HeadCell className='capitalize'>Order ID</Table.HeadCell>
            <Table.HeadCell className='capitalize'>User Role</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Product</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Quantity</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Total Price(ETB)</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Created By</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Reviewed By</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.role}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity}</Table.Cell>
                <Table.Cell>{order.totalPrice}</Table.Cell>
                <Table.Cell>{order.createdBy}</Table.Cell>
                <Table.Cell>{order.reviewedBy || 'N/A'}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)} gradientDuoTone="purpleToPink">
                                        View Details
                    </Button>
                    <Button size="xs" color="success" onClick={() => handleApproveOrder(order._id, 'approve')}>
                      Approve
                    </Button>
                    <Button size="xs" color="failure" onClick={() => {
                      setSelectedOrder(order);
                      setShowRejectionModal(true);
                    }}>
                      Reject
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
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
          <Button color="failure" onClick={() => handleApproveOrder(selectedOrder?._id, 'reject')}>
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

export default AdminOrders; 