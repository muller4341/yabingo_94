import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Button, Table, Modal, Textarea } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { Label } from 'flowbite-react';
import { HiSearch } from 'react-icons/hi';

const AdminOrders = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [dateFilterType, setDateFilterType] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
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
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
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

  const filteredSortedOrders = orders
    .filter((order) => {
      const matchesProduct = (order.productName || '').toLowerCase().includes(filterProduct.toLowerCase());
      const matchesRole = filterRole ? order.role === filterRole : true;
      const matchesCreatedBy = (order.createdByName || '').toLowerCase().includes(filterCreatedBy.toLowerCase());

      return matchesProduct && matchesRole && matchesCreatedBy;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (dateFilterType === "recent") {
        return dateB - dateA; // Most recent first
      } else if (dateFilterType === "previous") {
        return dateA - dateB; // Oldest first
      }
      return 0;
    });

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

        <div className="mb-4 flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-2">
            <select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value)}
              className="p-2 border rounded-md w-48"
            >
              <option value="">All Dates</option>
              <option value="recent">Most Recent First</option>
              <option value="previous">Oldest First</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by product..."
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-2 border rounded-md w-48"
            >
              <option value="">All Roles</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>

          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by creator..."
              value={filterCreatedBy}
              onChange={(e) => setFilterCreatedBy(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>

          {(filterProduct || filterRole || filterCreatedBy || dateFilterType) && (
            <button
              onClick={() => {
                setFilterProduct("");
                setFilterRole("");
                setFilterCreatedBy("");
                setDateFilterType("");
              }}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Clear Filters
            </button>
          )}
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
            {filteredSortedOrders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.role}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity}</Table.Cell>
                <Table.Cell>{order.totalPrice}</Table.Cell>
                <Table.Cell>{order.createdByName}</Table.Cell>
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