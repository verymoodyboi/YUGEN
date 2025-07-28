import "../App.css";
import HomeIcon from "../YugenAssits/Icons/HomeIcon.png";
import UploadIcon from "../YugenAssits/Icons/UploadIcon.png";
import { Button, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import supabase from "../server/config";
import { useNavigate } from "react-router-dom";
function NavBar() {
  const navigate = useNavigate();
  const logOut = async () => {
    const Out = await supabase.auth.signOut();
    //window.location.reload();
    navigate("/LoginPage");
  };
  return (
    <div className="NavBar">
      <IconButton onClick={logOut}>
        <LogoutIcon sx={{ color: "#3c1c24" }} />
      </IconButton>
      <Link to="/">
        <img src={HomeIcon} alt="Home" height={30} />
      </Link>

      <Link to="/UploadFilmPage">
        <img src={UploadIcon} alt="Upload" height={30} />
      </Link>
    </div>
  );
}
export default NavBar;
