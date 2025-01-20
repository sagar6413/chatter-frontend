import { SearchResult } from "@/types";

interface SearchResultsProps {
  searchResults: SearchResult;
}

export function SearchResults({ searchResults }: SearchResultsProps) {
  return <div>Search Results {JSON.stringify(searchResults)}</div>;
}
