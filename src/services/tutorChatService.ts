import tutorAPI from "../api/tutorInstance";

export const fetch_tutor_contacts = async (tutorId: string | undefined, searchTerm: string) => {
    try {
        if (!tutorId) {
            throw new Error("Tutor ID is required");
        }
        const response = await tutorAPI.get(`/chat/contacts/${tutorId}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error("fetch_tutor_contacts error:", error);
        throw error;
    }
};

export const fetch_tutor_room = async (receiverId: string, senderId: string | undefined) => {
    try {
        if (!senderId || !receiverId) {
            throw new Error("Sender ID and Receiver ID are required");
        }
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(receiverId) || !isValidObjectId(senderId)) {
            throw new Error(`Invalid ID format: receiverId=${receiverId}, senderId=${senderId}`);
        }
        console.log("fetch_tutor_room called with:", { receiverId, senderId });
        const response = await tutorAPI.get(`/chat/room/${receiverId}/${senderId}`);
        console.log("fetch_tutor_room response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("fetch_tutor_room error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            responseMessage: error.response?.data?.message
        });
        throw error;
    }
};

export const fetch_tutor_room_message = async (roomId: string, tutorId: string | undefined) => {
    try {
        if (!tutorId || !roomId) {
            throw new Error("Tutor ID and Room ID are required");
        }
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(roomId) || !isValidObjectId(tutorId)) {
            throw new Error(`Invalid ID format: roomId=${roomId}, tutorId=${tutorId}`);
        }
        console.log("fetch_tutor_room_message called with:", { roomId, tutorId });
        const response = await tutorAPI.get(`/chat/room-message/${roomId}/${tutorId}`);
        return response.data;
    } catch (error: any) {
        console.error("fetch_tutor_room_message error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            responseMessage: error.response?.data?.message
        });
        throw error;
    }
};

export const fetch_tutor_chats = async (tutorId: string | undefined, searchTerm: string) => {
    try {
        if (!tutorId) {
            throw new Error("Tutor ID is required");
        }
        console.log("fetch_tutor_chats called with:", { tutorId, searchTerm });
        const response = await tutorAPI.get(`/chat/chats/${tutorId}?search=${searchTerm}`);
        console.log("fetch_tutor_chats response:", response.data);
        return response.data;
    } catch (error) {
        console.error("fetch_tutor_chats error:", error);
        throw error;
    }
};