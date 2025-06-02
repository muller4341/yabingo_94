import { useState, useEffect } from 'react';
import { Card, Button, Modal, TextInput, Label, Spinner, Table } from 'flowbite-react';
import { HiOutlinePlusCircle, HiOutlineUserGroup } from 'react-icons/hi';
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

const GuestDashboard = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDistributorModal, setShowDistributorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phoneNumber: '',
    email: '',
    password: '',
  });

  // Sample data for charts
  const productData = {
    labels: ['OPC', 'PPC', 'SRPC', 'RHC'],
    datasets: [
      {
        label: 'Production Volume (tons)',
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/${type}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCustomerModal(false);
        setShowDistributorModal(false);
        setFormData({
          firstname: '',
          lastname: '',
          phoneNumber: '',
          email: '',
          password: '',
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <h2 className="text-xl font-bold mb-4">Product Overview</h2>
          <div className="h-64">
            <Bar
              data={productData}
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
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-4">
            <Button
              gradientDuoTone="purpleToPink"
              onClick={() => setShowCustomerModal(true)}
            >
              <HiOutlineUserGroup className="mr-2 h-5 w-5" />
              Create Customer Account
            </Button>
            <Button
              gradientDuoTone="cyanToBlue"
              onClick={() => setShowDistributorModal(true)}
            >
              <HiOutlinePlusCircle className="mr-2 h-5 w-5" />
              Create Distributor Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Customer Modal */}
      <Modal show={showCustomerModal} onClose={() => setShowCustomerModal(false)}>
        <Modal.Header>Create Customer Account</Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmit(e, 'customer')} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <TextInput
                id="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name</Label>
              <TextInput
                id="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <TextInput
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <TextInput
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <Button color="gray" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </Button>
              <Button type="submit" gradientDuoTone="purpleToPink" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Distributor Modal */}
      <Modal show={showDistributorModal} onClose={() => setShowDistributorModal(false)}>
        <Modal.Header>Create Distributor Account</Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmit(e, 'distributor')} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="firstname">First Name</Label>
              <TextInput
                id="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastname">Last Name</Label>
              <TextInput
                id="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <TextInput
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <TextInput
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4">
              <Button color="gray" onClick={() => setShowDistributorModal(false)}>
                Cancel
              </Button>
              <Button type="submit" gradientDuoTone="cyanToBlue" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Create Account'}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GuestDashboard; 