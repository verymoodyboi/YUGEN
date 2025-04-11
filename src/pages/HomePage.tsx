import "../App.css";
import FilmCatalog from "../components/FilmCatalog.tsx";
import GlassMenu from "../components/SideMenu.tsx";
import SearchBar from "../components/SearchBar.tsx";
import NavBar from "../components/NavBar.tsx";
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
        <NavBar></NavBar>
      </div>
    </div>
  );
  return HP;
}
export default HomePage;
