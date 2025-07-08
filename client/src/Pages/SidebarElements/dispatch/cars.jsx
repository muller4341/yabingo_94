import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Table , Button} from 'flowbite-react';
import { HiSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Cars = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModel, setFilterModel] = useState('');
  const [filterPlate, setFilterPlate] = useState('');
  const [filterOnwork, setFilterOnwork] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/car', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch cars');
      }
      setCars(data.cars);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars
    .filter((car) => {
      const matchesModel = car.model.toLowerCase().includes(filterModel.toLowerCase());
      const matchesPlate = filterPlate ? car.plateNumber?.toLowerCase().includes(filterPlate.toLowerCase()) : true;
      const matchesOnwork = filterOnwork ? car.onwork === filterOnwork : true;
      return matchesModel && matchesPlate && matchesOnwork;
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
      <h2 className="text-xl font-semibold mb-6">Cars</h2>
      <Button size="xs" onClick={() => navigate('/dashboard?tab=addcar')} gradientDuoTone="purpleToPink">
               Add new car
              </Button>
              </div>
      <Card className="rounded-3xl">
        <div className="mb-4 flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by model..."
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="p-2 pl-10 border rounded-md w-48"
            />
          </div>
          <div className="flex items-center gap-2 relative">
            <HiSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by plate..."
              value={filterPlate}
              onChange={(e) => setFilterPlate(e.target.value)}
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
          {(filterModel || filterPlate || filterOnwork) && (
            <button
              onClick={() => {
                setFilterModel("");
                setFilterPlate("");
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
            <Table.HeadCell className='capitalize'>Model</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Plate Number</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Year</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Color</Table.HeadCell>
            <Table.HeadCell className='capitalize'>On Work</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Capacity (quintals)</Table.HeadCell>
            <Table.HeadCell className='capitalize'>Driver Name</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredCars.map((car) => (
              <Table.Row key={car._id}>
                <Table.Cell>{car.model}</Table.Cell>
                <Table.Cell>{car.plateNumber}</Table.Cell>
                <Table.Cell>{car.year}</Table.Cell>
                <Table.Cell>{car.color}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${car.onwork === 'yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {car.onwork === 'yes' ? 'On Work' : 'Not On Work'}
                  </span>
                </Table.Cell>
                <Table.Cell>{car.capacity}</Table.Cell>
                <Table.Cell>{car.driver ? `${car.driver.firstname} ${car.driver.lastname}` : '-'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default Cars; 