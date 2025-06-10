import React, { useState, useEffect, useMemo } from "react";
import "../App.css";
import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import UI from "../YugenAssits/Landing/Site interface (Profile).png";
import UI2 from "../YugenAssits/Landing/Site interface mohy's.png";
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
  const [countries, setCountries] = useState<CountriesData>({ features: [] });
  const [hoverD, setHoverD] = useState<CountryFeature | null>(null);
  const [clickD, setClickrD] = useState<CountryFeature | null>(null);
  const [open, setOpen] = React.useState(false);
  //////////////
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdata_map", {
          params: {
            offset: pageParam,
            limit: 10,
            country: clickD?.properties.name,
          },
        });
        //console.log(res.data);
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];
  //////////////

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickD = () => {
    handleClickOpen();
  };
  {
  }
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
            background:
              "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
            borderRadius: "30px",
            p: 2,

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

            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "transparent",
            boxShadow:
              "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
            left: "0vw",
            top: "0vh",
            width: "100vw",
            height: "100vh",
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
                Hot Right Now in {clickD?.properties.name}
              </Typography>

              {isLoading ? (
                <CircularProgress />
              ) : isError ? (
                <Typography color="error">Failed to load films</Typography>
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
                      >
                        <FilmCard film={film} />
                      </Box>
                    ))}
                  </Box>
                </InfiniteScroll>
              )}

              <Typography
                variant="h4"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                Latest from {clickD?.properties.name}
              </Typography>
              {isLoading ? (
                <CircularProgress />
              ) : isError ? (
                <Typography color="error">Failed to load films</Typography>
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
          top: "420vh",
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

          top: "295vh",
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
          top: "190vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center", // Center horizontally
          justifyContent: "center", // Center vertically
          // background: "red",
          padding: "2rem",
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
              <h2>Short-Film Fund Raiser</h2>
              <p>Produce Your Favourite Short-Films</p>
            </Step>
            <Step>
              <h2>Step 1</h2>
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
              <p>
                You find a filmmaker you like, and you want to see more work
                from them.
              </p>
            </Step>
            <Step>
              <h2>Step 2</h2>
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
              <p>
                You visit their profile, and whats that! they have launched a
                fund-raiser for their next project!
              </p>
            </Step>
            <Step>
              <h2>Step 3</h2>
              <h3>Choose and amount to donate:</h3>
              <p>(Every penny counts!)</p>
              <PrettoSlider
                valueLabelDisplay="auto"
                aria-label="pretto slider"
                defaultValue={20}
              />
            </Step>
            <Step>
              <h2>Final Step</h2>

              <p>
                Have your name in the contrubters list when the film comes out!
              </p>
            </Step>
          </Stepper>
        </Box>
        <Box
          style={{
            Height: "90vh",
            width: "50vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "left",
            zIndex: 2,
          }}
        >
          <DecryptedText
            text="Let your audience fund your next project. And help many other artists by paticipating in their fund-raisers!"
            speed={100}
            maxIterations={20}
            characters="$    "
            className="revealed"
            parentClassName="all-letters"
            encryptedClassName="encrypted"
          />
        </Box>
      </Box>
      <Box
        style={{
          marginTop: 5,
          width: "100vw",
          height: "130vh",
          position: "absolute",
          top: "300vh",
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
          top: "415vh",
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
