import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Button, Table } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';

const Orders = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFilterType, setDateFilterType] = useState('');

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

  const filteredSortedOrders = orders
    .filter((order) => {
      const matchesProduct = order.productName.toLowerCase().includes(filterProduct.toLowerCase());
      const matchesStatus = filterStatus ? order.status === filterStatus : true;

      return matchesProduct && matchesStatus;
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Orders</h2>
        <Button size="xs" onClick={() => navigate('/dashboard?tab=createorder')} gradientDuoTone="purpleToPink">
          Create New Order
        </Button>
      </div>

      <Card className="rounded-3xl">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded-md w-48"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {(filterProduct || filterStatus || dateFilterType) && (
            <button
              onClick={() => {
                setFilterProduct("");
                setFilterStatus("");
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
            <Table.HeadCell className='capitalize'>Product</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Quantity</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Total Price(ETB)</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Status</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredSortedOrders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity} {order.unit}</Table.Cell>
                <Table.Cell>{order.totalPrice}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                    {order.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)}  gradientDuoTone="purpleToPink">
                    View Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;
