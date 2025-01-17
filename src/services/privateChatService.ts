import { api } from "@/util/axiosInstance";
import { AxiosError } from "axios";
import { PrivateConversationResponse, MessageRequest, MessageResponse } from "@/types";

export const createPrivateChat = async (username: string): Promise<PrivateConversationResponse> => {
    try {
        const response = await api.post<PrivateConversationResponse>(`/private/${username}`);
        return response;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error creating private chat:", error.response?.data);
        } else {
            console.error("Error creating private chat:", error);
        }
        throw new Error("Error creating private chat");
    }
};

export const getPrivateChats = async (): Promise<PrivateConversationResponse[]> => {
    try {
        const response = await api.get<PrivateConversationResponse[]>("/private-chats");
        return response;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching private chats:", error.response?.data);
        } else {
            console.error("Error fetching private chats:", error);
        }
        throw new Error("Error fetching private chats");
    }
};

export const sendMessage = async (conversationId: string, message: MessageRequest): Promise<MessageResponse> => {
    try {
        const response = await api.post<MessageResponse>(`/${conversationId}/messages`, message);
        return response;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error sending message:", error.response?.data);
        } else {
            console.error("Error sending message:", error);
        }
        throw new Error("Error sending message");
    }
};

export const getMessages = async (conversationId: string): Promise<MessageResponse[]> => {
    try {
        const response = await api.get<MessageResponse[]>(`/private/${conversationId}/messages`);
        return response;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching messages:", error.response?.data);
        } else {
            console.error("Error fetching messages:", error);
        }
        throw new Error("Error fetching messages");
    }
};
