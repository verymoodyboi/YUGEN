import "../App.css";
import SettingsIcon from "../YugenAssits/Icons/SettingsIcon.png";
import HomeIcon from "../YugenAssits/Icons/HomeIcon.png";
import UploadIcon from "../YugenAssits/Icons/UploadIcon.png";
import LoginIcon from "../YugenAssits/Icons/Loginicon.png";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <div className="NavBar">
      <Link to="/">
        <img src={HomeIcon} alt="Home" height={30} />
      </Link>
      <Link to="/SignUpPage">
        <img src={LoginIcon} alt="SignUp" height={30} />
      </Link>
      <Link to="/UploadFilmPage">
        <img src={UploadIcon} alt="Upload" height={30} />
      </Link>
    </div>
  );
}
export default NavBar;
