"use client"
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import { debounce } from "lodash";

interface SearchBarProps {
  onSearch: (query: string) => Promise<void> | void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        try {
          setIsSearching(true);
          await onSearch(value);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [onSearch]
  );

  return (
    <div className="px-4 pt-4">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
            isSearching ? "text-purple-600" : "text-purple-400"
          }`}
        />
        <Input
          className="w-full bg-slate-700/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 text-purple-100 placeholder-purple-400 transition-colors"
          placeholder="Search conversations..."
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isSearching}
        />
      </div>
    </div>
  );
}
