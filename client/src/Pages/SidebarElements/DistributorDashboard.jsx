import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Spinner, Table, Badge, Modal } from 'flowbite-react';
import { HiShoppingCart, HiCreditCard, HiDocumentText, HiPlus, HiOfficeBuilding } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const DistributorDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/price/getallprices');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

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
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'failure';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const handleCreateOrder = (product) => {
    navigate(`/dashboard?tab=createorder&product=${JSON.stringify(product)}`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dashboard?tab=orderdetails&orderId=${orderId}`);
  };

  const handleInitiatePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {currentUser?.companyname}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your orders and explore our products
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <HiShoppingCart className="w-8 h-8 text-fuchsia-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Active Orders</h3>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending' || o.status === 'reviewed').length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HiCreditCard className="w-8 h-8 text-fuchsia-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Pending Payments</h3>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'approved').length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HiDocumentText className="w-8 h-8 text-fuchsia-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Orders</h3>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HiOfficeBuilding className="w-8 h-8 text-fuchsia-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Company Info</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">License: {currentUser?.licensenumber}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Products */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Products</h2>
          <Button gradientDuoTone="purpleToPink" onClick={() => navigate('/dashboard?tab=createorder')}>
            <HiPlus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-2">{product.productName}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{product.productType}</p>
                <div className="mt-auto">
                  <p className="text-lg font-bold text-fuchsia-600 mb-4">
                    ${product.prices[0]?.amount || 0} per {product.unit}
                  </p>
                  <Button 
                    gradientDuoTone="purpleToPink"
                    onClick={() => handleCreateOrder(product)}
                    className="w-full"
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <Card>
          <Table>
            <Table.Head>
              <Table.HeadCell>Order ID</Table.HeadCell>
              <Table.HeadCell>Product</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {orders.slice(0, 5).map((order) => (
                <Table.Row key={order._id}>
                  <Table.Cell className="font-medium">{order._id.slice(-6)}</Table.Cell>
                  <Table.Cell>{order.productName}</Table.Cell>
                  <Table.Cell>{order.quantity} {order.unit}</Table.Cell>
                  <Table.Cell>${order.totalPrice}</Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button size="xs" onClick={() => handleViewOrder(order._id)}>
                        View
                      </Button>
                      {order.status === 'approved' && (
                        <Button 
                          size="xs" 
                          gradientDuoTone="purpleToPink"
                          onClick={() => handleInitiatePayment(order)}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <Modal.Header>Initiate Payment</Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className="space-y-4">
              <p>Order Total: ${selectedOrder.totalPrice}</p>
              <p>Payment functionality coming soon...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowPaymentModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DistributorDashboard; 