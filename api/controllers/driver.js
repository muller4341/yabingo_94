import Driver from '../model/driver.js';
import bcrypt from 'bcryptjs';

// Add a new driver
export const addDriver = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can add drivers.' });
  }

  const { firstname, lastname, phoneNumber, password, licensenumber, address, profilePicture, onwork, assignedtocar, role } = req.body;

  // Validate phoneNumber: starts with 09 or 07, followed by 8 digits
  if (!/^0[97]\d{8}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Phone number must start with 09 or 07 and be followed by 8 digits.' });
  }

  try {
    const hashPassword = bcrypt.hashSync(password, 10);
    const driver = new Driver({ firstname, lastname, phoneNumber, password: hashPassword, licensenumber, address, profilePicture, onwork, assignedtocar, role });
    await driver.save();
    res.status(201).json({ success: true, driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all drivers (only for dispatchers)
export const getDrivers = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can view drivers.' });
  }
  try {
    const drivers = await Driver.find();
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get available drivers (assignedtocar: 'no') (only for dispatchers)
export const getAvailableDrivers = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can view available drivers.' });
  }
  try {
    const drivers = await Driver.find({ assignedtocar: "no" });
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update driver onwork status by ID
export const updateDriverOnworkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { onwork } = req.body;
    const driver = await Driver.findByIdAndUpdate(id, { onwork }, { new: true });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update driver by ID
export const updateDriver = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can update drivers.' });
  }
  try {
    const { id } = req.params;
    const updateData = req.body;
    const driver = await Driver.findByIdAndUpdate(id, updateData, { new: true });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

