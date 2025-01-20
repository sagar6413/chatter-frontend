"use client"
import { Check, Timer } from "lucide-react";

import { NotificationResponse } from "@/types";
import { getTime } from "@/util/dateTimeUtils";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

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
  return (
    <div
      className={`p-4 rounded-lg border border-purple-500/20 
          ${
            notification.read
              ? "bg-slate-800/30"
              : "bg-slate-800/50 hover:bg-purple-500/20"
          }
        `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-lg ${
              !notification.read &&
              "bg-gradient-to-br from-teal-500 to-purple-500"
            }`}
          >
            <Bell className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h3 className="font-medium text-purple-100">
              {notification.title}
            </h3>
            <p className="text-sm text-purple-300">{notification.message}</p>
            <span className="text-xs text-purple-400">
              {getTime(notification.timestamp)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 text-teal-400 hover:text-purple-400"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(notification.id)}
            className="h-8 w-8 text-purple-300 hover:text-red-400"
          >
            <Timer className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
