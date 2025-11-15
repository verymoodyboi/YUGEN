// src/features/search/hooks/useSearchBar.ts
import { useEffect, useState } from "react";
import { quickSearch } from "../services";

export const useSearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      const fetchResults = async () => {
        if (!searchInput.trim()) {
          setSearchResults([]);
          return;
        }
        setLoading(true);
        try {
          const results = await quickSearch(searchInput);
          setSearchResults(results);
        } catch (err) {
          console.error("Error fetching search results:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchInput]);

  return { searchInput, setSearchInput, searchResults, loading };
};
