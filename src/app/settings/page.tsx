// components/Settings.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Switch } from "../../components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { useUserStore } from "@/store/userStore";
import { Theme, UserPreferenceRequest } from "@/types";
import { useDebouncedCallback } from "use-debounce";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "../../components/ui/toast";
import {
  FaArrowLeft,
  FaGear,
  FaBell,
  FaPalette,
  FaSun,
  FaMoon,
} from "react-icons/fa6";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "../../components/ui/separator";

export default function Settings() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, updatePreferences } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [localPreferences, setLocalPreferences] =
    useState<UserPreferenceRequest>({
      notificationEnabled: true,
      theme: Theme.DARK,
    });
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setLocalPreferences(user.preferences);
    }
  }, [user?.preferences]);

  useEffect(() => {
    if (isLoading) {
      setShowStatus(true);
    } else {
      const timeout = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const debouncedSave = useDebouncedCallback(
    async (prefs: UserPreferenceRequest) => {
      try {
        setIsLoading(true);

        await updatePreferences(prefs);
        toast({
          title: "Preferences saved",
          description: "Your preferences have been saved.",
        });
      } catch (error) {
        toast({
          title: "Failed to save preferences",
          description: "Failed to save your preferences.",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => debouncedSave(prefs)}
            />
          ),
        });
        console.error("Update error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    500
  );

  const handleToggle = useCallback(
    (key: keyof UserPreferenceRequest, value: boolean | Theme) => {
      const newPreferences = { ...localPreferences, [key]: value };
      setLocalPreferences(newPreferences);
      debouncedSave(newPreferences);
    },
    [localPreferences, debouncedSave]
  );

  if (!user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="flex-1 min-h-screen bg-background">
      <div className="h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Enhanced Header */}
          <header className="sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="flex items-center gap-3 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-accent/50"
                onClick={() => router.push("/")}
              >
                <FaArrowLeft className="size-4 mr-2" />
                Back to Chat
              </Button>
              <div className="relative">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <FaGear className="absolute -right-6 -top-2 size-6 text-primary/30" />
              </div>
            </div>
            <Separator className="bg-border/50" />
          </header>

          {/* Notification Section */}
          <Card className="group hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <FaBell className="size-5 text-primary" />
                <CardTitle className="text-xl">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingRow
                label="Enable push notifications"
                description="Receive real-time notifications for new messages"
                id="notification-switch"
                checked={localPreferences.notificationEnabled}
                onCheckedChange={(checked) =>
                  handleToggle("notificationEnabled", checked)
                }
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card className="group hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <FaPalette className="size-5 text-primary" />
                <CardTitle className="text-xl">Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Customize your visual experience
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2",
                        localPreferences.theme === Theme.LIGHT &&
                          "border-primary bg-primary/10"
                      )}
                      onClick={() => handleToggle("theme", Theme.LIGHT)}
                    >
                      <FaSun className="size-4" />
                      Light
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2",
                        localPreferences.theme === Theme.DARK &&
                          "border-primary bg-primary/10"
                      )}
                      onClick={() => handleToggle("theme", Theme.DARK)}
                    >
                      <FaMoon className="size-4" />
                      Dark
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">System Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Match system appearance settings
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.theme === Theme.SYSTEM}
                    onCheckedChange={(checked) =>
                      handleToggle("theme", checked ? Theme.SYSTEM : Theme.DARK)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicator - wrap in conditional */}
          {showStatus && (
            <div
              className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur rounded-lg border"
              aria-live="polite"
            >
              <div
                className={cn(
                  "size-2 rounded-full",
                  isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                )}
              />
              <span className="text-sm text-muted-foreground">
                {isLoading ? "Saving preferences..." : "All changes saved"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced SettingRow with description
interface SettingRowProps {
  label: string;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  isLoading: boolean;
  description?: string;
}

function SettingRow({
  label,
  id,
  checked,
  onCheckedChange,
  isLoading,
  description,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between group">
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={isLoading}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-border/50"
      />
    </div>
  );
}

// ... SettingsSkeleton remains the same
function SettingsSkeleton() {
  return (
    <div className="flex-1 min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}
