import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MessageRequest, ConversationType } from "@/types/index";
import { useWebSocketStore } from "./webSocketStore";

interface QueuedMessage {
  id: string;
  message: MessageRequest;
  conversationType: ConversationType;
  timestamp: number;
  attempts: number;
}

interface MessageQueueState {
  queue: QueuedMessage[];
  addToQueue: (
    message: MessageRequest,
    conversationType: ConversationType
  ) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  getQueueLength: () => number;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

export const useMessageQueueStore = create<MessageQueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      addToQueue: (
        message: MessageRequest,
        conversationType: ConversationType
      ) => {
        set((state) => ({
          queue: [
            ...state.queue,
            {
              id: crypto.randomUUID(),
              message,
              conversationType,
              timestamp: Date.now(),
              attempts: 0,
            },
          ],
        }));
      },

      removeFromQueue: (id: string) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      processQueue: async () => {
        const { queue } = get();
        const websocketStore = useWebSocketStore.getState();

        if (!websocketStore.connected || queue.length === 0) return;

        for (const item of queue) {
          if (item.attempts >= MAX_RETRY_ATTEMPTS) {
            get().removeFromQueue(item.id);
            continue;
          }

          try {
            websocketStore.sendMessage(item.message, item.conversationType);
            get().removeFromQueue(item.id);
          } catch (error) {
            console.error("Message send error:", error);
            set((state) => ({
              queue: state.queue.map((qItem) =>
                qItem.id === item.id
                  ? { ...qItem, attempts: qItem.attempts + 1 }
                  : qItem
              ),
            }));
            // Wait before trying the next message
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          }
        }
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      getQueueLength: () => {
        return get().queue.length;
      },
    }),
    {
      name: "message-queue-storage",
    }
  )
);
