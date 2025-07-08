import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner, Button, Modal } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiCheck } from 'react-icons/hi';

const Add_car = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    model: '',
    plateNumber: '',
    year: '',
    color: '',
    onwork: 'no',
    driver: '',
    capacity: '',
    assignedtocar: 'no',
  });

  // State for available drivers
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // Only dispatchers can access this page
    if (!currentUser || currentUser.role !== 'dispatcher') {
      setErrorMessage('Access denied: Only dispatchers can add cars.');
    }
  }, [currentUser]);

  // Fetch available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/driver/available', {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok) {
          setDrivers(data.drivers);
        } else {
          setErrorMessage(data.message || 'Failed to fetch drivers');
        }
      } catch (err) {
        setErrorMessage('Failed to fetch drivers');
      }
    };
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSelectChange = (e) => {
    setFormData({ ...formData, driver: e.target.value });
  };

  const handleCapacityChange = (e) => {
    setFormData({ ...formData, capacity: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'model',
      'plateNumber',
      'year',
      'color',
      'driver',
      'capacity',
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`Please fill out ${field}`);
        return;
      }
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add car');
      setSuccessMessage('Car added successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-full h-full justify-center ">
      <div className="flex flex-col md:w-2/3 w-full">
        <form className="p-10 dark:bg-gray-800 dark:text-white rounded-3xl bg-white " onSubmit={handleSubmit}>
          <h2 className="text-center text-xl font-bold mb-10 dark:text-white">
            Register New Car
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              ['model', 'Car Model'],
              ['plateNumber', 'Plate Number'],
              ['year', 'Year'],
              ['color', 'Color'],
            ].map(([id, label]) => (
              <input
                key={id}
                id={id}
                type="text"
                placeholder={label}
                value={formData[id]}
                onChange={handleChange}
                className="border rounded py-2 px-3 "
              />
            ))}
            {/* Capacity input */}
            <input
              id="capacity"
              type="number"
              min="1"
              placeholder="Capacity (quintals)"
              value={formData.capacity}
              onChange={handleCapacityChange}
              className="border rounded py-2 px-3 "
            />
            {/* Driver dropdown */}
            <select
              id="driver"
              value={formData.driver}
              onChange={handleSelectChange}
              className="border rounded py-2 px-3 "
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.firstname} {driver.lastname} ({driver.phoneNumber})  er   
                </option>
              ))}
            </select>
          </div>
          {errorMessage && (
            <div className="text-red-500 mt-4 text-sm font-medium text-center">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="text-green-600 mt-4 text-sm font-medium text-center">{successMessage}</div>
          )}
          <div className="mt-6">
            <Button
              type="submit"
              disabled={loading}
              gradientDuoTone="purpleToPink"
              className=" text-white font-bold py-2 px-4 rounded-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner color="fuchsia" className="w-5 h-5" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Register Car'
              )}
            </Button>
          </div>
        </form>
      </div>
      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        size="md"
        popup
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard?tab=cars');
        }}
      >
        <Modal.Header className="bg-green-50 dark:bg-green-900 rounded-t-lg">
          <div className="flex items-center justify-center w-full">
            <HiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-green-700 dark:text-green-300 text-xl font-semibold">
              Success
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-800 text-center rounded-b-lg">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            🚗 Car has been{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">
              added successfully!
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to the cars dashboard shortly.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-center bg-white dark:bg-gray-800 rounded-b-lg">
          <Button
            gradientDuoTone="purpleToPink"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard?tab=cars');
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Add_car; 