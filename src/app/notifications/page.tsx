//--- notification-panel.tsx
"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationItem } from "../../components/NotificationItems";
import { Alert, AlertTitle } from "../../components/ui/alert";
import { useRouter } from "next/navigation";

export default function NotificationPanel() {
  const {
    notifications,
    getNotifications,
    markAllAsRead,
    removeNotification,
    markNotificationAsRead,
    removeAllNotifications,
  } = useNotificationStore();

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showUnSuccessAlert, setShowUnSuccessAlert] = useState(false);
  const router = useRouter();

  // Fetch notifications on mount
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // Add useEffect to auto-hide alert
  useEffect(() => {
    if (showUnSuccessAlert) {
      const timer = setTimeout(() => setShowUnSuccessAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showUnSuccessAlert]);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => setShowSuccessAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  // Memoized callbacks with confirmation dialogs
  const handleMarkAllAsRead = useCallback(() => {
    if (notifications.some((n) => !n.read)) {
      try {
        markAllAsRead();
        setShowSuccessAlert(true);
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    } else {
      setShowUnSuccessAlert(true);
    }
  }, [markAllAsRead, notifications]);

  const handleRemoveAll = useCallback(() => {
    if (
      notifications.length > 0 &&
      confirm("Are you sure you want to remove all notifications?")
    ) {
      removeAllNotifications();
    }
  }, [removeAllNotifications, notifications.length]);

  const handleMarkAsRead = useCallback(
    (id: number) => markNotificationAsRead(id),
    [markNotificationAsRead]
  );

  const handleRemove = useCallback(
    (id: number) => removeNotification(id),
    [removeNotification]
  );

  return (
    <Card className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 backdrop-blur-lg shadow-2xl border-slate-700/30">
      {/* Enhanced Header */}
      <header className="p-4 border-b border-slate-700/30 bg-gradient-to-r from-purple-500/10 to-teal-500/5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-700/30 transition-all"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-5 text-purple-300" />
          </Button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-teal-200 bg-clip-text text-transparent">
            Notifications
          </h2>
        </div>

        {/* Action Buttons Group */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="rounded-full border-slate-700/50 hover:border-teal-300/30 hover:bg-teal-400/10 text-teal-200/90"
            onClick={handleMarkAllAsRead}
            aria-label="Mark all notifications as read"
            disabled={
              notifications.length === 0 || notifications.every((n) => n.read)
            }
          >
            <CheckCircle className="size-4 mr-2" />
            Mark Read
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-slate-700/50 hover:border-red-400/30 hover:bg-red-400/10 text-red-200/90"
            onClick={handleRemoveAll}
            aria-label="Remove all notifications"
            disabled={notifications.length === 0}
          >
            <Trash2 className="size-4 mr-2" />
            Clear All
          </Button>
        </div>
      </header>

      {/* Enhanced Alerts */}
      <div className="px-4 pt-2">
        {showSuccessAlert && (
          <Alert className="border-teal-500/30 bg-teal-500/10 backdrop-blur-sm">
            <CheckCircle className="size-5 text-teal-300" />
            <AlertTitle className="ml-2 text-teal-200">
              All notifications marked as read
            </AlertTitle>
          </Alert>
        )}
        {showUnSuccessAlert && (
          <Alert className="border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <Bell className="size-5 text-purple-300" />
            <AlertTitle className="ml-2 text-purple-200">
              All notifications are already read
            </AlertTitle>
          </Alert>
        )}
      </div>

      {/* Enhanced Notifications List */}
      <section className="flex-1 overflow-y-auto p-4  relative">
        <Suspense fallback={<NotificationSkeleton />}>
          {notifications.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center  py-16">
              <div className="relative mb-6">
                <Bell className="size-20 text-purple-500/20 animate-float" />
                <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
              </div>
              <h3 className="text-xl font-semibold text-purple-100 mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-400 text-center">
                You don&apos;t have any new notifications
                <br />
                We&apos;ll notify you when something arrives
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="group transition-all hover:bg-slate-700/10 rounded-xl p-1"
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onRemove={handleRemove}
                  />
                </li>
              ))}
            </ul>
          )}
        </Suspense>
      </section>
    </Card>
  );
}

// Enhanced Skeleton Loader
function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-slate-800/20 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full" />
              <div className="h-3 w-64 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full" />
              <div className="h-3 w-24 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
