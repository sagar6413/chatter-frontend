"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, memo } from "react";
import { searchUser } from "@/mock/api";
import { Input } from "@/components/ui/input";
import { FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import type { UserResponse } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AddNewUserProps {
  onClose: () => void;
  onSelectUser: (user: UserResponse) => void;
  isOpen: boolean;
}

// Memoized component to prevent unnecessary re-renders
const UserItem = memo(
  ({
    user,
    onSelect,
  }: {
    user: UserResponse;
    onSelect: (user: UserResponse) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="px-2"
    >
      <button
        type="button"
        onClick={() => onSelect(user)}
        className="flex items-center gap-3 p-3 w-full hover:bg-purple-500/10 cursor-pointer rounded-xl group transition-all duration-200 ease-out border border-transparent hover:border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Avatar className="h-10 w-10 ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all">
          <AvatarImage
            src={user.avatar}
            className="group-hover:scale-105 transition-transform"
          />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            {user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-purple-50 group-hover:text-purple-200 transition-colors">
            {user.displayName}
          </h3>
          <p className="text-sm text-purple-400/80 group-hover:text-purple-300/90">
            @{user.username}
          </p>
        </div>
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </button>
    </motion.div>
  )
);

UserItem.displayName = "UserItem";

export function AddNewUser({ onClose, onSelectUser, isOpen }: AddNewUserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const searchUsers = async () => {
      if (!debouncedSearchQuery.trim()) {
        setUsers([]);
        return;
      }

      try {
        setIsSearching(true);
        setError(null);
        const result = await searchUser(debouncedSearchQuery);
        if (!result?.users?.length) {
          setUsers([]);
          return;
        }
        if (isMounted) {
          setUsers(result?.users || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Search failed:", err);
          setError("Failed to search users. Please try again.");
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    searchUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedSearchQuery]);

  const handleUserSelect = (user: UserResponse) => {
    onSelectUser(user);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex h-full flex-col border border-purple-500/20 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden"
    >
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-purple-500/10 text-purple-400 hover:text-purple-200 rounded-xl"
          >
            <FaTimes className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Add New Chat
          </h2>
        </div>
        <div className="relative" role="search">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" />
          <Input
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-xl bg-slate-800/50 border-purple-500/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 placeholder:text-purple-400/50 text-purple-100"
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={debouncedSearchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 p-2"
          >
            {error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-red-900/20 rounded-xl text-red-400"
              >
                <FaTimes className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center p-8 gap-4 text-purple-400">
                <FaSpinner className="animate-spin h-8 w-8" />
                <span className="font-medium">Finding matches...</span>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  onSelect={handleUserSelect}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center p-8 gap-4 text-purple-400/70"
              >
                <FaSearch className="h-12 w-12 opacity-40" />
                {debouncedSearchQuery ? (
                  <>
                    <span className="text-lg">No matches found</span>
                    <p className="text-center text-sm max-w-[300px]">
                      Try searching with different keywords or check the
                      spelling
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-lg">Start your search</span>
                    <p className="text-center text-sm max-w-[300px]">
                      Enter a name or username to find people to chat with
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </motion.div>
  );
}
