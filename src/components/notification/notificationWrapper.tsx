// import React from "react";
// import { useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import NotificationModal from "./Notification"; // Adjust import path
// import { RootState } from "../../redux/store"; // Adjust import path

// const NotificationWrapper: React.FC = () => {
//   const { roomId } = useParams<{ roomId?: string }>(); // Extract roomId from URL if applicable (e.g., /notification/:roomId)
//   const user = useSelector((state: RootState) => state.auth.student); // Get student from auth state
//   const userId = user?._id; // Assuming user object has an _id

//   // Fallback if roomId is not in params (e.g., use a default or context value)
//   const defaultRoomId = "default-room-id"; // Replace with logic to get the current roomId (e.g., from chat context)

//   // Since this is a student route, isTutor should be false
//   const isTutor = false;

//   if (!userId) {
//     return <div>Please log in to view notifications</div>; // Handle unauthenticated case
//   }

//   return <NotificationModal roomId={roomId || defaultRoomId} userId={userId} isTutor={isTutor} />;
// };

// export default NotificationWrapper;