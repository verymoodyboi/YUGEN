import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate, useSearchParams } from "react-router-dom";

function WaitingComfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
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
        an email was sent to {email} chack your inbox to confirm!
      </Typography>
    </Box>
  );
}

export default WaitingComfirmation;
