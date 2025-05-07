import tutorAPI from "../api/tutorInstance";


export const fetch_tutor_contacts = async (tutorId: string | undefined, searchTerm: string) => {
    try {
        if (!tutorId) {
            throw new Error("Tutor ID is required");
        }
        const response = await tutorAPI.get(`/tutor/chat/contacts/${tutorId}?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetch_tutor_room = async (receiverId: string, senderId: string | undefined) => {
    try {
        if (!senderId || !receiverId) {
            throw new Error("Sender ID and Receiver ID are required");
        }
        const response = await tutorAPI.get(`/tutor/chat/room/${receiverId}/${senderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetch_tutor_room_message = async (roomId: string, tutorId: string | undefined) => {
    try {
        if (!tutorId || !roomId) {
            throw new Error("Tutor ID and Room ID are required");
        }
        const response = await tutorAPI.get(`/tutor/chat/room-message/${roomId}/${tutorId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetch_tutor_chats = async (tutorId: string | undefined, searchTerm: string) => {
    try {
      if (!tutorId) {
        throw new Error("Tutor ID is required");
      }
      const response = await tutorAPI.get(`/tutor/chat/chats/${tutorId}?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };