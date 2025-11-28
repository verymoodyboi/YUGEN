import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
// install with: npm install @fontsource/freckle-face

const RainbowProgress = styled(CircularProgress)(() => ({
  "& .MuiCircularProgress-circle": {
    stroke: "url(#rainbow)",
  },
  "& .MuiCircularProgress-circleDeterminate": {
    stroke: "url(#rainbow)",
  },
}));

export default function CustomLoading({
  value = 75,
  variant = "indeterminate",
}) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      {/* Global gradient definition */}
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

      {/* Spinner */}
      <RainbowProgress
        variant={variant}
        value={value}
        size={100}
        thickness={5}
      />

      {/* Percentage label (only for determinate) */}
      {variant === "determinate" && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: "'Freckle Face', system-ui",
              color: "rgba(0, 0, 0, 0.5)",
            }}
          >
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
