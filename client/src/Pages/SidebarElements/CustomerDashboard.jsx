import { useState, useEffect } from 'react';
import { Card, Table, Spinner, Button, Badge } from 'flowbite-react';
import { HiShoppingBag, HiUser, HiCreditCard, HiClock } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState({
    orders: [],
    profile: null,
    recentPayments: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching customer data...');

        // Fetch customer orders
        const ordersRes = await fetch('/api/order/getcustomerorders');
        console.log('Orders response status:', ordersRes.status);
        if (!ordersRes.ok) {
          throw new Error(`Failed to fetch orders: ${ordersRes.status} ${ordersRes.statusText}`);
        }
        const ordersData = await ordersRes.json();
        console.log('Orders data:', ordersData);

        // Fetch customer profile
        const profileRes = await fetch('/api/user/getprofile');
        console.log('Profile response status:', profileRes.status);
        if (!profileRes.ok) {
          throw new Error(`Failed to fetch profile: ${profileRes.status} ${profileRes.statusText}`);
        }
        const profileData = await profileRes.json();
        console.log('Profile data:', profileData);

        // Fetch recent payments
        const paymentsRes = await fetch('/api/payment/getcustomerpayments');
        console.log('Payments response status:', paymentsRes.status);
        if (!paymentsRes.ok) {
          throw new Error(`Failed to fetch payments: ${paymentsRes.status} ${paymentsRes.statusText}`);
        }
        const paymentsData = await paymentsRes.json();
        console.log('Payments data:', paymentsData);

        setCustomerData({
          orders: ordersData,
          profile: profileData,
          recentPayments: paymentsData
        });
      } catch (error) {
        console.error('Error in fetchCustomerData:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const quickActions = [
    {
      title: 'View Products',
      icon: <HiShoppingBag className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=products'),
      color: 'purple'
    },
    {
      title: 'My Profile',
      icon: <HiUser className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=profile'),
      color: 'blue'
    },
    {
      title: 'Payment History',
      icon: <HiCreditCard className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=payments'),
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>Error: {error}</p>
        <p className="text-sm mt-2">Please check the browser console for more details.</p>
        <Button
          gradientDuoTone="purpleToPink"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customer Dashboard</h1>
        <div className="flex gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              gradientDuoTone={action.color === 'purple' ? 'purpleToPink' : 
                              action.color === 'blue' ? 'cyanToBlue' : 'tealToLime'}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <HiUser className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Welcome, {customerData.profile?.firstname} {customerData.profile?.lastname}
            </h2>
            <p className="text-gray-600">{customerData.profile?.email}</p>
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <Table>
          <Table.Head>
            <Table.HeadCell>Order ID</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {customerData.orders.slice(0, 5).map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell className="font-medium">#{order._id.slice(-6)}</Table.Cell>
                <Table.Cell>{new Date(order.createdAt).toLocaleDateString()}</Table.Cell>
                <Table.Cell>${order.totalAmount}</Table.Cell>
                <Table.Cell>
                  <Badge color={
                    order.status === 'completed' ? 'success' :
                    order.status === 'pending' ? 'warning' :
                    order.status === 'cancelled' ? 'failure' : 'info'
                  }>
                    {order.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    gradientDuoTone="purpleToPink"
                    onClick={() => navigate(`/dashboard?tab=orders&id=${order._id}`)}
                  >
                    View Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Recent Payments */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Payments</h2>
        <Table>
          <Table.Head>
            <Table.HeadCell>Payment ID</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {customerData.recentPayments.slice(0, 5).map((payment) => (
              <Table.Row key={payment._id}>
                <Table.Cell className="font-medium">#{payment._id.slice(-6)}</Table.Cell>
                <Table.Cell>{new Date(payment.createdAt).toLocaleDateString()}</Table.Cell>
                <Table.Cell>${payment.amount}</Table.Cell>
                <Table.Cell>
                  <Badge color={payment.status === 'completed' ? 'success' : 'warning'}>
                    {payment.status}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{customerData.orders.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <HiCreditCard className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">
                ${customerData.orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <HiClock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {customerData.orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard; 