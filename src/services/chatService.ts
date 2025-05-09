import API from "../api/axiosInstance";

export const fetch_contacts = async (userId: string | undefined, searchTerm: string) => {
    try {
        const response = await API.get(`/chat/contacts/${userId}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetch_room = async (recieverId: string, senderId: string | undefined) => {
    try {
        if (!senderId || !recieverId) {
            throw new Error("Sender ID and Receiver ID are required");
        }
        const response = await API.get(`/chat/room/${recieverId}/${senderId}`);
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
        return response.data;
    } catch (error) {
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