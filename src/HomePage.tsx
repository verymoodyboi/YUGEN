import "./App.css";
import FilmCatalog from "./components/FilmCatalog.tsx";
import GlassMenu from "./components/SideMenu.tsx";
import SearchBar from "./components/SearchBar.tsx";
import SettingsIcon from "./YugenAssits/Icons/SettingsIcon.png";
import HomeIcon from "./YugenAssits/Icons/HomeIcon.png";
import FilmBox from "./components/FilmBox.tsx";

function HomePage() {
  const HP = (
    <div>
      <div>
        <FilmCatalog></FilmCatalog>
      </div>
      <div>
        <GlassMenu></GlassMenu>
      </div>
      <div>
        <SearchBar></SearchBar>
      </div>
      <div>
        <FilmBox></FilmBox>
      </div>
      <div className="SittingsLink">
        <a href="">
          <img src={SettingsIcon} alt="Sittings" height={30} />
        </a>
      </div>
      <div className="HomeLink">
        <a href="HomePage.tsx">
          <img src={HomeIcon} alt="Sittings" height={30} />
        </a>
      </div>
    </div>
  );
  return HP;
}
export default HomePage;
