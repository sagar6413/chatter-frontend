"use client"
import { useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { NotificationItem } from "./NotificationItems";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationPanel() {
  const {
    notifications,
    markAllAsRead,
    removeNotification,
    markNotificationAsRead,
    removeAllNotifications,
  } = useNotificationStore();

  const renderedNotifications = useMemo(
    () =>
      notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markNotificationAsRead}
          onRemove={removeNotification}
        />
      )),
    [markNotificationAsRead, notifications, removeNotification]
  );

  return (
    <Card className="w-full h-full flex flex-col bg-slate-800/50 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-slate-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-light tracking-wide text-purple-100">
            Notifications
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-teal-300"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-teal-300"
            onClick={removeAllNotifications}
          >
            Remove all
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length > 0 ? (
          renderedNotifications
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-purple-300">
            <Bell className="w-12 h-12 mb-4" />
            <p className="text-lg">No new notifications</p>
          </div>
        )}
      </div>
    </Card>
  );
}
