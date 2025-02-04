"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Input } from "./ui/input";
import { debounce } from "lodash";
import { SearchResults } from "./SearchResults";
import type {
  GroupConversationResponse,
  SearchResult,
  ConversationType,
  PrivateConversationResponse,
} from "@/types";
import { useWebSocketConnection } from "@/store/selectors";

// Props interface with proper documentation
interface SearchBarProps {
  /** Callback function to handle search operations */
  onSearch: (query: string) => Promise<void> | void;
  /** Search results object returned from the search operation */
  searchResults: SearchResult | null;
  /** Function to set the active conversation tab */
  setActiveTab: (tab: ConversationType) => void;
  /** Function to set the selected conversation */
  setSelectedConversation: (
    conversation: PrivateConversationResponse | GroupConversationResponse
  ) => void;
  /** Current search query string */
  searchQuery: string;
  /** Optional placeholder text for the search input */
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  searchResults,
  setActiveTab,
  setSelectedConversation,
  searchQuery,
  placeholder = "Search conversations...",
}: SearchBarProps) {
  // State management
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Store access
  const { connected } = useWebSocketConnection();

  // Memoized debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!connected) {
          setError(new Error("Not connected to server"));
          return;
        }

        try {
          setError(null);
          setIsSearching(true);
          await onSearch(value);
        } catch (error) {
          setError(error as Error);
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [onSearch, connected]
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Input change handler with proper debouncing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Use transition for non-urgent UI updates
      startTransition(() => {
        debouncedSearch(value);
      });
    },
    [debouncedSearch]
  );

  // Clear input handler with proper cleanup
  const handleClearInput = useCallback(() => {
    setInputValue("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    debouncedSearch.cancel();
    onSearch("");
  }, [debouncedSearch, onSearch]);

  // Error handling display component
  const ErrorDisplay = useCallback(() => {
    if (!error) return null;

    return (
      <div role="alert" className="text-red-500 text-sm mt-2 px-4">
        {error.message}
      </div>
    );
  }, [error]);

  return (
    <div
      role="search"
      aria-label="Search conversations"
      className={`transition-all duration-500 ease-out ${
        searchQuery.length === 0 ? "w-[90%]" : "w-full"
      }`}
    >
      <div className="">
        <div className="relative">
          {/* Search icon */}
          <FaSearch
            className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5
              transition-colors duration-200
              ${
                isSearching
                  ? "text-purple-600 animate-pulse"
                  : "text-purple-400"
              }
            `}
            aria-hidden="true"
          />

          {/* Search input */}
          <Input
            ref={inputRef}
            role="searchbox"
            className={`
              w-full bg-slate-700/50 
              border border-purple-500/20 rounded-full
              pl-10 pr-4 py-2 
              text-purple-100 placeholder-purple-400
              focus:outline-none focus:border-purple-500 
              focus:ring-2 focus:ring-purple-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${error ? "border-red-500/50" : ""}
            `}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={isSearching}
            aria-label="Search conversations"
            aria-busy={isSearching}
            aria-invalid={!!error}
            aria-controls="search-results"
          />

          {/* Clear button */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClearInput}
              className={`
                absolute right-3 top-1/2 transform -translate-y-1/2
                p-1 rounded-full
                hover:bg-purple-500/10
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                transition-all duration-200
              `}
              aria-label="Clear search"
            >
              <FaTimes className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Error display */}
        <ErrorDisplay />
      </div>

      {/* Search results section */}
      {(isSearching || searchResults) && (
        <div
          id="search-results"
          className={`
            mt-4 transition-opacity duration-200
            ${isPending ? "opacity-50" : "opacity-100"}
          `}
        >
          {isSearching ? (
            <div
              className="p-4 text-center text-purple-400"
              role="status"
              aria-live="polite"
            >
              <span className="sr-only">Searching...</span>
              <div className="animate-spin h-6 w-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : searchResults ? (
            <SearchResults
              searchResults={searchResults}
              setActiveTab={setActiveTab}
              setSelectedConversation={setSelectedConversation}
              searchQuery={searchQuery}
              clearSearch={handleClearInput}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
