import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Badge } from '@nextui-org/react';
import { RootState } from '../../../redux/store';
import { getUserNotification, markUserNotificationRead } from '../../../services/notification';
import INotification from '../../../interfaces/notification';

const UserNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const user = useSelector((state: RootState) => state.auth.student);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?._id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getUserNotification(user._id);
      if (response) {
        setNotifications(response);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await markUserNotificationRead(notificationId);
      if (response) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead && notification._id) {
      await markAsRead(notification._id);
    }
    
    // If notification has a URL, open it
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <Badge
        content={unreadCount > 0 ? unreadCount.toString() : ''}
        color="danger"
        size="sm"
        isInvisible={unreadCount === 0}
        className="z-10"
      >
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
          aria-label="View notifications"
        >
          <Bell className="h-6 w-6 text-white" />
        </button>
      </Badge>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll see notifications from tutors here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      notification.isRead 
                        ? 'hover:bg-gray-50' 
                        : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            notification.isRead ? 'text-gray-800' : 'text-blue-800'
                          }`}>
                            {notification.heading}
                          </h4>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          {notification.type && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {notification.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={() => {
                  // Navigate to all notifications page if you have one
                  console.log('View all notifications');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserNotification;