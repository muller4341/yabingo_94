// NotificationDropdown.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchNotifications();
    }
  }, [isOpen, currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notification/getnotification', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch('/api/notification/mark-all-read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Notifications</h3>
          <button 
            onClick={markAsRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Mark all as read
          </button>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-4 border-b ${!notification.isRead ? 'bg-gray-50' : ''}`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;