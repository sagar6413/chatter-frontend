//--./src/services/notificationService.ts--
import { AxiosError } from "axios";

import { api } from "@/util/apiUtil";
import { NotificationResponse } from "@/types";

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  try {
    const response = await api.get<NotificationResponse[]>("/notifications");
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error fetching notifications in notificationService.ts",
      error
    );
    throw new Error("Error fetching notifications in notificationService.ts");
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error marking notification as read in notificationService.ts",
      error
    );
    throw new Error(
      "Error marking notification as read in notificationService.ts"
    );
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put("/notifications/read");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error marking all notifications as read in notificationService.ts",
      error
    );
    throw new Error(
      "Error marking all notifications as read in notificationService.ts"
    );
  }
};
