import "../App.css";
import { useEffect, useState } from "react";
import supabase from "../server/config";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ThemeProvider,
  createTheme,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);
  const [loadingFilms, setloadingFilms] = useState(false);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchResults = async () => {
        if (!searchInput.trim()) {
          setSearchResults([]);
          return;
        }

        setloadingFilms(true);

        // Fetch films
        const { data: filmData, error: filmError } = await supabase
          .from("films")
          .select("film_title, poster_path, film_uuid")
          .ilike("film_title", `${searchInput}%`)
          .order("avg_rating", { ascending: false })
          .limit(10);

        let filmResults: any[] = [];
        if (!filmError && filmData) {
          filmResults = filmData.map((film) => ({
            type: "film",
            title: film.film_title,
            poster: film.poster_path,
            uuid: film.film_uuid,
          }));
        }

        // Fetch accounts
        const { data: accountData, error: accountError } = await supabase
          .from("users")
          .select("username, pfp_path")
          .ilike("username", `${searchInput}%`)
          .order("sub_count", { ascending: false })
          .limit(10);

        let accountResults: any[] = [];
        if (!accountError && accountData) {
          accountResults = accountData.map((account) => ({
            type: "user",
            username: account.username,
            pfp: account.pfp_path,
          }));
        }

        // Merge results
        setSearchResults([...filmResults, ...accountResults]);
        setloadingFilms(false);
      };

      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };
  return (
    <div className="SearchContainer">
      <div className="SearchBar">
        <div className="Searchicon"></div>
        <Autocomplete
          noOptionsText={
            searchInput.trim() === "" || searchResults.length === 0
              ? ""
              : "No options"
          }
          fullWidth
          options={searchResults}
          getOptionLabel={(option: any) => option.username}
          filterOptions={(x) => x}
          loading={loadingFilms}
          onInputChange={(e, value) => setSearchInput(value)}
          onChange={(e, option) => {
            if (option?.type === "film") {
              navigate(`/watch?uuid=${encodeURIComponent(option.uuid)}`);
            }
            if (option?.type === "user") {
              navigate(`/@?username=${encodeURIComponent(option.username)}`);
            }
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} display="flex" alignItems="center">
              <Avatar
                src={
                  option.type === "film"
                    ? supabase.storage
                        .from("posters")
                        .getPublicUrl(option.poster).data.publicUrl
                    : supabase.storage.from("pfps").getPublicUrl(option.pfp)
                        .data.publicUrl
                }
                alt={option.title || option.username}
                variant={option.type === "film" ? "square" : "circular"}
                sx={{
                  width: 40,
                  height: option.type === "film" ? 60 : 40,
                  mr: 1,
                }}
              />
              {option.title || "@" + option.username}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // stop form submission refresh
                  handleSearch();
                }
              }}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              variant="filled"
              {...params}
              label="Search"
              placeholder="ex: the shawshank redemption or Martin Scorssece"
              sx={{
                // Label styles
                "& .MuiInputLabel-root": {
                  fontFamily: '"Freckle Face", system-ui', // label font
                  fontSize: "1.2rem",
                  top: "60%",
                  left: { xs: "8%", sm: "5%", md: "3%" },
                  transform: "translateY(-50%)",
                  transition:
                    "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
                },
                "& .MuiInputLabel-shrink": {
                  opacity: 0,
                  transform: "translateY(-100%)",
                },

                // Input text
                "& .MuiInputBase-input": {
                  fontFamily: '"Freckle Face", system-ui', // input text font
                  outline: "none",
                },

                // Placeholder text
                "& .MuiInputBase-input::placeholder": {
                  fontFamily: '"Freckle Face", system-ui', // placeholder font
                  fontSize: "1rem",
                  opacity: 0.8,
                },

                // Remove underline
                "& .MuiFilledInput-underline:before": { borderBottom: "none" },
                "& .MuiFilledInput-underline:after": { borderBottom: "none" },
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingFilms ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}

          /*         value={
            crewName
              ? searchResults.find((u) => u.username === actor) || {
                  username: actor,
                  pfp: actorPFP,
                }
              : null
          }
          isOptionEqualToValue={(option, value) =>
            option.username === value.username
          } */
        />
      </div>
    </div>
  );
}
export default SearchBar;
