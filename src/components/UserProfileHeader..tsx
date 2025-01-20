import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { Avatar } from "@radix-ui/react-avatar";

export function UserProfileHeader({
  user,
}: {
  user: { displayName: string; avatar: string };
}) {
  return (
    <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-slate-800/50 backdrop-blur-lg flex items-center gap-3">
      <div className="relative">
        <Avatar className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 p-[2px]">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-purple-300">
            {user.displayName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
      </div>
      <h2 className="font-semibold text-purple-100">{user.displayName}</h2>
    </div>
  );
}
