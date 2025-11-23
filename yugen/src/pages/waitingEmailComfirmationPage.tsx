import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

function WaitingComfirmation() {
  return (
    <Box className="centered-box-v-blurred">
      <img
        src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
        alt="Yugen Logo"
        className="h-36 w-auto mx-auto mb-6"
      />

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
