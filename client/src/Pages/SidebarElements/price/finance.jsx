import { useState, useEffect } from "react";
import { Card, Button, Select, Badge, Spinner } from "flowbite-react";
import { HiTrendingUp, HiTrendingDown, HiCurrencyDollar, HiChartBar, HiClock, HiCalendar } from "react-icons/hi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Finance = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    averagePrice: 0,
    priceChange: 0,
    activeProducts: 0,
    priceHistory: [],
    locationStats: [],
    typeStats: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/price/getallprices");
        const data = await res.json();

        // Process data for financial metrics
        const processedData = processFinancialData(data);
        setFinancialData(processedData);
      } catch (err) {
        console.error("Error fetching financial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const processFinancialData = (data) => {
    // Calculate total revenue
    const totalRevenue = data.reduce((sum, item) => {
      return sum + (item.prices[0]?.amount || 0);
    }, 0);

    // Calculate average price
    const activePrices = data.filter(item => !item.prices[0]?.isArchived);
    const averagePrice = activePrices.length > 0
      ? totalRevenue / activePrices.length
      : 0;

    // Calculate price change percentage
    const priceChange = calculatePriceChange(data);

    // Get active products count
    const activeProducts = activePrices.length;

    // Process price history for chart
    const priceHistory = processPriceHistory(data);

    // Process location and type statistics
    const locationStats = processLocationStats(data);
    const typeStats = processTypeStats(data);

    return {
      totalRevenue,
      averagePrice,
      priceChange,
      activeProducts,
      priceHistory,
      locationStats,
      typeStats
    };
  };

  const calculatePriceChange = (data) => {
    // Calculate price change percentage based on historical data
    const currentPrices = data.map(item => item.prices[0]?.amount || 0);
    const previousPrices = data.map(item => item.prices[1]?.amount || 0);
    
    const currentTotal = currentPrices.reduce((sum, price) => sum + price, 0);
    const previousTotal = previousPrices.reduce((sum, price) => sum + price, 0);
    
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };

  const processPriceHistory = (data) => {
    // Group prices by date and calculate averages
    const priceByDate = {};
    data.forEach(item => {
      item.prices.forEach(price => {
        const date = new Date(price.createdAt).toLocaleDateString();
        if (!priceByDate[date]) {
          priceByDate[date] = [];
        }
        priceByDate[date].push(price.amount);
      });
    });

    return Object.entries(priceByDate).map(([date, prices]) => ({
      date,
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    }));
  };

  const processLocationStats = (data) => {
    const locationMap = {};
    data.forEach(item => {
      if (!locationMap[item.salesLocation]) {
        locationMap[item.salesLocation] = 0;
      }
      locationMap[item.salesLocation] += item.prices[0]?.amount || 0;
    });
    return Object.entries(locationMap).map(([location, total]) => ({
      location,
      total
    }));
  };

  const processTypeStats = (data) => {
    const typeMap = {};
    data.forEach(item => {
      if (!typeMap[item.productType]) {
        typeMap[item.productType] = 0;
      }
      typeMap[item.productType] += item.prices[0]?.amount || 0;
    });
    return Object.entries(typeMap).map(([type, total]) => ({
      type,
      total
    }));
  };

  const chartData = {
    labels: financialData.priceHistory.map(item => item.date),
    datasets: [
      {
        label: 'Average Price',
        data: financialData.priceHistory.map(item => item.average),
        borderColor: 'rgb(192, 38, 211)',
        backgroundColor: 'rgba(192, 38, 211, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price Trends Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
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
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-fuchsia-800">Financial Dashboard</h2>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-40"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${financialData.totalRevenue.toLocaleString()}
              </p>
            </div>
            <HiCurrencyDollar className="w-8 h-8 text-fuchsia-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${financialData.averagePrice.toFixed(2)}
              </p>
            </div>
            <HiChartBar className="w-8 h-8 text-fuchsia-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Price Change</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {financialData.priceChange.toFixed(2)}%
                </p>
                {financialData.priceChange >= 0 ? (
                  <HiTrendingUp className="w-6 h-6 text-green-500 ml-2" />
                ) : (
                  <HiTrendingDown className="w-6 h-6 text-red-500 ml-2" />
                )}
              </div>
            </div>
            <HiClock className="w-8 h-8 text-fuchsia-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {financialData.activeProducts}
              </p>
            </div>
            <HiCalendar className="w-8 h-8 text-fuchsia-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Price Trends</h3>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Revenue by Location</h3>
            <div className="space-y-4">
              {financialData.locationStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{stat.location}</span>
                  <span className="font-semibold">${stat.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Revenue by Product Type</h3>
            <div className="space-y-4">
              {financialData.typeStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{stat.type}</span>
                  <span className="font-semibold">${stat.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Finance; 