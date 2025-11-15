import "../App.css";
import * as React from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "../L3/SpotlghtCard";
import AccHub from "../components/AccountHub";
import axios from "axios";
import NavBar from "../components/NavBar";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";
import SideMenu from "../components/SideMenu";
import CustomLoading from "../L3/CutomsLoading";
import supabase from "../lib/supabaseClient";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import {
  IconButton,
  Paper,
  Switch,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";

import VideocamIcon from "@mui/icons-material/Videocam";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

const ExploreChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const [join, setJoin] = React.useState(false);

  // fetch challenges with offset/limit
  const fetchChallenges = async ({ pageParam }: { pageParam: number }) => {
    const res = await axios.get("http://localhost:3000/api/challenges", {
      params: { offset: pageParam, limit: 5 },
    });
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
    initialPageParam: 0, // required in react-query v5
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 5) return undefined;
      return allPages.length * 5;
    },
  });

  const challenges = data?.pages.flatMap((page) => page) ?? [];
  console.log("challenges:", challenges);
  //scroll
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      scrollRef.current?.scrollBy({
        left: scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  //  fwtch community challenges

  const fetchCommunityChallenges = async ({
    pageParam,
  }: {
    pageParam: number;
  }) => {
    const res = await axios.get(
      "http://localhost:3000/api/challenges/community-challenges",
      {
        params: { offset: pageParam, limit: 10 },
      }
    );
    return res.data;
  };

  const {
    data: communityData,
    isLoading: communityLoading,
    isError: communityError,
  } = useInfiniteQuery({
    queryKey: ["community-challenges"],
    queryFn: fetchCommunityChallenges,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
  });

  const communityChallenges =
    communityData?.pages.flatMap((page) => page) ?? [];
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  //fetch academic challenges
  const fetchAcademicChallenges = async ({
    pageParam,
  }: {
    pageParam: number;
  }) => {
    const res = await axios.get(
      "http://localhost:3000/api/challenges/academic-challenges",
      {
        params: { offset: pageParam, limit: 10 },
      }
    );
    return res.data;
  };

  const {
    data: academicData,
    isLoading: academicLoading,
    isError: academicError,
  } = useInfiniteQuery({
    queryKey: ["acadamic-challenges"],
    queryFn: fetchAcademicChallenges,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
  });

  const acadamicChallenges = academicData?.pages.flatMap((page) => page) ?? [];
  // new challenge
  const { userInfo } = useAuth();
  const { getAccessToken } = useAuth();
  const [isOpenHost, setIsOpenHost] = useState(false);
  const [rankingSystem, setRankingSystem] = React.useState<string>("voting");
  const [manualPodium, setManualPodium] = React.useState<string>("top3");

  const [challengeName, setChallengeName] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeRules, setChallengeRules] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUniversityChallenge, setIsUniversityChallenge] =
    React.useState(false);
  const [allowNonStudents, setAllowNonStudents] = React.useState(false);

  const handleCreateChallenge = async () => {
    if (!challengeName.trim() || !coverFile) {
      toast.warn("Name and cover image are required.");
      return;
    }

    try {
      const token = await getAccessToken();

      const formData = new FormData();
      formData.append("challenge_name", challengeName);
      formData.append("challenge_discription", challengeDescription);
      formData.append("challenge_rules", JSON.stringify(challengeRules));
      formData.append("is_academic", String(isUniversityChallenge));
      formData.append("allowNonStudents", String(allowNonStudents));
      formData.append("uniName", userInfo.academic_status);
      formData.append("rankingSystem", rankingSystem);
      if (rankingSystem == "manual") {
        formData.append("podium", manualPodium);
      }

      if (deadline) formData.append("deadline", deadline.toISOString());
      formData.append("cover", coverFile);

      await axios.post(
        "http://localhost:3000/api/challenges/create",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Challenge created!");
      setIsOpenHost(false);
      // optional: refetch challenges
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Failed to create challenge");
    }
  };
  const [newRule, setNewRule] = useState("");

  const handleAddRule = () => {
    if (newRule.trim()) {
      setChallengeRules((prev) => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    setChallengeRules((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <AccHub />

      {/* Top nav */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100vw",
          height: "10vh",
          gap: 2,
          position: "absolute",
          left: 0,
          top: 0,
          px: 2,
        }}
      >
        <NavBar />
      </Box>

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
          left: { xs: "1vw", sm: "1vw", md: "1vw", lg: "2vw" },
          top: "12vh",
          width: { xs: "98vw", sm: "98vw", md: "98vw", lg: "70vw" },
          height: "86vh",
        }}
      >
        <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
          <Typography
            variant="h4"
            textAlign={"center"}
            sx={{
              color: "#341c1c",
              fontFamily: '"Freckle Face", system-ui',
              justifySelf: "left",
              width: "100%",
            }}
          >
            challenges
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
                justifySelf: "center",
                width: "100%",
                cursor: "pointer",
                mb: 2,
              }}
              textAlign={"center"}
            >
              Creative competitions revolved around filmmaking techniques,
              genres, styles, etc. Submit your film and get closer to audiences,
              or watch and vote for the film you think deserves the win.
            </Typography>
          </Typography>
          <Button
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "20px",
              color: "#341c1c",
              textTransform: "none",
              px: 2,
              py: 1,
              mb: 2,
              fontFamily: '"Freckle Face", system-ui',
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              },
            }}
            startIcon={<AddIcon />}
            onClick={() => setIsOpenHost(true)}
          >
            Host a challenge
          </Button>
          <Typography
            variant="h4"
            textAlign={"left"}
            sx={{
              color: "#341c1c",
              fontFamily: '"Freckle Face", system-ui',
              justifySelf: "left",
              width: "100%",
            }}
          >
            | Featured challenges
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
                justifySelf: "left",
                width: "100%",
                cursor: "pointer",
              }}
              textAlign={"left"}
            >
              Official challenges by yugen
            </Typography>
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Typography color="error">Failed to load challenges</Typography>
          ) : (
            <Box sx={{ position: "relative", mt: 4 }}>
              {/* Scrollable row */}
              <Box
                ref={scrollRef}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 4,
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {challenges.map((challenge: any) => (
                  <Box
                    key={challenge.challenge_id}
                    sx={{ flex: "0 0 100%", cursor: "pointer", height: "100%" }}
                    onClick={() =>
                      navigate(
                        `/challenge?challenge_id=${encodeURIComponent(
                          challenge.challenge_id
                        )}`
                      )
                    }
                  >
                    <SpotlightCard
                      spotlightColor="rgba(0, 229, 255, 0.2)"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                        }}
                      >
                        {/* Left Image */}
                        {challenge.cover_path && (
                          <Box
                            sx={{
                              flex: "0 0 50%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <img
                              src={
                                supabase.storage
                                  .from("challenge_covers")
                                  .getPublicUrl(challenge.cover_path).data
                                  .publicUrl
                              }
                              alt="Challenge Cover"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                borderRadius: "10px",
                                WebkitMaskImage:
                                  "linear-gradient(to right, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)",
                                WebkitMaskComposite: "destination-in",
                                maskComposite: "intersect",
                              }}
                            />
                          </Box>
                        )}

                        {/* Right Scrollable Content */}
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            justifyContent: "flex-start",
                            alignItems: "center",
                            overflowY: "auto",
                            minHeight: 0,
                            paddingRight: 2,
                            paddingY: 1,
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{
                              color: "#ffffffff",
                              fontWeight: "bold",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            challenge: {challenge.challenge_name || ""}
                          </Typography>
                          <Box sx={{ display: "flex" }}>
                            <VideocamIcon sx={{ color: "white" }} />
                            <Typography
                              variant="body1"
                              sx={{
                                color: "#ffffffff",
                                fontWeight: "bold",
                                fontFamily: '"Freckle Face", system-ui',
                              }}
                            >
                              {challenge.film_count || 0}
                            </Typography>
                            <RecordVoiceOverIcon
                              sx={{ color: "white", ml: 2 }}
                            />
                            <Typography
                              variant="body1"
                              sx={{
                                color: "#ffffffff",
                                fontWeight: "bold",
                                fontFamily: '"Freckle Face", system-ui',
                              }}
                            >
                              {challenge.vote_count || 0}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              color: "#bcabb1",
                              fontWeight: "bold",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                            variant="body1"
                          >
                            {challenge.challenge_discription || ""}
                          </Typography>

                          <Typography
                            variant="h4"
                            sx={{
                              mt: 4,
                              color: "#ffffffff",
                              fontWeight: "bold",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            Rules
                          </Typography>
                          {challenge.challenge_rules &&
                            (() => {
                              let rules = challenge.challenge_rules;
                              if (typeof rules === "string") {
                                try {
                                  rules = JSON.parse(rules);
                                } catch (err) {
                                  console.error(
                                    "Invalid JSON in challenge_rules:",
                                    err
                                  );
                                  rules = [];
                                }
                              }
                              return Array.isArray(rules)
                                ? rules.map((rule, i) => (
                                    <Typography
                                      sx={{
                                        color: "#bcabb1",
                                        fontWeight: "bold",
                                        fontFamily: '"Freckle Face", system-ui',
                                      }}
                                      key={i}
                                      variant="body2"
                                    >
                                      {i + 1}. {rule}
                                    </Typography>
                                  ))
                                : null;
                            })()}

                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                challenge.deadline &&
                                new Date(challenge.deadline) < new Date()
                                  ? "red"
                                  : "#ffffffff",
                              fontWeight: "bold",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            Deadline: {challenge.deadline || "N/A"}
                          </Typography>
                          {challenge.deadline &&
                          new Date(challenge.deadline) < new Date() ? (
                            <Button
                              variant="contained"
                              sx={{
                                fontFamily: '"Freckle Face", system-ui',
                                borderColor: "#9cd5ac",
                                color: "white",
                                backgroundColor: "#9cd5ac",
                                "&:hover": {
                                  borderColor: "#3e5e47ff",
                                  backgroundColor: "#3e5e47ff",
                                },
                              }}
                              disabled
                            >
                              Submit your film
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              sx={{
                                fontFamily: '"Freckle Face", system-ui',
                                borderColor: "#9cd5ac",
                                color: "white",
                                backgroundColor: "#9cd5ac",
                                "&:hover": {
                                  borderColor: "#3e5e47ff",
                                  backgroundColor: "#3e5e47ff",
                                },
                              }}
                              onClick={() => setJoin(true)}
                            >
                              Submit your film
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </SpotlightCard>
                  </Box>
                ))}
              </Box>

              {/* Left Arrow */}
              <Button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: -scrollRef.current.offsetWidth,
                    behavior: "smooth",
                  })
                }
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  minWidth: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowBackIosIcon />
              </Button>

              {/* Right Arrow */}
              <Button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: scrollRef.current.offsetWidth,
                    behavior: "smooth",
                  })
                }
                sx={{
                  fontFamily: '"Freckle Face", system-ui',

                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  minWidth: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowForwardIosIcon />
              </Button>
            </Box>
          )}
          <Typography
            variant="h4"
            sx={{
              mt: 5,
              color: "#341c1c",
              fontFamily: '"Freckle Face", system-ui',
            }}
          >
            | Community Challenges
          </Typography>

          {communityLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : communityError ? (
            <Typography color="error">
              Failed to load community challenges
            </Typography>
          ) : (
            <List sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
              {communityChallenges.map((challenge) => (
                <ListItem
                  key={challenge.challenge_id}
                  disablePadding
                  sx={{ mb: 1, borderRadius: 2 }}
                  onClick={() =>
                    navigate(
                      `/challenge?challenge_id=${encodeURIComponent(
                        challenge.challenge_id
                      )}`
                    )
                  }
                >
                  <ListItemButton
                    selected={
                      selectedChallenge?.challenge_id === challenge.challenge_id
                    }
                    onClick={() => setSelectedChallenge(challenge)}
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      transition: "all 0.12s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgba(156, 213, 172, 0.12)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(156, 213, 172, 0.3)",
                        border: "2px solid #9cd5ac",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 64 }}>
                      <img
                        src={
                          supabase.storage
                            .from("challenge_covers")
                            .getPublicUrl(challenge.cover_path).data.publicUrl
                        }
                        alt={challenge.challenge_name}
                        style={{
                          width: "auto",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#ffffffff",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {challenge.challenge_name}
                          </Typography>
                        </>
                      }
                      secondary={
                        <>
                          {/* 🔹 Description (first 15 words) */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#ffffffff",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {challenge.challenge_discription
                              ? challenge.challenge_discription
                                  .split(" ")
                                  .slice(0, 15)
                                  .join(" ") +
                                (challenge.challenge_discription.split(" ")
                                  .length > 15
                                  ? "..."
                                  : "")
                              : "No description"}
                          </Typography>

                          {/* 🔹 Deadline */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Freckle Face", system-ui',
                              color:
                                challenge.deadline &&
                                new Date(challenge.deadline) < new Date()
                                  ? "red"
                                  : "#ffffffff",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Deadline:{" "}
                            {challenge.deadline
                              ? new Date(
                                  challenge.deadline
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>

                          {/* 🔹 Film + Vote counts */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Freckle Face", system-ui',
                              color: "#ffffffff",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Films: {challenge.film_count ?? 0} | Votes:{" "}
                            {challenge.vote_count ?? 0}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        sx: { fontWeight: "bold", color: "white" },
                      }}
                      sx={{ ml: 2 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          <Typography
            variant="h4"
            sx={{
              mt: 5,
              color: "#341c1c",
              fontFamily: '"Freckle Face", system-ui',
            }}
          >
            | Academic Challenges
          </Typography>

          {academicLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : academicError ? (
            <Typography color="error">
              Failed to load academic challenges
            </Typography>
          ) : (
            <List sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
              {acadamicChallenges.map((challenge) => (
                <ListItem
                  key={challenge.challenge_id}
                  disablePadding
                  sx={{ mb: 1, borderRadius: 2 }}
                  onClick={() =>
                    navigate(
                      `/challenge?challenge_id=${encodeURIComponent(
                        challenge.challenge_id
                      )}`
                    )
                  }
                >
                  <ListItemButton
                    selected={
                      selectedChallenge?.challenge_id === challenge.challenge_id
                    }
                    onClick={() => setSelectedChallenge(challenge)}
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      transition: "all 0.12s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgba(156, 213, 172, 0.12)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(156, 213, 172, 0.3)",
                        border: "2px solid #9cd5ac",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 64 }}>
                      <img
                        src={
                          supabase.storage
                            .from("challenge_covers")
                            .getPublicUrl(challenge.cover_path).data.publicUrl
                        }
                        alt={challenge.challenge_name}
                        style={{
                          width: "auto",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#ffffffff",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {challenge.challenge_name}
                          </Typography>
                        </>
                      }
                      secondary={
                        <>
                          {/* 🔹 Description (first 15 words) */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#ffffffff",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {challenge.challenge_discription
                              ? challenge.challenge_discription
                                  .split(" ")
                                  .slice(0, 15)
                                  .join(" ") +
                                (challenge.challenge_discription.split(" ")
                                  .length > 15
                                  ? "..."
                                  : "")
                              : "No description"}
                          </Typography>

                          {/* 🔹 Deadline */}
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Freckle Face", system-ui',
                              color:
                                challenge.deadline &&
                                new Date(challenge.deadline) < new Date()
                                  ? "red"
                                  : "#ffffffff",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Deadline:{" "}
                            {challenge.deadline
                              ? new Date(
                                  challenge.deadline
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"Freckle Face", system-ui',
                              color: "#ffffffff",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Films: {challenge.film_count ?? 0} | Votes:{" "}
                            {challenge.vote_count ?? 0}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        sx: { fontWeight: "bold", color: "white" },
                      }}
                      sx={{ ml: 2 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </PageContainer>
      </Paper>

      <Dialog
        PaperProps={{
          sx: {
            border: "rgba(0,0,0,0.3) solid 4px",
            backgroundColor: "transparent",
            backdropFilter: "blur(5px)",
            boxShadow: "rgba(0,0,0,0.3)",
            borderRadius: "5px",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent",
          },
        }}
        open={isOpenHost}
        onClose={() => setIsOpenHost(false)}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 400,
              fontFamily: '"Freckle Face", system-ui',
            }}
          >
            <Typography
              sx={{
                mt: 5,
                color: "#341c1c",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="h5"
              textAlign={"center"}
            >
              Host a Challenge
            </Typography>
            <TextField
              label="Challenge Name"
              value={challengeName}
              onChange={(e) => setChallengeName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={challengeDescription}
              onChange={(e) => setChallengeDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="Add a rule"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddRule}
                sx={{ backgroundColor: "#9cd5ac", color: "white" }}
              >
                <AddIcon />
              </Button>
            </Box>

            <List>
              {challengeRules.map((rule, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{rule}</Typography>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleRemoveRule(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <DatePicker
              label="Deadline"
              value={deadline}
              onChange={(newValue) => setDeadline(newValue)}
            />
            <Button
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                backgroundColor: "transparent",
                borderColor: "#9cd5ac",
                color: "#9cd5ac",
                "&:hover": {
                  borderColor: "#3e5e47",
                  color: "#3e5e47",
                },
              }}
              variant="outlined"
              component="label"
            >
              Upload Cover
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setCoverFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </Button>
            {coverFile && (
              <Box mt={2} display="flex" justifyContent="center">
                <img
                  src={URL.createObjectURL(coverFile)}
                  alt="Cover Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
            <Accordion
              sx={{
                mt: 2,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 2,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              >
                <Typography
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    color: "white",
                  }}
                >
                  Advanced Options
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* 🔹 University Challenge */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          color: "white",
                        }}
                      >
                        Ranking System
                      </Typography>

                      <RadioGroup
                        row
                        value={rankingSystem}
                        onChange={(e) => setRankingSystem(e.target.value)}
                      >
                        <FormControlLabel
                          value="voting"
                          control={
                            <Radio
                              sx={{
                                color: "#9cd5ac",
                                "&.Mui-checked": { color: "#9cd5ac" },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ fontFamily: '"Freckle Face", system-ui' }}
                            >
                              Voting
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          value="manual"
                          control={
                            <Radio
                              sx={{
                                color: "#ff89b2",
                                "&.Mui-checked": { color: "#ff89b2" },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ fontFamily: '"Freckle Face", system-ui' }}
                            >
                              Manual Selection
                            </Typography>
                          }
                        />
                        {/* Nested podium radios when Manual is selected */}
                        {rankingSystem === "manual" && (
                          <Box sx={{ pl: 4, mt: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: '"Freckle Face", system-ui',
                                color: "white",
                                mb: 1,
                              }}
                            >
                              Podium
                            </Typography>
                            <RadioGroup
                              row
                              value={manualPodium}
                              onChange={(e) => setManualPodium(e.target.value)}
                            >
                              <FormControlLabel
                                value="top1"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#9c27b0",
                                      "&.Mui-checked": { color: "#9c27b0" },
                                    }}
                                  />
                                }
                                label="Top 1"
                              />
                              <FormControlLabel
                                value="top3"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#9c27b0",
                                      "&.Mui-checked": { color: "#9c27b0" },
                                    }}
                                  />
                                }
                                label="Top 3"
                              />
                              <FormControlLabel
                                value="top5"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#9c27b0",
                                      "&.Mui-checked": { color: "#9c27b0" },
                                    }}
                                  />
                                }
                                label="Top 5"
                              />
                              <FormControlLabel
                                value="top10"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#9c27b0",
                                      "&.Mui-checked": { color: "#9c27b0" },
                                    }}
                                  />
                                }
                                label="Top 10"
                              />
                            </RadioGroup>
                          </Box>
                        )}
                      </RadioGroup>
                    </Box>
                    <br />
                    <Typography
                      sx={{
                        fontFamily: '"Freckle Face", system-ui',
                        color: "white",
                      }}
                    >
                      University Challenge
                    </Typography>

                    <Tooltip
                      title={
                        <Box sx={{ p: 1, maxWidth: 250 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: '"Freckle Face", system-ui' }}
                          >
                            (for teachers) Host a filmmaking contest between
                            your students.
                          </Typography>
                        </Box>
                      }
                      placement="right"
                      arrow
                    >
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#9cd5ac", cursor: "pointer" }}
                      />
                    </Tooltip>

                    <Switch
                      checked={isUniversityChallenge}
                      onChange={(e) =>
                        setIsUniversityChallenge(e.target.checked)
                      }
                      disabled={userInfo?.role !== "teacher"}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#9cd5ac",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#9cd5ac",
                          },
                      }}
                    />

                    {userInfo?.role !== "teacher" && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SchoolIcon />}
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          borderColor: "#9cd5ac",
                          color: "#9cd5ac",
                          "&:hover": {
                            borderColor: "#3e5e47",
                            color: "#3e5e47",
                          },
                        }}
                        onClick={() => navigate("/settings")}
                      >
                        Academic Account Settings
                      </Button>
                    )}
                  </Box>

                  {/*  Allow Non-Students  */}
                  {userInfo?.role === "teacher" && isUniversityChallenge && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        pl: 4,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          color: "white",
                        }}
                      >
                        Allow Non-Students
                      </Typography>

                      <Tooltip
                        title={
                          <Box sx={{ p: 1, maxWidth: 250 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: '"Freckle Face", system-ui' }}
                            >
                              If enabled, people outside your university can
                              also join this challenge.
                            </Typography>
                          </Box>
                        }
                        placement="right"
                        arrow
                      >
                        <InfoOutlinedIcon
                          fontSize="small"
                          sx={{ color: "#ff89b2", cursor: "pointer" }}
                        />
                      </Tooltip>

                      <Switch
                        checked={allowNonStudents}
                        onChange={(e) => setAllowNonStudents(e.target.checked)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#ff89b2",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#ff89b2",
                            },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                onClick={() => setIsOpenHost(false)}
                sx={{
                  backgroundColor: "#aaa",
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChallenge}
                sx={{
                  backgroundColor: "#9cd5ac",
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                Create
              </Button>
            </Box>
          </DialogContent>
        </LocalizationProvider>
      </Dialog>
    </div>
  );
};

export default ExploreChallengesPage;
