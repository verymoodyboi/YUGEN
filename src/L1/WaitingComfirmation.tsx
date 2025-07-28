import { Box, Typography } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";

function WaitingComfirmation() {
  return (
    <Box className="centered-box-v-blurred">
      <CheckIcon sx={{ fontSize: 100 }}></CheckIcon>
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Freckle Face", system-ui',
        }}
      >
        Your Email is not verified yet, Check your inbox!
      </Typography>
    </Box>
  );
}

export default WaitingComfirmation;
