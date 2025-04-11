import "../App.css";
import SettingsIcon from "../YugenAssits/Icons/SettingsIcon.png";
import HomeIcon from "../YugenAssits/Icons/HomeIcon.png";
import UploadIcon from "../YugenAssits/Icons/UploadIcon.png";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <div className="NavBar">
      <Link to="/">
        <img src={HomeIcon} alt="Sittings" height={30} />
      </Link>
      <Link to="/">
        <img src={SettingsIcon} alt="Sittings" height={30} />
      </Link>
      <Link to="/UploadFilmPage">
        <img src={UploadIcon} alt="Sittings" height={30} />
      </Link>
    </div>
  );
}
export default NavBar;
