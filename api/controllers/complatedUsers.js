import User from '../model/user.js'; // Make sure path and model name are correct
import Media from '../model/media.js'; // Make sure path and model name are correct
const getCompletedUsers = async (req, res) => {
  try {
    const users = await User.find({
      luckyNumber: { $exists: true, $ne: null },
      taskFinalStatus: 'pending'
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error in getCompletedUsers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Get all media by user's luckyNumber
const getMediaByLuckyNumber = async (req, res) => {
  try {
    const { luckyNumber } = req.params;
    console.log("Received luckyNumber:", luckyNumber); // Log luckyNumber to debug
    
    const user = await User.findOne({ luckyNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const media = await Media.find({ userId: user._id });
    res.status(200).json({ success: true, user, media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Approve a specific media entry
// 

const approveMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' },
      { new: true }
    );
    
    // Check if this was the last pending task
    await checkUserCompletion(media.userId);
    
    res.status(200).json({ success: true, message: 'Media approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id, 
      { status: 'rejected' },
      { new: true }
    );
    
    // Immediately move to rejected if any task is rejected
    await User.findByIdAndUpdate(media.userId, { taskFinalStatus: 'rejected' });
    
    res.status(200).json({ success: true, message: 'Media rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function checkUserCompletion(userId) {
  const mediaCount = await Media.countDocuments({ userId });
  const approvedCount = await Media.countDocuments({ 
    userId, 
    status: 'approved' 
  });
  
  if (mediaCount === 10 && approvedCount === 10) {
    await User.findByIdAndUpdate(userId, { taskFinalStatus: 'accepted' });
  }
}

// const updateUserStatusByLuckyNumber = async (req, res) => {
//   const { luckyNumber } = req.params;

//   try {
//     const mediaItems = await Media.find({ luckyNumber });
//     const user = await User.findOne({ luckyNumber });

//     if (!mediaItems || mediaItems.length !== 10) {
//       return res.status(400).json({ success: false, message: 'Not all tasks uploaded.' });
//     }

//     const allApproved = mediaItems.every(item => item.status === 'approved');
//     const anyRejected = mediaItems.some(item => item.status === 'rejected');

//     if (allApproved) {
//       user.taskFinalStatus = 'accepted';
//     } else if (anyRejected) {
//       user.taskFinalStatus = 'rejected';
//     } else {
//       user.taskFinalStatus = 'pending';
//     }

//     await user.save();

//     res.status(200).json({ success: true, status: user.taskFinalStatus });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error', error });
//   }
// };
// controller/admin.js
const updateUserStatusByLuckyNumber = async (req, res) => {
  const { luckyNumber } = req.params;

  try {
    const mediaItems = await Media.find({ luckyNumber });
    const user = await User.findOne({ luckyNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (mediaItems.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not all tasks uploaded.' 
      });
    }

    const allApproved = mediaItems.every(item => item.status === 'approved');
    const anyRejected = mediaItems.some(item => item.status === 'rejected');

    if (allApproved) {
      user.taskFinalStatus = 'accepted';
    } else if (anyRejected) {
      user.taskFinalStatus = 'rejected';
    } else {
      user.taskFinalStatus = 'pending';
    }

    await user.save();

    res.status(200).json({ 
      success: true, 
      status: user.taskFinalStatus,
      user // Return the updated user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
const getEligibleUsers = async (req, res) => {
  const users = await User.find({ taskFinalStatus: 'accepted' });
  res.json({ success: true, users });
};

const getRejectedUsers = async (req, res) => {
  const users = await User.find({ taskFinalStatus: 'rejected' });
  res.json({ success: true, users });
};
const updateUserStatus = async (req, res) => {
  try {
    const { taskFinalStatus } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(taskFinalStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Fetch user by ID and update their taskFinalStatus
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { taskFinalStatus },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return success response
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getTotalPendingUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not authorized to get pending users'));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find({
      luckyNumber: { $exists: true, $ne: null },
      taskFinalStatus: 'pending',
    })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map(({ _doc }) => {
      const { password, ...rest } = _doc;
      return rest;
    });

    const totalUsers = await User.countDocuments({
      luckyNumber: { $exists: true, $ne: null },
      taskFinalStatus: 'pending',
    });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthUsers = await User.countDocuments({
      luckyNumber: { $exists: true, $ne: null },
      taskFinalStatus: 'pending',
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
  pendingUsers: usersWithoutPassword,
  totalPendingUsers: totalUsers,
  lastMonthPendingUsers: lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};
const getTotalRejectedUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not authorized to get rejected users'));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find({ taskFinalStatus: 'rejected' })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map(({ _doc }) => {
      const { password, ...rest } = _doc;
      return rest;
    });

    const totalUsers = await User.countDocuments({ taskFinalStatus: 'rejected' });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthUsers = await User.countDocuments({
      taskFinalStatus: 'rejected',
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      rejectedUsers: usersWithoutPassword,
      totalRejectedUsers: totalUsers,
      lastMonthRejectedUsers: lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};
const getTotalAcceptedUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not authorized to get accepted users'));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find({ taskFinalStatus: 'accepted' })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map(({ _doc }) => {
      const { password, ...rest } = _doc;
      return rest;
    });

    const totalUsers = await User.countDocuments({ taskFinalStatus: 'accepted' });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthUsers = await User.countDocuments({
      taskFinalStatus: 'accepted',
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      acceptedUsers: usersWithoutPassword,
      totalAcceptedUsers: totalUsers,
      lastMonthAcceptedUsers: lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};





export { getCompletedUsers, getMediaByLuckyNumber, approveMedia, rejectMedia, updateUserStatusByLuckyNumber, getEligibleUsers, getRejectedUsers, updateUserStatus, getTotalPendingUsers, getTotalRejectedUsers, getTotalAcceptedUsers };
