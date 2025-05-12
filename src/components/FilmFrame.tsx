import "../App.css";
import BackgroundImage from "../YugenAssits/BG/FilmFrame.png";
import Category from "./Category";
function FilmFrame() {
  return (
    <div className="filmframe-wrapper">
        <img src={BackgroundImage} id="filmframe-background" alt="FilmframeBackground"></img>
        <div className="films-area-container">
          <Category></Category>
          <Category></Category>
          <Category></Category>
      </div>
    </div>
  );
}
export default FilmFrame;
