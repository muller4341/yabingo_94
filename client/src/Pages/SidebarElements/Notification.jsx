// Notification.jsx
import { BellIcon } from '@heroicons/react/24/outline';
import { Badge } from 'flowbite-react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Notification = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notification/getnotification', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        if (!res.ok) {
          console.error('Error fetching notifications:', res.status);
          return;
        }

        const data = await res.json();
        setCount(data.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error('Fetch failed:', err.message);
      }
    };

    if (currentUser) fetchNotifications();
  }, [currentUser]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <div 
        className="relative cursor-pointer justify-center items-center flex text-fuchsia-800" 
        onClick={toggleDropdown}
      >
        <BellIcon className="w-10 h-10 text-gray-700 dark:text-white" />
        {count > 0 && (
          <Badge
            color="red"
            className="absolute -top-2 -right-2 text-xs"
            size="xs"
          >
            {count}
          </Badge>
        )}
      </div>
      <NotificationDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default Notification;