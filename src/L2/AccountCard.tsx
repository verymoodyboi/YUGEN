import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from "../server/config";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";

import { useAuth } from "../contexts/AuthContext";
import { Box, Typography, Card, Button } from "@mui/material";

const AccountCard = ({ account }: any) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  return (
    <Card
      className="account-card"
      sx={{
        cursor: "pointer",
        borderRadius: "5%",
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        height: "100%", // so it fills the Grid cell
      }}
      onClick={() => {
        if (userInfo.username == account.username) {
          navigate("/profile");
        } else {
          navigate(`/@?username=${encodeURIComponent(account.username)}`);
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Avatar
          src={
            account?.pfp_path
              ? supabase.storage.from("pfps").getPublicUrl(account.pfp_path)
                  .data.publicUrl
              : undefined
          }
          sx={{ height: 100, width: 100, mb: 1 }}
        />
        <Typography
          variant="h4"
          sx={{
            color: "rgba(0, 0, 0, 0.7)",
            fontFamily: '"Freckle Face", system-ui',
            mb: 1,
          }}
        >
          @{account.username}
        </Typography>
        <Box
          sx={{
            color: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <VideocamOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.7)" }} />
          {account?.films_count ?? 0}
          <GroupOutlinedIcon sx={{ color: "rgba(0, 0, 0, 0.7)" }} />
          {account?.sub_count ?? 0}
        </Box>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1, // spacing between text and button
          }}
        >
          <Box
            sx={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maskImage: "linear-gradient(to right, black 70%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, black 70%, transparent)",
              flexShrink: 1,
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="body1"
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
              sx={{ display: "inline" }}
            >
              {account?.bio?.slice(0, 50)}...
            </Typography>
          </Box>

          <Button
            onClick={() => {
              // setBioEpand(1);
              // scrollToTop();
            }}
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              color: "#3c1c24",
              flexShrink: 0,
              minWidth: "auto",
              padding: 0,
            }}
          >
            more
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
export default AccountCard;
