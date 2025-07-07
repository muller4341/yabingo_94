import Car from '../model/car.js';

// Add a new car
export const addCar = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can add cars.' });
  }

  const { model, plateNumber, year, color, onwork } = req.body;

  if (!model || !plateNumber || !year || !color) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const car = new Car({ model, plateNumber, year, color, onwork });
    await car.save();
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
    const cars = await Car.find();
    res.status(200).json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 