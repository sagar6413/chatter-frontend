//--./src/store/notificationStore.ts--
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/mock/api";
import { NotificationResponse } from "@/types";
import { ApiError } from "@/types/errors";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useErrorStore } from "./errorStore";

interface NotificationState {
  // State
  notifications: NotificationResponse[];
  isLoading: boolean;
  lastFetchTime: number | null;
  unreadCount: number;

  // Actions
  getNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  removeAllNotifications: () => Promise<void>;
  clearNotifications: () => void;

  // Selectors
  getUnreadNotifications: () => NotificationResponse[];
  getReadNotifications: () => NotificationResponse[];
  hasUnreadNotifications: () => boolean;
}

const INITIAL_STATE = {
  notifications: [],
  isLoading: false,
  lastFetchTime: null,
  unreadCount: 0,
};

const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        getNotifications: async () => {
          const { lastFetchTime } = get();
          if (lastFetchTime && Date.now() - lastFetchTime < FETCH_INTERVAL) {
            return;
          }

          set({ isLoading: true });
          try {
            const response = await getNotifications();
            set({
              notifications: response,
              lastFetchTime: Date.now(),
              unreadCount: response.filter((n) => !n.read).length,
              isLoading: false,
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        markAllAsRead: async () => {
          set({ isLoading: true });
          try {
            await markAllNotificationsAsRead();
            set((state) => ({
              notifications: state.notifications.map((notification) => ({
                ...notification,
                read: true,
              })),
              unreadCount: 0,
              isLoading: false,
            }));
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        markNotificationAsRead: async (id: number) => {
          set({ isLoading: true });
          try {
            await markNotificationAsRead(id);
            set((state) => {
              const updatedNotifications = state.notifications.map(
                (notification) =>
                  notification.id === id
                    ? { ...notification, read: true }
                    : notification
              );
              return {
                notifications: updatedNotifications,
                unreadCount: updatedNotifications.filter((n) => !n.read).length,
                isLoading: false,
              };
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        removeNotification: async (id: number) => {
          set({ isLoading: true });
          try {
            await markNotificationAsRead(id);
            set((state) => {
              const updatedNotifications = state.notifications.filter(
                (notification) => notification.id !== id
              );
              return {
                notifications: updatedNotifications,
                unreadCount: updatedNotifications.filter((n) => !n.read).length,
                isLoading: false,
              };
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        removeAllNotifications: async () => {
          set({ isLoading: true });
          try {
            await markAllNotificationsAsRead();
            set({ ...INITIAL_STATE });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        clearNotifications: () => set(INITIAL_STATE),

        // Selectors
        getUnreadNotifications: () => {
          return get().notifications.filter((n) => !n.read);
        },

        getReadNotifications: () => {
          return get().notifications.filter((n) => n.read);
        },

        hasUnreadNotifications: () => {
          return get().unreadCount > 0;
        },
      }),
      {
        name: "notification-store",
        partialize: (state) => ({
          notifications: state.notifications.filter((n) => !n.read),
          unreadCount: state.unreadCount,
        }),
      }
    ),
    { name: "NotificationStore" }
  )
);
