import "../App.css";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import { TextField, Button } from "@mui/material";
function Films() {
  const [filmData, setFilmData] = useState<any | null>(null);
  const [uploaderData, setUploaderData] = useState<any | null>(null);
  const [filmID, setFilmID] = useState<any | null>(null);
  const [click, setClick] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  const validate = () => {
    const errors = {};
    if (!rating) {
      errors.rating = "no rating";
    }
    return errors;
  };
  const SendToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      axios.post("http://localhost:3001/addthought", formData);
    } catch (error: any) {
      if (error) {
        return error;
      } else {
        return "";
      }
    }
    setIsSubmit(true);
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    toggleDrawer(false);
    event.preventDefault();
    const errors = await validate();
    if (Object.keys(errors).length === 0) {
      await SendToServer();
    }
  };
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const handleClick = async () => {
    try {
      const response = await axios.get("http://localhost:3001/filmdata", {
        params: { filmID },
      });
      if (response.data && response.data.length > 0) {
        setFilmData(response.data[0]);
        try {
          const id = filmData.uploader_id;
          const response2 = await axios.get(
            "http://localhost:3001/getuploader",
            {
              params: { id },
            }
          );
          if (response2.data && response2.data.length > 0) {
            setUploaderData(response2.data[0]);
          }
        } catch (error) {
          console.error("Error fetching film data:", error);
        }
      }
      setClick(true);
    } catch (error) {
      console.error("Error fetching film data:", error);
    }
  };
  const DrawerList = (
    <Box sx={{ width: 0, backgroundColor: "transparent" }} role="presentation">
      <form className="ReviewForm" onSubmit={handleSubmit}>
        <label id="ReviewLabel">Review</label>
        <p id="ReviewText">
          How many stars does this film deserve? Let the creator know!
        </p>
        <Rating
          max={10}
          precision={0.5}
          defaultValue={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
        />
        <TextField
          name="Comment"
          label="Comment (Optional)"
          variant="outlined"
          multiline
          maxRows={20}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
            marginTop: "16px",
          }}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <Button
          type="submit"
          style={{ background: "#cc651f", color: "white", marginTop: "20px" }}
          onClick={async () => {
            setOpen(false);
          }}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
  return (
    <div>
      <p>film ID:</p>
      <input
        type="text"
        onChange={(e) => {
          setFilmID(e.target.value);
        }}
      />
      <button onClick={handleClick}>click</button>
      {click && filmData && uploaderData && (
        <div className="film-and-filmData">
          <br></br>
          <Divider />
          <hr />
          <Box
            display="flex"
            gap={2}
            justifySelf={"left"}
            alignSelf={"self-start"}
            alignContent={"flex-start"}
            justifyContent="space-between"
            sx={{ width: "fit-content", height: "fit-content" }}
          >
            <Avatar
              alt="Remy Sharp"
              src={"uploads/pfp" + "/" + uploaderData.pfp_path}
              sx={{ width: 70, height: 70 }}
            />
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                color: "black",
              }}
            >
              {uploaderData.username}
            </Typography>
          </Box>
          <Divider />
          <hr />
          <ReactPlayer url={filmData.film_path} controls style={{}} />
          <Divider />
          <hr />
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ width: "90%", height: "fit-content" }}
          >
            {" "}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  color: "black",
                }}
              >
                {filmData.film_title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                {filmData.film_genre && <p>{filmData.film_genre}</p>}
                {!filmData.film_genre && <p>Genres not available</p>}
              </Typography>
            </div>
            {rating != 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid>
                  <IconButton
                    sx={{ backgroundColor: "goldenrod" }}
                    aria-label="delete"
                    onClick={toggleDrawer(true)}
                  >
                    <StarOutlineIcon fontSize="large" />

                    <Typography
                      variant="h6"
                      sx={{
                        color: "",
                        fontFamily: '"Freckle Face", system-ui',
                      }}
                    >
                      {rating}
                    </Typography>
                  </IconButton>
                </Grid>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
                  {!filmData.avg_rating && <p>Rating not available</p>}
                </Typography>
              </div>
            )}
            {rating == 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid>
                  <IconButton aria-label="delete" onClick={toggleDrawer(true)}>
                    <StarOutlineIcon fontSize="large" />
                  </IconButton>
                </Grid>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
                  {!filmData.avg_rating && <p>Rating not available</p>}
                </Typography>
              </div>
            )}
          </Box>

          <Divider />
          <hr />
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ width: "99%", height: "fit-content" }}
          >
            {" "}
            <Card variant="outlined" className="Card">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Thesis
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  <p>{filmData.thesis}</p>
                </Typography>
              </Box>
            </Card>
            <Card variant="outlined" className="Card">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Cast
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.cast && <p>{filmData.cast}</p>}
                  {!filmData.cast && <p>Cast not available</p>}
                </Typography>
              </Box>
            </Card>
            <Card variant="outlined" className="Card">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Crew
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.crew && <p>{filmData.crew}</p>}
                  {!filmData.crew && <p>Cast not available</p>}
                </Typography>
              </Box>
            </Card>
          </Box>
        </div>
      )}
      {click && !filmData && (
        <div>
          <Alert severity="error">Film not found!</Alert>
        </div>
      )}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}

export default Films;
