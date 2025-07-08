import Car from '../model/car.js';
import Driver from '../model/driver.js';

// Add a new car
export const addCar = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can add cars.' });
  }

  const { model, plateNumber, year, color, onwork, driver, capacity } = req.body;

  if (!model || !plateNumber || !year || !color || !driver || !capacity) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Check if driver exists and is available
    const assignedDriver = await Driver.findOne({ _id: driver, assignedtocar: "no" });
    if (!assignedDriver) {
      return res.status(400).json({ success: false, message: 'Selected driver is not available.' });
    }

    const car = new Car({ model, plateNumber, year, color, onwork, driver, capacity });
    await car.save();

    // Update driver's assignedtocar to "yes"
    assignedDriver.assignedtocar = "yes";
    await assignedDriver.save();

    res.status(201).json({ success: true, car });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'Plate number must be unique.' });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// Get all cars (only for dispatchers)
export const getCars = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can view cars.' });
  }
  try {
    const cars = await Car.find().populate('driver');
    res.status(200).json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 