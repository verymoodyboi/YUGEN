import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const RainbowProgress = styled(CircularProgress)(() => ({
  "& .MuiCircularProgress-circle": {
    stroke: "url(#rainbow)", // reference external gradient
  },
}));

export default function CustomLoading() {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      {/* Global gradient definition (hidden but in DOM) */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="rainbow" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bcabb1" />
            <stop offset="25%" stopColor="#bcabb1" />
            <stop offset="50%" stopColor="#bcabb1" />
            <stop offset="75%" stopColor="#9cd5ac" />
            <stop offset="100%" stopColor="#9cd5ac" />
          </linearGradient>
        </defs>
      </svg>

      {/* Spinner that uses gradient */}
      <RainbowProgress size={60} thickness={5} />
    </Box>
  );
}
