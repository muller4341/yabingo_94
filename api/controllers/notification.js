import Notification from '../model/notification.js';

// Create notification
// controllers/notification.js
const createNotification = async (req, res) => {
  try {
    console.log("Received notification creation request for user:", req.user._id);
    const { message } = req.body;

    const notification = await Notification.create({
      userId: req.user._id,
      role: req.user.role,
      message,
      isRead: false
    });

    console.log("Created notification:", notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications for logged-in user
 const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {createNotification, getNotifications,markAllAsRead}
