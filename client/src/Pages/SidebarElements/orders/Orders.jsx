import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Button, Table } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';

const Orders = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      <Card>
        <Table>
          <Table.Head>
            <Table.HeadCell>Order ID</Table.HeadCell>
            <Table.HeadCell>Product</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Total Price</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity} {order.unit}</Table.Cell>
                <Table.Cell>${order.totalPrice}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                    {order.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)} gradientDuoTone="purpleToPink">
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
