import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../SearchBar";
import NavBar from "../NavBar";
import Birdies from "../Birdies";
import Thoughts from "../thoughts";
import SideMenu from "../SideMenu";
import ava from "./docs 3.jpg";
import ava2 from "./protfolio.jpg";
import post from "./fund.jpg";
import Club from "../Club";
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
  Tabs,
  Tab,
  Avatar,
  CardHeader,
} from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import Dock from "./Dock";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{ overflowY: "scroll" }}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const FilmCard = ({ film }: any) => {
  const [open, setOpen] = React.useState(false);
  const items = [
    {
      icon: <ArrowUpwardIcon size={18} />,
      label: "Home",
      onClick: () => alert("Home!"),
    },
    {
      icon: <ArrowDownwardIcon size={18} />,
      label: "Archive",
      onClick: () => alert("Archive!"),
    },
    {
      icon: <AddCommentIcon size={18} />,
      label: "Archive",
      onClick: () => alert("Archive!"),
    },
  ];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "5%",
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        width: "60vw",

        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        transition: "box-shadow 0.2s ease, transform 0.1s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderBottom: "2px solid grey",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "gray",
            width: 100,
            height: 100,
            aspectRatio: "1 / 1",
          }}
          alt="Remy Sharp"
          src={ava2}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant="h4"
            sx={{
              color: "whitesmoke",
              fontFamily: '"Freckle Face", system-ui',
            }}
          >
            Verymoodyboi
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddToQueueIcon />}
            sx={{ mt: 1, width: "fit-content", backgroundColor: "transparent" }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "whitesmoke",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              Follow
            </Typography>
          </Button>
        </Box>
      </Box>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                justifySelf: "left",
                color: "#341c1c",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="h5"
            >
              Why are documentries important?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "whitesmoke",
                fontFamily: '"Freckle Face", system-ui',

                whiteSpace: "normal", // allow normal wrapping
                wordBreak: "break-word", // handle long words
                width: "100%", // ensure it fills the container
              }}
            >
              {`There are many ways that documentaries demonstrate their
              importance and purpose in the present day, but influential BBC
              producer and documentarian Parminder Vir said it best:
              “Documentary films tell important, often unknown stories and bring
              awareness to a wider audience, and are some of the best resources
              for information, inspiration and entertainment. They have also
              become core elements and prompters of social issue campaigns.”
              Documentaries give the average person access to crucial
              information about global, social and political issues they might
              not otherwise be exposed to. For individuals, it’s important to
              constantly challenge your own perspective and to find inspiration
              to make the world around you a better place for everyone. At a
              more micro-level, documentaries and documentary-style video
              content is a valid and growing way to debut brands and products in
              a way that feels genuine. A company could find value in explaining
              their unique process with branded storytelling or introduce their
              Founder in a single-character documentary style. How to Make an
              Impact with Your Documentary A documentary is only as effective as
              the creator’s passion for the story they’re telling. Let’s break
              this down into 3 steps: 1. Identify your audience Be as specific
              as possible. Think about who the message is targeted for, where
              they live, what their background is, where they are watching your
              documentary (online, broadcast, live stream). And then get even
              more granular; what are their jobs, what education do they have,
              how receptive are they to this new idea or new way of thinking?
              The more specific you can get, the easier crafting your message
              will be. 2. Determine the message Documentaries more often than
              not have a call to action at the end. Determine what you want your
              audience to do after viewing your film. These actions could
              include donating to a charity, volunteering time for a cause,
              changing their habits, or considering your products/services. Can
              you change what someone believes, as well as what someone does
              with your message? 3. Invest in production Even “found footage”
              documentaries have production crews behind them. That’s not to say
              that you have to shell out the money for a Hollywood-scale
              production, but it’s important to prioritize how you’ll produce
              your film. If you decide to work with a production company, it’s
              important to understand that they will not only execute the
              production of your film, but consult on the best way to spend your
              secured budget. Purposeful Storytelling through Documentary-style
              Marketing Once you’ve determined all of the above, the next step
              is to bring it all to life. If you’re ready to tell your story,
              your brand’s story or bring your product into the world—we’d be
              honored to help make that happen. Check out our New Project Form
              to get in touch with a member of our talented team of
              storytellers.`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CardMedia
          component="img"
          image={post}
          alt="Film thumbnail"
          style={{
            width: "80%",
            height: "auto",
            aspectRatio: "16/9",
            objectFit: "Cover",
            borderRadius: "5% ",
            border: "5px solid #341c1c",
          }}
        />
      </div>

      <Box
        sx={{
          position: "relative",
          height: "15vh",
          //backgroundColor: "red",
        }}
      >
        <Dock
          items={items}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: 2,
          position: "relative",
          // backgroundColor: "red",
        }}
      >
        <Thoughts filmId={1} />
      </Box>
    </Card>
  );
};

export default function TempClub() {
  const [value, setValue] = React.useState(0);
  const [user, setUser] = React.useState(0);
  const [profile, setProfile] = React.useState<any>();
  const getUserProfile = async () => {
    const user_id = 1;
    try {
      const res = await axios.get("http://localhost:3001/profile", {
        params: { userID: user_id },
      });
      setProfile(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };
  React.useEffect(() => {
    getUserProfile();
  }, []);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdataprofile", {
          params: { offset: pageParam, limit: 10 },
        });
        //console.log(res.data);
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      <Birdies></Birdies>
      <NavBar></NavBar>
      <SearchBar></SearchBar>

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",
          left: "2vw",
          top: "12vh",
          width: "70vw",
          height: "86vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "left",
            p: 2,
          }}
          gap={2}
        >
          <Avatar
            sx={{
              bgcolor: "gray",
              width: 100,
              height: 100,
              aspectRatio: "1/1",
            }}
            alt="Remy Sharp"
            src={ava}
          />
          <Box
            sx={{
              width: "fit-content",
              display: "inline-block",
              justifyContent: "left",
              p: 2,
            }}
            gap={2}
          >
            <Typography
              variant="h5"
              fontFamily={'"Freckle Face", system-ui'}
              color="#3c1c24"
            >
              Documentries
            </Typography>
            <Typography
              variant="body2"
              justy={"left"}
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
            >
              Based on a Real Story...
            </Typography>
            <Typography
              variant="body2"
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
            >
              123,3837 members
            </Typography>
          </Box>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#3c1c24",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#3c1c24",
                fontWeight: "bold",
              },
            }}
          >
            <Tab
              label="Library"
              style={{ fontFamily: '"Freckle Face", system-ui' }}
              {...a11yProps(0)}
            />

            <Tab
              style={{ fontFamily: '"Freckle Face", system-ui' }}
              label="Info"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
                overflowY: "auto",
                pr: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                Trending in Documentries
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
                      display: "flex",
                      flexDirection: "column", // stack children vertically
                      overflowY: "auto", // enable vertical scroll
                      height: "400px", // set a fixed height for scrolling to take effect
                      width: "100%",
                      gap: 10,
                    }}
                  >
                    {films.map((film: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 1,
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
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
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
                Bio
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                {profile?.bio || "Loading..."}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                More Info
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <PublicOutlinedIcon sx={{ color: "white" }} />
                {profile?.region || "Loading..."}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <GroupOutlinedIcon sx={{ color: "white" }} />
                {profile?.sub_count}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <VideocamOutlinedIcon sx={{ color: "white" }} />
                {profile?.films_count}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <CalendarMonthOutlinedIcon sx={{ color: "white" }} />
                {profile?.join_date}
              </Typography>
            </Box>
          </PageContainer>
        </CustomTabPanel>
      </Paper>
      <SideMenu></SideMenu>
    </div>
  );
}
