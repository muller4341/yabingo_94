// Notification.jsx
import { BellIcon } from '@heroicons/react/24/outline';
import { Badge } from 'flowbite-react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge
              color="red"
              className="text-xs font-medium px-2 py-1 rounded-full"
              size="xs"
            >
              {count}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right"
          >
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;