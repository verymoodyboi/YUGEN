import "../App.css";
import GenreLogo from "../YugenAssits/Icons/GenreLogopng.png";
import HistoryLogo from "../YugenAssits/Icons/HistoryIcon.png";
import FollowsLogo from "../YugenAssits/Icons/FollowsIcon.png";
import PlaylistsLogo from "../YugenAssits/Icons/PlaylistIcon.png";
import WatchListLogo from "../YugenAssits/Icons/WatchListLogo.png";
import { Space, Flex, Button } from "antd";
import EyeOutlined from "antd";
import { relative } from "path";
function GlassMenu() {
  return (
    <Flex
      gap={"10%"}
      justify="center"
      align="center"
      className="GlassMenu"
      vertical
    >
      <Button
        type="text"
        icon={<img src={GenreLogo} alt="" className="menu-icon" />}
        className="button"
      >
        Genres
      </Button>
      <Button
        type="text"
        icon={<img src={HistoryLogo} alt="" className="menu-icon" />}
        className="button"
      >
        History
      </Button>
      <Button
        type="text"
        icon={<img src={FollowsLogo} alt="" className="menu-icon" />}
        className="button"
      >
        Follows
      </Button>
      <Button
        type="text"
        icon={<img src={PlaylistsLogo} alt="" className="menu-icon" />}
        className="button"
      >
        Playlists
      </Button>
      <Button
        type="text"
        icon={<img src={WatchListLogo} alt="" className="menu-icon" />}
        className="button"
      >
        WatchList
      </Button>
    </Flex>
  );
}
export default GlassMenu;
