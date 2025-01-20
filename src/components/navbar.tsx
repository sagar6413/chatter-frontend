"use client";

import { Bell, Settings } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

interface NavBarProps {
  onSelect: (component: string) => void;
  activeComponent: string;
}

export function Navbar({ onSelect, activeComponent }: NavBarProps) {
  return (
    <nav className="w-20 flex-shrink-0 bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border-r border-[rgba(139,92,246,0.2)] flex flex-col items-center py-6 gap-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSelect("messages")}
        className={activeComponent === "messages" ? "text-[#8B5CF6]" : ""}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSelect("notifications")}
        className={activeComponent === "notifications" ? "text-[#8B5CF6]" : ""}
      >
        <Bell className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSelect("settings")}
        className={activeComponent === "settings" ? "text-[#8B5CF6]" : ""}
      >
        <Settings className="w-5 h-5" />
      </Button>
    </nav>
  );
}
