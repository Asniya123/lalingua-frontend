
import { useState, useEffect } from "react";
import INotification from "../../interfaces/notification";
import Cookies from "js-cookie";
import API from "../../api/axiosInstance";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get("/notifications", {
          headers: { Authorization: `Bearer ${Cookies.get("userToken")}` },
        });
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    window.addEventListener("notificationReceived", fetchNotifications);
    return () => {
      window.removeEventListener("notificationReceived", fetchNotifications);
    };
  }, []);

  const markNotificationRead = async (notificationId: string) => {
    try {
      await API.patch(
        `/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${Cookies.get("userToken")}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        notifications.map((notification: INotification) => (
          <div
            key={notification._id}
            className={`p-4 mb-2 rounded-lg ${
              notification.isRead ? "bg-gray-100" : "bg-blue-100"
            }`}
            onClick={() => {
              if (!notification.isRead) {
                markNotificationRead(notification._id!);
              }
              if (notification.url) {
                window.open(notification.url, "_blank");
              }
            }}
          >
            <p className="font-semibold">{notification.heading}</p>
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}