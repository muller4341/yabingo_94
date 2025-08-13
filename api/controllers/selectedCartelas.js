import SelectedCartela from '../model/selectedcartelas.js';

// // POST /api/selectedcartelas
// export const saveSelectedCartelas = async (req, res) => {
//   try {
//     const { createdBy, cartelas } = req.body;
//     if (!createdBy || !Array.isArray(cartelas) || cartelas.length === 0) {
//       return res.status(400).json({ message: 'createdBy and cartelas are required.' });
//     }
//     const totalselectedcartela = cartelas.length;
//     const newSelection = new SelectedCartela({ createdBy, cartelas, totalselectedcartela });
//     await newSelection.save();
//     res.status(201).json({ success: true, data: newSelection });
//   } catch (error) {
//     console.error('Error saving selected cartelas:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// Helper to get start of today in UTC
const getStartOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const saveSelectedCartelas = async (req, res) => {
  try {
    const { createdBy, cartelas } = req.body;
    if (!createdBy || !Array.isArray(cartelas) || cartelas.length === 0) {
      return res.status(400).json({ message: "createdBy and cartelas are required." });
    }

    const totalselectedcartela = cartelas.length;

    // Find the latest round for this user today
    const todayStart = getStartOfToday();
    const latestToday = await SelectedCartela.findOne({
      createdBy,
      createdAt: { $gte: todayStart }
    })
      .sort({ round: -1 })
      .exec();

    // Ensure it's always a number
    const lastRound = latestToday?.round ? Number(latestToday.round) : 0;
    const nextRound = lastRound + 1;

    const newSelection = new SelectedCartela({
      createdBy,
      cartelas,
      totalselectedcartela,
      round: nextRound, // Always a number now
    });

    await newSelection.save();

    res.status(201).json({ success: true, data: newSelection });
  } catch (error) {
    console.error("Error saving selected cartelas:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// GET /api/selectedcartelas/recent
export const getMostRecentSelectedCartela = async (req, res) => {
  try {
    const recent = await SelectedCartela.findOne().sort({ createdAt: -1 });
    if (!recent) {
      return res.status(404).json({ message: 'No selected cartela found.' });
    }
    res.status(200).json({ success: true, data: recent });
  } catch (error) {
    console.error('Error fetching most recent selected cartela:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 