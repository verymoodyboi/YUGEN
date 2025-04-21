import "../App.css";

function SearchBar() {
  return (
    <div className="SearchContainer">
    <div className="SearchBar">
    <div className="Searchicon"></div>
      <input
        type="text"
        placeholder="Search"
      ></input>
      </div>
    </div>
  );
}
export default SearchBar;
