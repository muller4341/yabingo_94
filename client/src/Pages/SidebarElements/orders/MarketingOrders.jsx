import React, { useEffect, useState } from 'react';
import { Card, Spinner, Button, Table } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const MarketingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleReviewOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/order/${orderId}/review`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchOrders();
        setTimeout(() => {
        navigate('/dashboard?tab=order');
      }, 2000);
      }
    } catch (err) {
      console.error('Error reviewing order:', err);
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
          <h2 className="text-xl font-semibold">Pending Orders for Review</h2>
        </div>

        <Table>
          <Table.Head>
            <Table.HeadCell>Order ID</Table.HeadCell>
            <Table.HeadCell>Product</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Total Price</Table.HeadCell>
            <Table.HeadCell>Created By</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{order.productName}</Table.Cell>
                <Table.Cell>{order.quantity}</Table.Cell>
                <Table.Cell>${order.totalPrice}</Table.Cell>
                <Table.Cell>{order.createdBy}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" onClick={() => navigate(`/dashboard?tab=orderdetails&orderId=${order._id}`)}>
                                        View Details
                                      </Button>
                    <Button size="xs" color="info" onClick={() => handleReviewOrder(order._id)}>
                      Review
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default MarketingOrders; 