import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner } from 'flowbite-react';
import { HiUsers, HiCube, HiCurrencyDollar, HiChartBar, HiUserAdd, HiDocumentAdd, HiCurrencyYen } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Admin_Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalProducts: 0,
    totalPrices: 0,
    activeProducts: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch statistics
        const [employeesRes, productsRes, pricesRes] = await Promise.all([
          fetch('/api/employee/getallemployees'),
          fetch('/api/product/getproduct'),
          fetch('/api/price/getallprices')
        ]);

        const employees = await employeesRes.json();
        const products = await productsRes.json();
        const prices = await pricesRes.json();

        setStats({
          totalEmployees: employees.length,
          totalProducts: products.length,
          totalPrices: prices.length,
          activeProducts: products.filter(p => p.status === 'active').length
        });

        // Fetch recent activities (last 5 price updates)
        const recentPrices = prices
          .filter(p => !p.isArchived)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentActivities(recentPrices);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Add Employee',
      icon: <HiUserAdd className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=add_employee'),
      color: 'purple'
    },
    {
      title: 'Add Product',
      icon: <HiDocumentAdd className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=add_product'),
      color: 'blue'
    },
    {
      title: 'Update Prices',
      icon: <HiCurrencyYen className="w-6 h-6" />,
      onClick: () => navigate('/dashboard?tab=add_price'),
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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <HiUsers className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiCube className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <HiCurrencyDollar className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeProducts}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <HiChartBar className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Price Updates</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPrices}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Price Updates</h2>
        <Table>
          <Table.Head>
            <Table.HeadCell>Product</Table.HeadCell>
            <Table.HeadCell>Location</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Updated At</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {recentActivities.map((activity, index) => (
              <Table.Row key={index}>
                <Table.Cell className="font-medium">
                  {activity.productName}
                </Table.Cell>
                <Table.Cell>{activity.salesLocation}</Table.Cell>
                <Table.Cell>${activity.price}</Table.Cell>
                <Table.Cell>
                  <Badge color={activity.isArchived ? "gray" : "success"}>
                    {activity.isArchived ? "Archived" : "Active"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {new Date(activity.updatedAt).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Employee Management</h3>
          <p className="text-gray-600 mb-4">Manage employees, roles, and permissions</p>
          <Button gradientDuoTone="purpleToPink" onClick={() => navigate('/dashboard?tab=employees')}>
            View Employees
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Management</h3>
          <p className="text-gray-600 mb-4">Manage products, inventory, and categories</p>
          <Button gradientDuoTone="cyanToBlue" onClick={() => navigate('/dashboard?tab=products')}>
            View Products
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Price Management</h3>
          <p className="text-gray-600 mb-4">Manage prices, discounts, and promotions</p>
          <Button gradientDuoTone="tealToLime" onClick={() => navigate('/dashboard?tab=prices')}>
            View Prices
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Admin_Dashboard;
