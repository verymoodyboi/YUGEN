import "./App.css";
import FilmCatalog from "./components/FilmCatalog.tsx";
import GlassMenu from "./components/SideMenu.tsx";
import SearchBar from "./components/SearchBar.tsx";
import NavBar from "./components/NavBar.tsx";
function HomePage() {
  const HP = (
    <div>
      <FilmCatalog></FilmCatalog>
      <GlassMenu></GlassMenu>
      <SearchBar></SearchBar>
      <NavBar></NavBar>
    </div>
  );
  return HP;
}
export default HomePage;
