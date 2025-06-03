
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import INotification from "../../interfaces/notification";

interface NotificationsProps {
  notificationsData: INotification[];
}

const Notifications = ({ notificationsData }: NotificationsProps) => {
  const [seenNotifications, setSeenNotifications] = useState<string[]>([]);

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    }
  };

  const showBrowserNotification = (notification: INotification) => {
    if (Notification.permission === "granted") {
      new Notification(notification.heading || "New Notification", {
        body: notification.url ? `Click to open: ${notification.url}` : notification.message,
        icon: "/logos/avatar.avif",
      });
    }
  };

  const showToastNotification = (notification: INotification) => {
    toast(
      (t) => (
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">{notification.heading || notification.message}</p>
          {notification.url && (
            <a
              href={notification.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              {notification.url}
            </a>
          )}
        </div>
      ),
      {
        icon: "🔔",
        duration: 5000,
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      }
    );
  };

  useEffect(() => {
    requestNotificationPermission();
    if (notificationsData && notificationsData.length > 0) {
      notificationsData.forEach((notification) => {
        if (!notification.isRead && !seenNotifications.includes(notification._id!)) {
          showBrowserNotification(notification);
          showToastNotification(notification);
          setSeenNotifications((prev) => [...prev, notification._id!]);
        }
      });
    }
  }, [notificationsData]);

  return null;
};

export default Notifications;