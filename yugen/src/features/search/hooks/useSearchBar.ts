// src/features/search/hooks/useSearchBar.ts
import { useEffect, useState } from "react";
import { quickSearch } from "../services";

export const useSearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to calculate a relevance score for sorting
  const getScore = (item: any, query: string) => {
    const q = query.toLowerCase();

    if (item.type === "film") {
      const title = item.title.toLowerCase();
      let score = 0;

      if (title === q) score += 100;           // exact match
      else if (title.includes(q)) score += 50; // partial match

      // Bonus: popularity weighting
      score += item.popularity ? item.popularity * 0.1 : 0;

      return score;
    }

    if (item.type === "user") {
      const username = item.username.toLowerCase();
      let score = 0;

      if (username === q) score += 100;           // exact match
      else if (username.includes(q)) score += 50; // partial match

      // Bonus: subscriber count weighting
      score += item.sub_count ? item.sub_count * 0.05 : 0;

      return score;
    }

    return 0;
  };

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

          // Reorder by relevance
          const sortedResults = results
            .map(item => ({ ...item, score: getScore(item, searchInput) }))
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .map(({ score, ...rest }) => rest); // remove score before rendering

          setSearchResults(sortedResults);
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
