"use client";

import { Sidebar } from "./sidebar";
import { ChatInterface } from "./chat-interface";
import { Navbar } from "./navbar";
import { useState } from "react";

export function ChatLayout() {
  const [selectedComponent, setSelectedComponent] = useState('messages'); // Default to messages
  return (
    
    <div className="flex h-screen text-gray-100 bg-slate-900">
      <Navbar onSelect={setSelectedComponent} activeComponent={selectedComponent} />
      {selectedComponent === 'messages' && <Sidebar />}      
        <div className="flex-1 flex flex-col">
          {selectedComponent === 'messages' && <ChatInterface />}
          {/* {selectedComponent === 'notifications' && <NotificationPanel />} */}
          {/* {selectedComponent === 'settings' && <Settings />} */}
        </div>
      
    </div>    
  );
}