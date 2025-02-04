//--navbar.tsx
"use client";

import {
  IoNotifications,
  IoSettingsSharp,
  IoLogOutOutline,
} from "react-icons/io5";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { Button } from "./ui/button";
// import { signOut } from "@/services/authService";
import { signOut } from "@/mock/api";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };
  return (
    <nav className="w-20 flex-shrink-0 bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border-r border-[rgba(139,92,246,0.2)] flex flex-col items-center py-6 justify-between">
      <div className="flex flex-col items-center gap-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <IoChatbubbleEllipsesOutline className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/notifications")}
        >
          <IoNotifications className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/settings")}
        >
          <IoSettingsSharp className="w-5 h-5" />
        </Button>
      </div>

      <Button variant="ghost" size="icon" onClick={() => handleLogout()}>
        <IoLogOutOutline className="w-5 h-5" />
      </Button>
    </nav>
  );
}
