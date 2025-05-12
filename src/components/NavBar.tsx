import "../App.css";
import SettingsIcon from "../YugenAssits/Icons/SettingsIcon.png";
import HomeIcon from "../YugenAssits/Icons/HomeIcon.png";
import UploadIcon from "../YugenAssits/Icons/UploadIcon.png";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <div className="navbar">
      <Link to="/" className="navbar-icons">
        <img src={HomeIcon} alt="Home" height={30} />
      </Link>
      <Link to="/" className="navbar-icons">
        <img src={SettingsIcon} alt="Settings" height={30} />
      </Link> 
      <Link to="/UploadFilmPage" className="navbar-icons">
        <img src={UploadIcon} alt="Upload" height={30} />
      </Link>
    </div>
  );
}
export default NavBar;
