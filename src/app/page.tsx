"use client";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Settings } from "@/components/Settings";

export default function Home() {
  const [selectedComponent, setSelectedComponent] = useState("messages"); // Default to messages

  return (
    <div className="flex h-screen text-gray-100 bg-slate-900">
      <Navbar
        onSelect={setSelectedComponent}
        activeComponent={selectedComponent}
      />
      {selectedComponent === "messages" && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {selectedComponent === "notifications" && <NotificationPanel />}
        {selectedComponent === "settings" && <Settings />}
      </div>
    </div>
  );
}