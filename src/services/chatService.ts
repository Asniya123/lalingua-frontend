import API from "../api/axiosInstance";

export const fetch_contacts = async (userId: string | undefined, searchTerm: string) => {
    try {
        const response = await API.get(`/chat/contacts/${userId}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetch_room = async (receiverId: string, senderId: string | undefined) => {
    try {
        if (!senderId || !receiverId) {
            throw new Error("Sender ID and Receiver ID are required");
        }
        const response = await API.get(`/chat/room/${receiverId}/${senderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const fetch_room_message = async (roomId: string, userId: string | undefined) => {
    try {
        if (!userId || !roomId) {
            throw new Error("User ID and Room ID are required");
        }
        const response = await API.get(`/chat/room-message/${roomId}/${userId}`);
        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to fetch room messages");
        }
        return response.data;
    } catch (error: any) {
        console.error("Error in fetch_room_message:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

export const fetch_chats = async (userId: string | undefined, searchTerm: string) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }
        const response = await API.get(`/chat/chats/${userId}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};