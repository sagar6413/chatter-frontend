//--- notification-item.tsx
import { Check, X } from "lucide-react";
import { type NotificationResponse } from "@/types";
import { getTime } from "@/util/dateTimeUtils";
import { BellIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationResponse;
  onMarkAsRead: (id: number) => void;
  onRemove: (id: number) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: NotificationItemProps) {
  const isRead = notification.read;
  const timestamp = useMemo(
    () => getTime(notification.timestamp),
    [notification.timestamp]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group p-3 sm:p-4 rounded-lg border border-purple-500/20 transition-all",
        "hover:border-purple-500/40 focus-within:ring-2 focus-within:ring-purple-500",
        isRead ? "bg-slate-800/30" : "bg-slate-800/50 hover:bg-purple-500/20"
      )}
      role="article"
      aria-labelledby={`notification-${notification.id}-title`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              !isRead && "bg-gradient-to-br from-teal-500/80 to-purple-500/80"
            )}
            aria-hidden="true"
          >
            <BellIcon
              className={cn(
                "w-5 h-5",
                isRead ? "text-purple-400/60" : "text-teal-200"
              )}
            />
          </div>
          <div className="min-w-0">
            <h3
              id={`notification-${notification.id}-title`}
              className="font-medium text-purple-100 truncate"
            >
              {notification.title}
            </h3>
            <p className="text-sm text-purple-300 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <time
              dateTime={notification.timestamp.toISOString()}
              className="text-xs text-purple-400/80 mt-1 inline-block"
            >
              {timestamp}
            </time>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isRead && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 text-teal-400 hover:text-teal-300 focus:ring-2 focus:ring-teal-400"
              aria-label={`Mark notification "${notification.title}" as read`}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(notification.id)}
            className="h-8 w-8 text-purple-300 hover:text-red-400 focus:ring-2 focus:ring-red-400"
            aria-label={`Remove notification "${notification.title}"`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
