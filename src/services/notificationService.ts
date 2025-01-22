import { AxiosError } from "axios";

import { api } from "@/util/apiUtil";
import { NotificationResponse } from "@/types";

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  try {
    const response = await api.get<NotificationResponse[]>("/notifications");
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching notifications:", error.response?.data);
    } else {
      console.error("Error fetching notifications:", error);
    }
    throw new Error("Error fetching notifications");
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error marking notification as read:",
        error.response?.data
      );
    } else {
      console.error("Error marking notification as read:", error);
    }
    throw new Error("Error marking notification as read");
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put("/notifications/read");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error marking all notifications as read:",
        error.response?.data
      );
    } else {
      console.error("Error marking all notifications as read:", error);
    }
    throw new Error("Error marking all notifications as read");
  }
};
