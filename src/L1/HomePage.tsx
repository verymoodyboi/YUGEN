import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from "../server/config";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import CloseIcon from "@mui/icons-material/Close";
import Films from "../L2/Film";
import { TransitionProps } from "@mui/material/transitions";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import KeyIcon from "@mui/icons-material/Key";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  TextField,
} from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ShieldIcon from "@mui/icons-material/Shield";
import { ListContext } from "antd/lib/list/context";

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
        image={
          supabase.storage.from("posters").getPublicUrl(film.poster_path).data
            .publicUrl
        }
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
        <IconButton
          onClick={async () => {
            setOpen(true);
          }}
        >
          <DriveFileRenameOutlineIcon />
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
            backdropFilter: "blur(10px)", // Optional: glassy effect
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

const HomePage: React.FC = () => {
  //Reset Password
  const { userInfo: user } = useAuth();
  console.log("user:", user);
  const [isDone, setIsDone] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return toast.warn("Valid email required");
    setIsDone(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
  };
  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };
  const [open3, setOpen3] = React.useState(false);
  const handleClose3 = () => {
    setOpen3(false);
  };
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdata", {
          params: { offset: pageParam, limit: 10 },
        });
        console.log(res.data.poster_path);
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];
  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };
  const [open2, setOpen2] = React.useState(false);
  const [targetFilm, setTargetFilm] = React.useState(0);
  //logout Handle///////////////
  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
      return;
    }
    navigate("/login");
  };
  ////////////////////////////////
  // acc options
  const [openAcc, setOpenAcc] = React.useState(false);
  const toggleAcc = (newOpen: boolean) => () => {
    setOpenAcc(newOpen);
  };

  const AccOptions = (
    <Box
      sx={{
        width: 270,
        backgroundColor: "rgba(255, 255, 255, 0.1)", // translucent white
        backdropFilter: "blur(10px)", // blur effect
        WebkitBackdropFilter: "blur(10px)", // Safari support
      }}
      role="presentation"
      onClick={toggleAcc(false)}
    >
      <Divider>
        <ShieldIcon /> Security
      </Divider>
      <List>
        <ListItem>
          <ListItemButton></ListItemButton>
          <ListItemText
            sx={{ cursor: "pointer" }}
            onClick={() => {
              setOpen3(true);
            }}
          >
            Change password
          </ListItemText>
          <ListItemIcon>
            <KeyIcon />
          </ListItemIcon>
        </ListItem>
      </List>
    </Box>
  );
  const publicUrl = supabase.storage.from("pfps").getPublicUrl(user.pfp_path)
    .data.publicUrl;

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      <Birdies></Birdies>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center", // center everything vertically
          width: "100vw",
          height: "10vh", // you probably don't need 30vh for a nav

          gap: 2,
          position: "absolute",
          left: 0,
          top: 0,
          px: 2,
        }}
      >
        {user && <div></div>}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            aria-controls={open ? "demo-positioned-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            src={
              supabase.storage.from("pfps").getPublicUrl(user.pfp_path).data
                .publicUrl
            }
            sx={{ width: 60, height: 60, cursor: "pointer" }}
          />
          <Typography variant="h6" fontFamily={'"Freckle Face", system-ui'}>
            {(user && user.username) || "guest"}
          </Typography>
        </Box>
        <NavBar />

        <SearchBar />
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#341c1c",
              color: "#fff",
              borderRadius: "12px",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)",
              minWidth: 160,
              mt: 7,
              py: 1,
            },
          }}
        >
          <MenuItem
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              justifyContent: "space-evenly",
            }}
            onClick={() => {
              navigate("/profile");
              handleClose();
            }}
          >
            <PhotoCameraFrontIcon />
            Profile
          </MenuItem>
          <MenuItem
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              justifyContent: "space-evenly",
            }}
            onClick={() => {
              handleClose();
              setOpenAcc(true);
            }}
          >
            <SettingsSuggestIcon />
            account
          </MenuItem>
          <MenuItem
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              justifyContent: "space-evenly",
            }}
            onClick={() => {
              handleClose();
              logOut();
            }}
          >
            <LogoutIcon />
            Logout
          </MenuItem>
        </Menu>
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
          left: "2vw",
          top: "12vh",
          width: "70vw",
          height: "86vh",
        }}
      >
        <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
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
              Hot Right Now
            </Typography>

            {isLoading ? (
              <CircularProgress />
            ) : isError ? (
              <Typography color="error">Failed to load films</Typography>
            ) : (
              <Box
                id="horizontalScrollDiv"
                onWheel={(e) => {
                  e.currentTarget.scrollLeft += e.deltaY;
                }}
                sx={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  display: "block",
                  width: "100%",
                  paddingBottom: 2,
                }}
              >
                <InfiniteScroll
                  dataLength={films.length}
                  next={fetchNextPage}
                  hasMore={!!hasNextPage}
                  loader={<CircularProgress />}
                  scrollableTarget="horizontalScrollDiv"
                  scrollThreshold={0.8}
                  horizontal={true}
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
                </InfiniteScroll>
              </Box>
            )}
          </Box>
        </PageContainer>
      </Paper>

      <SideMenu></SideMenu>
      {open2 && (
        <Dialog
          fullScreen
          open={open2}
          onClose={handleClose2}
          TransitionComponent={Transition}
          keepMounted={false} // force unmount on close
          sx={{
            "& .MuiDialog-container": {
              backgroundColor: "transparent",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: "rgba(0,0,0,0.5)",
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
            <Films id={targetFilm} userInfo={user} />
          </Box>
        </Dialog>
      )}
      <Dialog
        open={open3}
        onClose={handleClose3}
        hideBackdrop
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            justifyContent: "center", // center vertically
            alignItems: "center", // center horizontally
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {isDone && (
          <Box className="centered-box-v-blurred">
            <IconButton
              edge="start"
              onClick={handleClose3}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>{" "}
            <CheckIcon sx={{ fontSize: 100 }}></CheckIcon>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              You will be sent an email to reset your password!
            </Typography>
          </Box>
        )}
        {!isDone && (
          <Box className="centered-box-v-blurred">
            <IconButton
              edge="start"
              onClick={handleClose3}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>
            <VpnKeyIcon sx={{ fontSize: 100, color: "#341c1c" }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: ' "Freckle Face", system-ui',
                color: "#341c1c",
              }}
            >
              Please comfirm your email to reset your password
            </Typography>
            <TextField
              fullWidth
              label="Email"
              //value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                borderColor: "#9cd5ac",
                color: "white",
                backgroundColor: "#9cd5ac",
                "&:hover": {
                  // Font color on hover
                  borderColor: "#3e5e47ff",
                  backgroundColor: "#3e5e47ff", // Border color on hover
                },
              }}
              onClick={() => {
                handleChangePasswordEmail();
              }}
            >
              Finish
            </Button>
          </Box>
        )}
      </Dialog>

      <Drawer
        PaperProps={{
          sx: {
            backgroundColor: "rgba(255, 255, 255, 0.1)", // semi-transparent
            backdropFilter: "blur(10px)", // blur effect
            WebkitBackdropFilter: "blur(10px)", // Safari support
          },
        }}
        open={openAcc}
        onClose={toggleAcc(false)}
      >
        {AccOptions}
      </Drawer>
    </div>
  );
};
export default HomePage;
