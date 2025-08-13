// import React, { useState, useEffect } from "react";
// import { Check } from "lucide-react";
// import { format } from "date-fns";
// import { useNavigate } from "react-router-dom"; // Added for redirect
// import { useSocket } from "../../components/context/useSocket";
// import { INotification } from "../../interfaces/notification";
// import {
//   getTutorNotifications,
//   getUserNotifications,
//   markTutorNotificationAsRead,
//   markUserNotificationAsRead,
// } from "../../services/notification";
// import { AxiosError } from "axios";

// interface NotificationModalProps {
//   roomId: string;
//   userId: string | undefined;
//   isTutor?: boolean;
// }

// const NotificationModal: React.FC<NotificationModalProps> = ({ roomId, userId, isTutor = false }) => {
//   const [notifications, setNotifications] = useState<INotification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const { socket } = useSocket();
//   const navigate = useNavigate(); // Added for redirect

//   useEffect(() => {
//     if (!userId) {
//       console.warn("userId is undefined, skipping notification setup");
//       return;
//     }

//     const fetchNotifications = async () => {
//       try {
//         const response = isTutor
//           ? await getTutorNotifications(userId)
//           : await getUserNotifications(userId);
//         if (response.success && response.data) {
//           setNotifications(response.data);
//           setUnreadCount(response.data.filter((notif) => !notif.isRead).length);
//         } else {
//           console.error("Failed to fetch notifications:", response.message);
//           if (response.message.includes("Unauthorized")) {
//             navigate("/login"); // Redirect to login on 401
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//         if ((error as AxiosError).response?.status === 401) {
//           navigate("/login"); // Redirect to login on 401
//         }
//       }
//     };
//     fetchNotifications();

//     const handleNewNotification = (data: { roomId: string; userId: string; message: string; sender: string }) => {
//       if (data.userId !== userId || data.roomId !== roomId) return;

//       const newNotification: INotification = {
//         _id: `notif-${Date.now()}-${Math.random()}`, // Temporary _id
//         heading: isTutor ? "New Message" : "Session Updated",
//         message: `${data.sender} sent a message: ${data.message}`,
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         roomId: data.roomId,
//         senderId: data.sender,
//         receiverId: data.userId,
//       };
//       setNotifications((prev) => [...prev, newNotification]);
//       setUnreadCount((prev) => prev + 1);
//     };

//     if (socket) {
//       socket.on("showNotification", handleNewNotification);
//     }

//     return () => {
//       if (socket) {
//         socket.off("showNotification", handleNewNotification);
//       }
//     };
//   }, [userId, isTutor, roomId, socket, navigate]);

//   const handleMarkAsRead = async (_id: string) => {
//     try {
//       const response = isTutor
//         ? await markTutorNotificationAsRead(_id)
//         : await markUserNotificationAsRead(_id);
//       if (response.success) {
//         setNotifications((prev) =>
//           prev.map((notif) => (notif._id === _id ? { ...notif, isRead: true } : notif))
//         );
//         setUnreadCount((prev) => Math.max(prev - 1, 0));
//       } else {
//         console.error("Failed to mark notification as read:", response.message);
//         if (response.message.includes("Unauthorized")) {
//           navigate("/login"); // Redirect to login on 401
//         }
//       }
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//       if ((error as AxiosError).response?.status === 401) {
//         navigate("/login"); // Redirect to login on 401
//       }
//     }
//   };

//   if (!userId) return null;

//   return (
//     <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg z-50">
//       <div className="flex justify-between items-center p-4 border-b">
//         <div className="flex space-x-2">
//           <span className="text-gray-600">Notifications</span>
//           <span className="text-blue-500">{unreadCount} Unread</span>
//         </div>
//         <button
//           className="text-gray-500 hover:text-gray-700"
//           onClick={() => setNotifications([])} // Optional: Clear notifications on close
//           aria-label="Close notifications"
//         >
//           &times;
//         </button>
//       </div>
//       <div className="max-h-96 overflow-y-auto">
//         {notifications.length === 0 ? (
//           <div className="p-4 text-center text-gray-500">No notifications</div>
//         ) : (
//           notifications.map((notif) => (
//             <div
//               key={notif._id}
//               className={`p-4 border-b cursor-pointer ${notif.isRead ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
//               onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
//             >
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm font-medium">{notif.heading}</p>
//                   <p className="text-xs text-gray-600">{notif.message}</p>
//                 </div>
//                 {!notif.isRead && <Check className="h-4 w-4 text-blue-500" />}
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 {format(new Date(notif.createdAt), "dd-MM-yyyy hh:mm a")}
//               </p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationModal;