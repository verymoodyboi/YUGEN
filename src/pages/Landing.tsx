import React, { useState, useEffect, useMemo } from "react";
import "../App.css";
import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import UI from "../YugenAssits/Landing/Site interface (Profile).png";
import UI2 from "../YugenAssits/Landing/Site interface mohy's.png";
import docs from "../components/landingAnimation/docs 2.png";
import ncp from "../components/landingAnimation/ncp.png";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import BlurText from "../components/landingAnimation/BlurText";
import GradientText from "../components/landingAnimation/GradiantText";
import Birdies from "../components/landingAnimation/VantaBirds";
import RotatingText from "../components/landingAnimation/RotatingText";
import ShinyText from "../components/landingAnimation/ShinyText";
import ShinyText2 from "../components/landingAnimation/ShinyText2";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import TrueFocus from "../components/landingAnimation/TrueFocus";
import Silk from "../components/landingAnimation/Silm";
import Stepper, { Step } from "../components/landingAnimation/Stepper";
import FadeContent from "../components/landingAnimation/Animated";
import CircularGallery from "../components/landingAnimation/circularGalary";
import Particles from "../components/landingAnimation/Particles";
import CircularText from "../components/landingAnimation/CircularText";
import Crosshair from "../components/landingAnimation/CrossHair";
import Globe from "react-globe.gl";
import VariableProximity from "../components/landingAnimation/strangeText";
import DecryptedText from "../components/landingAnimation/DecryptedText";
import SpotlightCard from "../components/landingAnimation/SpotLightCard";
import ForumIcon from "@mui/icons-material/Forum";
import FlyingPosters from "../components/landingAnimation/FlyingPosters";
import ProfileCard from "../components/landingAnimation/CoolCard";
import supabase from "../server/config";
import { PageContainer } from "@toolpad/core/PageContainer";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  Button,
  Slide,
} from "@mui/material";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { TransitionProps } from "@mui/material/transitions";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Ballpit from "../components/landingAnimation/Balls";
import syrian from "../YugenAssits/Landing/syrian.png";
import UAE from "../YugenAssits/Landing/UAE.jpg";
import india from "../YugenAssits/Landing/india.png";
import belgium from "../YugenAssits/Landing/belgium.jpg";
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import Films from "../components/Film";
import { redirect } from "react-router-dom";
import { userInfo } from "os";
//////////
const FilmCard = ({ film }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Card
      className="film-card"
      sx={{
        borderRadius: "5%",
        width: 240,
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
      }}
    >
      <CardMedia
        component="img"
        image={`http://localhost:3001/${film.poster_path?.replace(/\\/g, "/")}`}
        alt="Film thumbnail"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderRadius: "3%",
          aspectRatio: "2/3",
          width: "100%",
          justifySelf: "center",
          objectFit: "cover",
        }}
      />
      <IconButton
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "transparent",
        }}
      >
        <BookmarkAddIcon fontSize="large" />
      </IconButton>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                justifySelf: "left",
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
                maxWidth: "90%",
                overflow: "scroll",
              }}
              variant="h6"
            >
              {film.film_title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              {film.film_genre || "No genre"}
            </Typography>
          </Box>
          <Box textAlign="center">
            <StarOutlineIcon />
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="body2"
            >
              {film.avg_rating ?? "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box textAlign="center" sx={{ backgroundColor: "#341c1c" }}>
        <IconButton onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <Dialog
        open={open}
        fullScreen
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Box
          p={2}
          className="Form"
          sx={{
            background:
              "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: '"Freckle Face", system-ui',
            }}
            variant="h6"
          >
            Thesis
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: '"Freckle Face", system-ui',
            }}
            variant="body2"
          >
            {film.thesis}
          </Typography>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              mt: 2,
              color: "black",
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Card>
  );
};
//////////
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CountryFeature {
  type: "Feature";
  properties: {
    name: string;
    ADMIN: string;
    ISO_A2: string;
    GDP_MD_EST: number;
    POP_EST: number;
  };
  geometry: any;
}

interface CountriesData {
  features: CountryFeature[];
}

function Landing() {
  //user auth
  const [userInfo, setUserInfo] = useState<any>(null);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("username, pfp_path,user_id")
        .eq("email", user.email)
        .single();
      if (!error) {
        setUserInfo(data);
        console.log("User data loaded:", data);
      } else {
        console.error("Error loading user profile:", error);
      }
    } else {
      setUserInfo(null); // Clear info if no user
    }
  };

  useEffect(() => {
    loadProfile(); // Initial load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        loadProfile(); // Refresh profile on login/logout
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  //user auth//
  const [countries, setCountries] = useState<CountriesData>({ features: [] });
  const [hoverD, setHoverD] = useState<CountryFeature | null>(null);
  const [clickD, setClickrD] = useState<CountryFeature | null>(null);
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [films, setFilms] = useState<any[]>([]);

  const [targetFilm, setTargetFilm] = React.useState(0);
  const itemsFlying = [
    "https://picsum.photos/500/500?grayscale",
    "https://picsum.photos/600/600?grayscale",
    "https://picsum.photos/400/400?grayscale",
  ];
  //////////////map section
  const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch } =
    useInfiniteQuery({
      queryKey: ["films", clickD?.properties.name],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdata_map", {
          params: {
            offset: pageParam,
            limit: 10,
            country: clickD?.properties.name,
          },
        });
        return res.data;
      },
      enabled: false,
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setClickrD(null);
  };
  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };
  const handleClickD = async () => {
    const result = await refetch();
    if (result.data) {
      const films2 = result.data.pages.flat();
      setFilms(films2);
      handleClickOpen();
    }
  };

  useEffect(() => {
    fetch("/world.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded countries:", data);
        setCountries(data);
      })
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  const colorScale = useMemo(() => scaleSequentialSqrt(interpolateYlOrRd), []);

  const getVal = (feat: CountryFeature) =>
    feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

  const maxVal = useMemo(() => {
    return Math.max(...countries.features.map(getVal));
  }, [countries]);

  // Set domain after maxVal calculation
  useEffect(() => {
    colorScale.domain([0, maxVal]);
  }, [colorScale, maxVal]);

  function handleClick() {
    window.location.replace("#/LoginPage");
  }
  const items = [
    {
      image: syrian,
      link: "",
      title: "",
      description: `"Karam Camera"
                    Syria, 2023`,
    },
    {
      image: UAE,
      link: "",
      title: "",
      description: `"Dear Child" 
      UAE, 2023`,
    },
    {
      image: india,
      link: "",
      title: "",
      description: `"Who Are You, Nanu?"
      India, 2025`,
    },
    {
      image: belgium,
      link: "",
      title: "",
      description: `"The Missionary"
      Belgium, 2024`,
    },
  ];
  const PrettoSlider = styled(Slider)({
    color: "#9cd5ac",
    height: 8,
    "& .MuiSlider-track": {
      border: "none",
    },
    "& .MuiSlider-thumb": {
      height: 24,
      width: 24,
      backgroundColor: "#fff",
      border: "2px solid currentColor",
      "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
        boxShadow: "inherit",
      },
      "&::before": {
        display: "none",
      },
    },
    "& .MuiSlider-valueLabel": {
      lineHeight: 1.2,
      fontSize: 12,
      background: "unset",
      padding: 0,
      width: 32,
      height: 32,
      borderRadius: "50% 50% 50% 0",
      backgroundColor: "#9cd5ac",
      transformOrigin: "bottom left",
      transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
      "&::before": { display: "none" },
      "&.MuiSlider-valueLabelOpen": {
        transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
      },
      "& > *": {
        transform: "rotate(45deg)",
      },
    },
  });
  const [animeDone, setAnimeDone] = useState<boolean>(false);
  const containerRef = useRef(null);
  const handleAnimationComplete = () => {
    setAnimeDone(true);
  };
  ////////////// map setion don
  return (
    <Paper
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "transparent",
        paddingTop: "35vh",
      }}
    >
      <Dialog
        fullScreen
        open={open2}
        onClose={handleClose2}
        slots={{
          transition: Transition,
        }}
        sx={{
          "& .MuiDialog-container": {
            backgroundColor: "transparent",
            display: "flex", // Enable flexbox
            justifyContent: "center", // Horizontal centering
            alignItems: "center", // Vertical centering
          },
          "& .MuiPaper-root": {
            backgroundColor: "transparent",
            boxShadow:
              "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
            display: "flex", // Needed to center contents inside Paper
            justifyContent: "center",
            alignItems: "center",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent !important",
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            width: "80vw",
            height: "80vh",
            // backgroundColor: "red",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose2}
            aria-label="close"
            sx={{
              zIndex: 10,
              position: "absolute",
              top: 16,
              left: 16,
              color: "white", // optional, in case it's invisible on background
            }}
          >
            <CloseIcon />
          </IconButton>
          <Films id={targetFilm} />
        </Box>
      </Dialog>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        slots={{
          transition: Transition,
        }}
        sx={{
          // dialog container styles
          ".MuiDialog-container": {
            backgroundColor: "transparent", // container holding the dialog content
          },
          "& .MuiPaper-root": {
            boxShadow:
              "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",

            backgroundColor: "transparent",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent !important",
            opacity: 1,
          },
        }}
      >
        <Paper
          sx={{
            borderRadius: "30px",
            p: 2,
            position: "absolute",
            justifySelf: "center",
            alignSelf: "center",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(rgba(46,62,38,0.3), rgba(96, 170, 116, 0.3))",
            backdropFilter: "blur(5px)",
            boxShadow:
              "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
            top: "5vh",
            width: "50vw",
            height: "90vh",
            border: "solid 4px #bcabb1",
          }}
        >
          <PageContainer
            sx={{
              height: "100%",
              overflowY: "auto",
              backgroundColor: "transparent",
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{
                zIndex: 10,
                position: "absolute",
                top: 16,
                left: 16,
                color: "white", // optional, in case it's invisible on background
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                height: "100%",
                overflowY: "auto",
                pr: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                Top Films from {clickD?.properties.name}
              </Typography>

              {isLoading ? (
                <CircularProgress />
              ) : isError ? (
                <Typography color="error">Faid to load films</Typography>
              ) : (
                <InfiniteScroll
                  dataLength={films.length}
                  next={fetchNextPage}
                  hasMore={!!hasNextPage}
                  loader={<CircularProgress />}
                >
                  <Box
                    sx={{
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {films.map((film: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "inline-block",
                          verticalAlign: "top",
                          marginRight: 2,
                        }}
                        onClick={async () => {
                          setTargetFilm(film.film_id);
                          setOpen2(true);
                        }}
                      >
                        <FilmCard film={film} />
                      </Box>
                    ))}
                  </Box>
                </InfiniteScroll>
              )}
            </Box>
          </PageContainer>
        </Paper>
      </Dialog>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "520vh",
          left: 0,
          width: "100%",
          height: "110vh",
          zIndex: 0,
          opacity: 0.8,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",

          top: "135vh",
          left: 0,
          width: "100%",
          height: "90%",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      ></Box>

      <Box
        sx={{
          position: "absolute",

          top: "395vh",
          left: 0,
          width: "100vw",
          height: "140vh",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <Particles
          particleColors={["#bcabb1", "#9cd5ac"]}
          particleCount={800}
          particleSpread={20}
          speed={0.1}
          particleBaseSize={400}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </Box>
      {/** 
      <Box
        sx={{
          position: "absolute",
          top: "160vh",
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
      </Box>
*/}
      <Box
        sx={{
          position: "absolute",
          top: "180vh",
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <Ballpit
          count={200}
          gravity={1}
          friction={0.8}
          wallBounce={0.95}
          followCursor={false}
        />{" "}
      </Box>

      {/** 
      <Box
        sx={{
          position: "absolute",
          top: "100vh",
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.7,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </Box>
      */}
      {/* Background animation */}
      <Birdies />

      {/* Welcome text or animated intro */}
      {!animeDone ? (
        // Initial intro animation
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <BlurText
            text="Welcome to YUGEN"
            delay={150}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-2xl mb-8"
          />
        </div>
      ) : (
        // Show this only after animeDone is true
        <div
          style={{
            backgroundColor: "transparent",
            fontSize: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <GradientText
            colors={["#bcabb1", "#bcabb1", "#bcabb1", "#9cd5ac", "#bcabb1"]}
            animationSpeed={10}
            showBorder={false}
            className="custom-class"
          >
            Welcome to YUGEN
          </GradientText>

          <FadeContent
            blur={true}
            duration={1000}
            easing="ease-out"
            initialOpacity={0}
          >
            <Box
              style={{
                marginTop: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="text-rotate-inner"
              >
                <RotatingText
                  texts={["Watch", "Make", "Discuss", "Fund"]}
                  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
                <ShinyText
                  text="Short Films."
                  disabled={false}
                  speed={3}
                  className="custom-class"
                />
              </Box>
            </Box>
          </FadeContent>
        </div>
      )}

      <Box
        style={{
          position: "absolute",
          top: "105vh",
          maxHeight: "20vh",
          minWidth: "50vw",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          //   backgroundColor: "red",
          gap: 60,
        }}
      >
        <TrueFocus
          sentence="Find Short-Films from Around the World"
          manualMode={true}
          blurAmount={5}
          borderColor="#9cd5ac"
          animationDuration={0.5}
          pauseBetweenAnimations={1}
        />
      </Box>
      <Box
        style={{
          marginTop: "0vh",
          maxHeight: "90vh",
          width: "100vw",
          position: "absolute",
          top: "115vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          //   backgroundColor: "red",
          gap: 60,
          zIndex: 1,
        }}
      >
        <Box
          style={{
            marginTop: "0vh",
            Height: "90vh",
            width: "50vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // Center horizontally
            justifyContent: "center", // Center vertically
            zIndex: 2,
            WebkitMaskImage: `
  linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
  linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
`,
            maskImage: `
  linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
  linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
`,
            WebkitMaskComposite: "destination-in",
            maskComposite: "intersect",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        >
          <Globe
            globeImageUrl="earth.png"
            backgroundImageUrl="earth.png"
            atmosphereColor="#9cd5ac"
            atmosphereAltitude={"0.5"}
            lineHoverPrecision={0}
            polygonsData={countries.features.filter(
              (d) => d.properties.ISO_A2 !== "AQ"
            )}
            polygonAltitude={(d) => (d === hoverD ? 0.12 : 0.06)}
            polygonCapColor={(d) =>
              d === hoverD ? "#9cd5ac" : colorScale(getVal(d))
            }
            polygonSideColor={() => "rgba(188, 171, 177, 0.5)"}
            polygonStrokeColor={() => "#111"}
            onPolygonHover={(polygon, prevPolygon) =>
              setHoverD(polygon as CountryFeature | null)
            }
            polygonsTransitionDuration={300}
            onPolygonClick={async (polygon, prevPolygon) => {
              await setClickrD(polygon as CountryFeature | null);
              handleClickD();
            }}
          />
        </Box>
        <Box
          style={{
            Height: "90vh",
            width: "40vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {" "}
          <VariableProximity
            label={`Stories are the only language that trancends all boredrs.
               Discover beautifully crafted films filled culture-rich stories from around the world! `}
            className={"variable-proximity-demo"}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={containerRef}
            radius={100}
            falloff="linear"
          />
        </Box>
      </Box>
      <Box
        style={{
          marginTop: 5,
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: "200vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center", // Center horizontally
          justifyContent: "center", // Center vertically
          // background: "red",
          padding: "2rem",
        }}
      >
        <Stepper
          initialStep={1}
          onStepChange={(step) => {
            console.log(step);
          }}
          onFinalStepCompleted={() => console.log("All steps completed!")}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <h2 style={{ opacity: "0.5" }}>Short-Film Fund Raiser</h2>
            <p>
              {" "}
              <DecryptedText
                text="Let your audience fund your next project. And help many other artists by paticipating in their fund-raisers!"
                speed={100}
                maxIterations={20}
                characters="$    "
                className="revealed"
                parentClassName="all-letters"
                encryptedClassName="encrypted"
              />
            </p>
          </Step>
          <Step>
            <h2 style={{ opacity: "0.5" }}>Step 1</h2>
            <div
              style={{
                height: "215px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderRadius: "15px",
                backgroundColor: "#f0f0f0", // fallback bg
              }}
            >
              <img
                style={{
                  height: "fit-content",
                  width: "100%",
                  objectFit: "contain",
                  borderRadius: "15px",
                  marginTop: "0",
                }}
                src={UI2}
              />
            </div>
            <p style={{ opacity: "0.7", fontSize: "20px", color: "#000000" }}>
              You find a filmmaker you like, and you want to see more work from
              them.
            </p>
          </Step>
          <Step>
            <h2 style={{ opacity: "0.5" }}>Step 2</h2>
            <div
              style={{
                height: "215px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderRadius: "15px",
                backgroundColor: "#f0f0f0", // fallback bg
              }}
            >
              <img
                src={UI}
                alt="Step"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{ opacity: "0.7", fontSize: "20px", color: "#000000" }}>
              You visit their profile, and whats that! they have launched a
              fund-raiser for their next project!
            </p>
          </Step>
          <Step>
            <h2 style={{ opacity: "0.5" }}>Step 3</h2>
            <h3 style={{ opacity: "0.7", color: "#000000" }}>
              Choose and amount to donate:
            </h3>
            <p style={{ opacity: "0.7", fontSize: "20px", color: "#000000" }}>
              (Every penny counts!)
            </p>
            <PrettoSlider
              valueLabelDisplay="auto"
              aria-label="pretto slider"
              defaultValue={20}
            />
          </Step>
          <Step>
            <h2 style={{ opacity: "0.5" }}>Final Step</h2>

            <p style={{ opacity: "0.7", fontSize: "20px", color: "#000000" }}>
              You can enjoy the film you helped bring to life, and have your
              name on the contributers list!
            </p>
          </Step>
        </Stepper>
      </Box>
      <Box
        style={{
          marginTop: 5,
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: "300vh",
          display: "flex",
          flexDirection: "row",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          gap: "2rem", // Optional spacing between the two sections
        }}
      >
        {/* Left side: SpotlightCard */}
        <Box style={{ flex: 1, display: "flex", marginTop: 150 }}>
          <SpotlightCard
            className="custom-spotlight-card"
            spotlightColor="rgba(201,186,206,255)"
            style={{ width: "100%" }} // Ensures it fills the left side
          >
            <Box
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingTop: "3rem",
              }}
            >
              <ForumIcon
                sx={{
                  color: "#bcabb1",
                  fontSize: "50px",
                  opacity: 1,
                }}
              />
              <Typography
                variant="h6"
                style={{
                  marginTop: 20,
                  color: "#bcabb1",
                  fontWeight: "bolder",
                  opacity: 1,
                }}
              >
                Discuss Your Favourite Films.
              </Typography>
              <Typography
                variant="body1"
                align="left"
                style={{
                  marginTop: 20,
                  color: "#bcabb1",
                  fontWeight: "bolder",
                  opacity: 0.7,
                }}
              >
                Explore film clubs with different niches and interests. Discuss
                your favourite films with others.
              </Typography>
            </Box>
          </SpotlightCard>
        </Box>
        <Box
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: "red",
          }}
        >
          <ProfileCard
            name="Documentries"
            title="Based on a Real Story..."
            handle="Docs"
            status="123,3837 members"
            contactText="Join"
            iconUrl={docs}
            avatarUrl={docs}
            showUserInfo={true}
            enableTilt={true}
            behindGradient={
              "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), rgba(188, 171, 177, var(--card-opacity)) 4%, rgba(188, 171, 177, calc(var(--card-opacity) * 0.75)) 10%, rgba(188, 171, 177, calc(var(--card-opacity) * 0.5)) 50%, rgba(188, 171, 177, 0) 100%), radial-gradient(35% 52% at 55% 20%, #9cd5ac 0%, #bcabb100 100%), radial-gradient(100% 100% at 50% 50%, #9cd5ac 1%, #bcabb100 76%), conic-gradient(from 124deg at 50% 50%, #bcabb1 0%, #9cd5ac 40%, #9cd5ac 60%, #bcabb1 100%)"
            }
            showBehindGradient={true}
            innerGradient={
              "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), rgba(188, 171, 177, var(--card-opacity)) 5%, rgba(188, 171, 177, calc(var(--card-opacity) * 0.3)) 30%, rgba(28, 28, 28, 0) 100%), radial-gradient(40% 60% at 60% 20%, #bcabb1 0%, rgba(188, 171, 177, 0) 100%), radial-gradient(100% 100% at 50% 50%, #bcabb1 1%, rgba(188, 171, 177, 0) 76%), conic-gradient(from 124deg at 50% 50%, #1a1a1a 0%, #bcabb1 40%, #bcabb1 60%, #1a1a1a 100%)"
            }
            onContactClick={() => window.location.replace("/#/club")}
          />
        </Box>
        <Box style={{ flex: 1, display: "flex", marginTop: 150 }}>
          <SpotlightCard
            className="custom-spotlight-card"
            spotlightColor="rgba(201,186,206,255)"
            style={{ width: "100%" }} // Ensures it fills the left side
          >
            <Box
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingTop: "3rem",
              }}
            >
              <Diversity1Icon
                sx={{
                  color: "#bcabb1",
                  fontSize: "50px",
                  opacity: 1,
                }}
              />
              <Typography
                variant="h6"
                style={{
                  marginTop: 20,
                  color: "#bcabb1",
                  fontWeight: "bolder",
                  opacity: 1,
                }}
              >
                Find like-minded film lovers.
              </Typography>
              <Typography
                variant="body1"
                align="left"
                style={{
                  marginTop: 20,
                  color: "#bcabb1",
                  fontWeight: "bolder",
                  opacity: 0.7,
                }}
              >
                Meet people from around the world with similar film tastes and
                intrests.
              </Typography>
            </Box>
          </SpotlightCard>
        </Box>
      </Box>

      {/* Right side: Flying Posters */}

      <Box
        style={{
          marginTop: 5,
          width: "100vw",
          height: "130vh",
          position: "absolute",
          top: "400vh",
          //background: "red",
          padding: "2rem",
          WebkitMaskImage: `
    linear-gradient(to bottom, black 0%, black 85%, transparent 100%),
    linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
  `,
          maskImage: `
    linear-gradient(to bottom, black 0%, black 85%, transparent 100%),
    linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
  `,
          WebkitMaskComposite: "destination-in",
          maskComposite: "intersect",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <Box style={{ height: "80vh", width: "100vw" }}>
          <CircularText
            text="By*Filmmakers*For*Filmmakers*"
            onHover="speedUp"
            spinDuration={20}
            className="custom-class"
          />
          <CircularGallery bend={5} textColor="#ffffff" borderRadius={0.05} />
        </Box>
      </Box>
      <Box
        ref={containerRef}
        alignContent={"center"}
        gap={0}
        style={{
          paddingTop: 300,
          marginTop: 5,
          width: "100vw",
          height: "110vh",
          position: "absolute",
          display: "flex",
          alignItems: "center", // center vertically
          justifyContent: "center", // center horizontally
          flexDirection: "column",
          top: "515vh",
          padding: "2rem",
          WebkitMaskImage: `
      linear-gradient(to bottom, black 0%, black 85%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
    `,
          maskImage: `
      linear-gradient(to bottom, black 0%, black 85%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
    `,
          WebkitMaskComposite: "destination-in",
          maskComposite: "intersect",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <ShinyText2
          data-crosshair-glitch
          text="Press the record button, and start telling stories!"
          disabled={false}
          speed={3}
          className="Story"
        />
        <Crosshair containerRef={containerRef} color="#ffffff" />
        <div
          onClick={handleClick}
          data-crosshair-glitch
          style={{
            display: "flex",
            alignItems: "center", // center vertically
            justifyContent: "center", // center horizontally
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "3rem", // smaller margin for spacing
            width: "fit-content",
            height: "fit-content",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              height: "auto",
              aspectRatio: "1 / 1",
              border: "solid red 8px",
              width: "12vw",
              transition:
                "width 0.3s ease, height 0.3s ease, transform 0.3s ease",
              "&:hover": {
                width: "12.5vw",
                transform: "scale(1.1)",
              },
            }}
          >
            <RadioButtonCheckedIcon fontSize="large" sx={{ color: "red" }} />
            <ShinyText2
              data-crosshair-glitch
              text="rec"
              disabled={false}
              speed={3}
              className="Record"
            />
          </Box>
        </div>
      </Box>
    </Paper>
  );
}

export default Landing;
