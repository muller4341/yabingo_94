import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Spinner, Modal } from 'flowbite-react';
import { HiCheck } from 'react-icons/hi';

const Dispatch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || '';
  const [order, setOrder] = useState(null);
  const [cars, setCars] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [form, setForm] = useState({
    carPlateNumber: '',
    driverName: '',
    dispatchAmount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch order, cars, and previous dispatches on mount
  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchCars();
      fetchDispatches();
    }
    // eslint-disable-next-line
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/order/${orderId}`);
      const data = await res.json();
      if (res.ok) setOrder(data);
      else setError(data.message || 'Failed to fetch order');
    } catch (err) {
      setError('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/car');
      const data = await res.json();
      if (res.ok) {
        setCars(data.cars.filter(car => car.onwork === 'no'));
      } else {
        setError(data.message || 'Failed to fetch cars');
      }
    } catch (err) {
      setError('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  // Fetch previous dispatches for this order
  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dispatch');
      const data = await res.json();
      if (res.ok) {
        setDispatches(data.dispatches.filter(d => d.orderId === orderId));
      } else {
        setError(data.message || 'Failed to fetch dispatches');
      }
    } catch (err) {
      setError('Failed to fetch dispatches');
    } finally {
      setLoading(false);
    }
  };

  // When car is selected, auto-fill plate and driver
  const handleCarChange = (e) => {
    const carId = e.target.value;
    const selectedCar = cars.find(car => car._id === carId);
    setForm({
      ...form,
      carPlateNumber: selectedCar ? selectedCar.plateNumber : '',
      driverName: selectedCar && selectedCar.driver ? `${selectedCar.driver.firstname} ${selectedCar.driver.lastname}` : '',
    });
  };

  // Handle other input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculate sum of previous dispatch amounts
  const sumOfPreviousDispatches = dispatches.reduce((sum, d) => sum + Number(d.dispatchAmount || 0), 0);
  const orderQuantityNum = order ? Number(order.quantity) : 0;
  // Calculate remainingAmount
  const dispatchAmountNum = Number(form.dispatchAmount) || 0;
  const remainingAmount = orderQuantityNum - sumOfPreviousDispatches - dispatchAmountNum;
  const maxDispatchAmount = orderQuantityNum - sumOfPreviousDispatches;
  const isDispatchDisabled = maxDispatchAmount <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const body = {
        orderId: order._id,
        productionLocation: order.salesLocation,
        destination: order.destination,
        productionName: order.productName,
        withholding: String(order.withHolding || order.withholding || ''),
        createdBy: order.createdBy,
        orderedAmount: order.quantity,
        carPlateNumber: form.carPlateNumber,
        driverName: form.driverName,
        dispatchAmount: dispatchAmountNum,
        remainingAmount: remainingAmount,
      };
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Dispatch created!');
        setShowSuccessModal(true);
        setForm({ carPlateNumber: '', driverName: '', dispatchAmount: '' });
        fetchDispatches();
      } else {
        setError(data.message || 'Failed to create dispatch');
      }
    } catch (err) {
      setError('Failed to create dispatch');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-40"><Spinner /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h2 className="text-xl font-bold mb-4">Dispatch Order</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {isDispatchDisabled && (
        <div className="text-red-600 font-semibold mb-4">All ordered amount has been dispatched. No more dispatches allowed.</div>
      )}
      {order && (
        <div className="mb-6 p-4 border rounded-2xl shadow bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="mb-2"><b>Order ID:</b> {order._id}</div>
          <div className="mb-2"><b>Production Location:</b> {order.salesLocation}</div>
          <div className="mb-2"><b>Destination:</b> {order.destination}</div>
          <div className="mb-2"><b>Production Name:</b> {order.productName}</div>
          <div className="mb-2"><b>Withholding:</b> {order.withHolding}</div>
          <div className="mb-2"><b>Created By:</b> {order.createdByName}</div>
          <div className="mb-2"><b>Ordered Amount:</b> {order.quantity} {order.unit}</div>
          <div className="mb-2"><b>Already Dispatched:</b> {sumOfPreviousDispatches} {order.unit}</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-8 space-y-6 p-8 rounded-2xl shadow bg-white">
        <div>
          <label className="block mb-1 font-medium">Select Car</label>
          <select name="car" onChange={handleCarChange} className="border rounded px-3 py-2 w-full" required disabled={isDispatchDisabled}>
            <option value="">Select a car</option>
            {cars.map(car => (
              <option key={car._id} value={car._id}>
                {car.model} - capacity {car.capacity} {order?.unit}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Car Plate Number</label>
          <input name="carPlateNumber" value={form.carPlateNumber} readOnly className="border rounded px-3 py-2 w-full bg-gray-100" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Driver Name</label>
          <input name="driverName" value={form.driverName} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Dispatch Amount</label>
          <input
            name="dispatchAmount"
            type="number"
            min="0"
            max={maxDispatchAmount}
            value={form.dispatchAmount}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
            disabled={isDispatchDisabled}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Remaining Amount</label>
          <input name="remainingAmount" type="number" value={remainingAmount} readOnly className="border rounded px-3 py-2 w-full text-red-600 bg-gray-100" />
        </div>
        <Button type="submit" gradientDuoTone="purpleToPink" className="w-full py-2 font-bold" disabled={isDispatchDisabled}>Create Dispatch</Button>
      </form>
      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        size="md"
        popup
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard?tab=orders');
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
            🚚 Dispatch has been{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">
              created successfully!
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to the orders dashboard shortly.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-center bg-white dark:bg-gray-800 rounded-b-lg">
          <Button
            gradientDuoTone="purpleToPink"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard?tab=orders');
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dispatch; 