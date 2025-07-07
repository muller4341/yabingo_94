import Driver from '../model/driver.js';

// Add a new driver
export const addDriver = async (req, res) => {
  if (!req.user || req.user.role !== 'dispatcher') {
    return res.status(403).json({ success: false, message: 'Only dispatchers can add drivers.' });
  }

  const { firstname, lastname, phoneNumber, password, licensenumber, address, profilePicture, onwork } = req.body;

  // Validate phoneNumber: starts with 09 or 07, followed by 8 digits
  if (!/^0[97]\d{8}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Phone number must start with 09 or 07 and be followed by 8 digits.' });
  }

  try {
    const driver = new Driver({ firstname, lastname, phoneNumber, password, licensenumber, address, profilePicture, onwork });
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

