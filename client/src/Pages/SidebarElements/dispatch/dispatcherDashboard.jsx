import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Table } from 'flowbite-react';
import { HiTruck, HiUserGroup, HiUser, HiClipboardList } from 'react-icons/hi';

const DispatcherDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [dispatches, setDispatches] = useState([]);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'dispatcher') {
      fetchAll();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dispatchRes, carRes, driverRes] = await Promise.all([
        fetch('/api/dispatch'),
        fetch('/api/car'),
        fetch('/api/driver'),
      ]);
      const dispatchData = await dispatchRes.json();
      const carData = await carRes.json();
      const driverData = await driverRes.json();
      setDispatches(dispatchData.dispatches || []);
      setCars(carData.cars || []);
      setDrivers(driverData.drivers || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Spinner /></div>;
  }

  if (!currentUser || currentUser.role !== 'dispatcher') {
    return <div className="text-red-500 text-center mt-10">Access denied: Only dispatchers can view this dashboard.</div>;
  }

  // Stats
  const totalDispatches = dispatches.length;
  const carsOnWork = cars.filter(car => car.onwork === 'yes').length;
  const driversOnWork = drivers.filter(driver => driver.onwork === 'yes').length;
  const recentDispatches = [...dispatches].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dispatcher Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiClipboardList className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Dispatches</p>
              <p className="text-2xl font-bold text-gray-800">{totalDispatches}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <HiTruck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cars On Work</p>
              <p className="text-2xl font-bold text-gray-800">{carsOnWork}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <HiUserGroup className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Drivers On Work</p>
              <p className="text-2xl font-bold text-gray-800">{driversOnWork}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <HiUser className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-800">{drivers.length}</p>
            </div>
          </div>
        </Card>
      </div>
      <Card className="rounded-3xl">
        <h3 className="text-lg font-semibold mb-4">Recent Dispatches</h3>
        <Table>
          <Table.Head>
            <Table.HeadCell className='capitalize'>Order ID</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Car Plate</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Driver</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Amount</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Status</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Date</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {recentDispatches.map(d => (
              <Table.Row key={d._id}>
                <Table.Cell>{d.orderId}</Table.Cell>
                <Table.Cell>{d.carPlateNumber}</Table.Cell>
                <Table.Cell>{d.driverName}</Table.Cell>
                <Table.Cell>{d.dispatchAmount}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.dispatchStatus === 'dispatched' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {d.dispatchStatus}
                  </span>
                </Table.Cell>
                <Table.Cell>{new Date(d.createdAt).toLocaleString()}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default DispatcherDashboard; 