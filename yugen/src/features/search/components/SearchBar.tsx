// src/features/search/components/SearchBar.tsx
import { useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";
import { useSearchBar } from "../hooks/useSearchBar";

const SearchBar = () => {
  const navigate = useNavigate();
  const { searchInput, setSearchInput, searchResults, loading } =
    useSearchBar();
  const showDropdown = searchResults.length > 0 && searchInput.trim() !== "";

  const handleSelect = (option: any) => {
    setSearchInput("");
    if (option?.type === "film") navigate(`/watch?uuid=${option.uuid}`);
    if (option?.type === "user") navigate(`/@?username=${option.username}`);
    if (option?.type === "challenge")
      navigate(`/challenges/${option.challenge_id}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && searchInput.trim()) {
            e.preventDefault();
            navigate(`/search?query=${encodeURIComponent(searchInput)}`);
          }
        }}
        placeholder="🔍︎ Search by title, filmmaker, or description"
        className="w-full px-4 py-2 rounded-xl border-2 border-emerald-950 
                   bg-emerald-50 text-emerald-950 font-freckle text-lg 
                   placeholder:text-emerald-900/60 focus:outline-none 
                   focus:ring-2 focus:ring-emerald-700 transition"
      />

      {loading && (
        <div className="absolute right-4 top-2.5">
          <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showDropdown && (
        <ul
          className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto 
                     bg-emerald-50 border-2 border-emerald-950 rounded-xl shadow-lg"
        >
          {searchResults.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(option)}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer 
                         hover:bg-emerald-100 transition"
            >
              <img
                src={
                  option.type === "film"
                    ? supabase.storage
                        .from("posters")
                        .getPublicUrl(option.poster).data.publicUrl
                    : option.type === "user"
                      ? supabase.storage.from("pfps").getPublicUrl(option.pfp)
                          .data.publicUrl
                      : supabase.storage
                          .from("challenge_covers")
                          .getPublicUrl(option.cover).data.publicUrl
                }
                alt={option.title || option.username || option.challenge_name}
                className={`${
                  option.type === "film"
                    ? "w-10 h-14 rounded-md"
                    : option.type === "user"
                      ? "w-10 h-10 rounded-full"
                      : "w-12 h-8 rounded-md"
                } border border-emerald-950`}
              />
              <span className="text-emerald-950 font-freckle text-lg">
                {option.type === "film" && option.title}
                {option.type === "user" && "@" + option.username}
                {option.type === "challenge" && option.challenge_name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && searchInput.trim() !== "" && searchResults.length === 0 && (
        <div
          className="absolute z-50 mt-2 w-full px-3 py-2 bg-emerald-50 
                     border-2 border-emerald-950 rounded-xl shadow text-emerald-700 font-freckle"
        >
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchBar;
