import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Table, Button } from 'flowbite-react';
import { HiSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Drivers = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterLicense, setFilterLicense] = useState('');
  const [filterOnwork, setFilterOnwork] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/driver', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch drivers');
      }
      setDrivers(data.drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers
    .filter((driver) => {
      const matchesName = `${driver.firstname} ${driver.lastname}`.toLowerCase().includes(filterName.toLowerCase());
      const matchesLicense = filterLicense ? driver.licensenumber?.toLowerCase().includes(filterLicense.toLowerCase()) : true;
      const matchesOnwork = filterOnwork ? driver.onwork === filterOnwork : true;
      return matchesName && matchesLicense && matchesOnwork;
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
      <div className='flex justify-between items-center mb-6'>
            <h2 className="text-xl font-semibold mb-6">Drivers</h2>
            <Button size="xs" onClick={() => navigate('/dashboard?tab=adddriver')} gradientDuoTone="purpleToPink">
                     Add new Driver
                    </Button>
                    </div>
      <Card className="rounded-3xl">
        <div className="mb-4 flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>
          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by license..."
              value={filterLicense}
              onChange={(e) => setFilterLicense(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterOnwork}
              onChange={(e) => setFilterOnwork(e.target.value)}
              className="p-2 border rounded-md w-48"
            >
              <option value="">All Status</option>
              <option value="yes">On Work</option>
              <option value="no">Not On Work</option>
            </select>
          </div>
          {(filterName || filterLicense || filterOnwork) && (
            <button
              onClick={() => {
                setFilterName("");
                setFilterLicense("");
                setFilterOnwork("");
              }}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              Clear Filters
            </button>
          )}
        </div>
        <Table>
          <Table.Head>
            <Table.HeadCell className='capitalize'>Name</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Phone</Table.HeadCell>
            <Table.HeadCell className='capitalize'>License</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Address</Table.HeadCell>
            <Table.HeadCell className='capitalize'>On Work</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredDrivers.map((driver) => (
              <Table.Row key={driver._id}>
                <Table.Cell>{driver.firstname} {driver.lastname}</Table.Cell>
                <Table.Cell>{driver.phoneNumber}</Table.Cell>
                <Table.Cell>{driver.licensenumber}</Table.Cell>
                <Table.Cell>{driver.address}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${driver.onwork === 'yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {driver.onwork === 'yes' ? 'On Work' : 'Not On Work'}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default Drivers; 