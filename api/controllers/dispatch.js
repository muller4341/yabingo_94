import Dispatch from '../model/dispatch.js';

// Create a new dispatch
export const createDispatch = async (req, res) => {
  try {
    let dispatchStatus = 'partially dispatched';
    if (req.body.remainingAmount === 0 || req.body.remainingAmount === '0') {
      dispatchStatus = 'dispatched';
    }
    const dispatch = new Dispatch({ ...req.body, dispatchStatus });
    await dispatch.save();
    res.status(201).json({ success: true, dispatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all dispatches
export const getDispatches = async (req, res) => {
  try {
    const dispatches = await Dispatch.find();
    res.status(200).json({ success: true, dispatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a dispatch by id
export const updateDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Dispatch.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Dispatch not found' });
    }
    res.status(200).json({ success: true, dispatch: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 