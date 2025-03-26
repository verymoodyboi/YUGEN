import "../App.css";

function SearchBar() {
  return (
    <div className="SearchBar">
      <div className="icon">
        <h1></h1>
      </div>
      <input
        type="text"
        placeholder="Search"
        style={{
          padding: "10px",
          border: "5px solid rgb(82, 31, 31)",
          borderRadius: "50px",
          fontSize: "20px",
          textAlign: "center",
          width: "100%",
        }}
      ></input>
    </div>
  );
}
export default SearchBar;
