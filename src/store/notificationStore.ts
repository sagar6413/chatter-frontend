//--./src/store/notificationStore.ts--
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/mock/api";
import { NotificationResponse } from "@/types";
import { AxiosError } from "axios";
import { create } from "zustand";

interface NotificationState {
  notifications: NotificationResponse[];
  getNotifications: () => Promise<void>;
  markAllAsRead: () => void;
  markNotificationAsRead: (id: number) => void;
  removeNotification: (id: number) => void;
  removeAllNotifications: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  getNotifications: async () => {
    try {
      const response = await getNotifications();
      set({ notifications: response });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error updating user:", error.response?.data);
      } else {
        console.error("Error updating user:", error);
      }
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead();
      set((state) => {
        const updatedNotifications = state.notifications.map((notification) => {
          return {
            ...notification,
            read: true,
          };
        });
        return {
          notifications: updatedNotifications,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error marking all notifications as read:",
          error.response?.data
        );
      } else {
        console.error("Error marking all notifications as read:", error);
      }
    }
  },

  markNotificationAsRead: async (id: number) => {
    try {
      await markNotificationAsRead(id);
      set((state) => {
        const updatedNotifications = state.notifications.map((notification) => {
          if (notification.id === id) {
            return {
              ...notification,
              read: true,
            };
          }
          return notification;
        });
        return {
          notifications: updatedNotifications,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error marking notification as read:",
          error.response?.data
        );
      } else {
        console.error("Error marking notification as read:", error);
      }
    }
  },

  removeNotification: (id: number) => {
    markNotificationAsRead(id);
    set((state) => {
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
      return {
        notifications: updatedNotifications,
      };
    });
  },
  removeAllNotifications: () => {
    markAllNotificationsAsRead();
    set({ notifications: [] });
  },
  clearNotifications: () => set({ notifications: [] }),
}));
