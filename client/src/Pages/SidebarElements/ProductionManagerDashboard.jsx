import { useState, useEffect } from 'react';
import { Card, Table, Spinner } from 'flowbite-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ProductionManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  // Sample data for charts
  const productionData = {
    labels: ['OPC', 'PPC', 'SRPC', 'RHC'],
    datasets: [
      {
        label: 'Current Stock Levels (tons)',
        data: [1200, 800, 600, 400],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Production',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const locationData = {
    labels: ['Adama', 'Mugher', 'Tatek'],
    datasets: [
      {
        label: 'Production by Location',
        data: [40, 35, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching products data...');
        // Fetch products
        const productsRes = await fetch('/api/product/getproduct');
        console.log('Products response status:', productsRes.status);
        const productsData = await productsRes.json();
        console.log('Products data:', productsData);
        
        if (!productsRes.ok) {
          throw new Error(`Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`);
        }
        setProducts(productsData);

        console.log('Fetching stocks data...');
        // Fetch stocks
        const stocksRes = await fetch('/api/product/getstock');
        console.log('Stocks response status:', stocksRes.status);
        const stocksData = await stocksRes.json();
        console.log('Stocks data:', stocksData);
        
        if (!stocksRes.ok) {
          throw new Error(`Failed to fetch stocks: ${stocksRes.status} ${stocksRes.statusText}`);
        }
        setStocks(stocksData);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Production Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Current Stock Levels</h2>
          <div className="h-64">
            <Bar
              data={productionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Monthly Production Trend</h2>
          <div className="h-64">
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Production by Location</h2>
          <div className="h-64">
            <Doughnut
              data={locationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Stock Status</h2>
          <Table>
            <Table.Head>
              <Table.HeadCell>Product</Table.HeadCell>
              <Table.HeadCell>Current Stock</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {products.map((product) => (
                <Table.Row key={product._id}>
                  <Table.Cell>{product.productName}</Table.Cell>
                  <Table.Cell>{product.stock}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 1000
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 500
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 1000
                        ? 'Good'
                        : product.stock > 500
                        ? 'Warning'
                        : 'Critical'}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ProductionManagerDashboard; 