import "../App.css";
import PFP from "../YugenAssits/temp/PFP_temp.png";

function FilmBox() {
  return (
    <div className="FilmBox">
      <img
        className="idk"
        src={PFP}
        alt=""
        style={{
          opacity: "100%",
          position: "relative",
          top: "10px",
          right: "-70px",
          height: "50px",
          width: "50px",
        }}
      />
    </div>
  );
}
export default FilmBox;
