import "../App.css";
import FilmFrame from "../components/FilmFrame.tsx";
import GlassMenu from "../components/SideMenu.tsx";
import SearchBar from "../components/SearchBar.tsx";
import NavBar from "../components/NavBar.tsx";
import Birdies from "../components/Birdies.tsx";
function HomePage() {
  const HP = (
    <div>
      <Birdies />
      <div>
        <FilmFrame></FilmFrame>
      </div>
      <div>
        <GlassMenu></GlassMenu>
      </div>
      <div>
        <SearchBar></SearchBar>
      </div>
      <div>
        <NavBar></NavBar>
      </div>
    </div>
  );
  return HP;
}
export default HomePage;
