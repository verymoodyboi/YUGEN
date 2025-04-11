import "../App.css";
import PFP from "../YugenAssits/temp/PFP_temp.png";
import TN from "../YugenAssits/temp/ThumbNail_Temp.png";
import R from "../YugenAssits/Icons/Rating.png";
import Genre from "../YugenAssits/Icons/GenreLogopng.png";
function FilmBox() {
  return (
    <div className="FilmBox">
      <div>
        <img src={TN} className="FilmBox_TN" />
      </div>
      <div>
        <p className="FilmBox_FilmName">Film Name </p>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: "0px" }}
        className="FilmBox_Rating"
      >
        <img src={R} />
        <p style={{ margin: 0, whiteSpace: "nowrap" }}>9.9</p>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: "14px" }}
        className="FilmBox_Genre"
      >
        <img src={Genre} style={{ width: 30, height: 30 }} />
        <p>Genre1, Genre2, Genre3 </p>
      </div>
    </div>
  );
}
export default FilmBox;
