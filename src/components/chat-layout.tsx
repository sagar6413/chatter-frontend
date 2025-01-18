"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useState } from "react";
import Settings from "./settings";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";


export function ChatLayout() {
  const [selectedComponent, setSelectedComponent] = useState('messages'); // Default to messages
  return (

    <div className="flex h-screen text-gray-100 bg-slate-900">
      <Navbar onSelect={setSelectedComponent} activeComponent={selectedComponent} />
      {selectedComponent === 'messages' && <>
        <Sidebar />
        
      </>}
      <div className="flex-1 flex flex-col">

        {/* {selectedComponent === 'notifications' && <NotificationPanel />} */}
        {selectedComponent === 'settings' && <Settings />}
      </div>

    </div>
  );
}