import "../App.css";

function FilmBox() {
  return (
    <div className="filmbox">
      <div id="filmbox-thumbnail"> {/* thumbnail of the film */}        
        <div id="filmbox-duration"> {/* duration of the film */}
          <p id="filmbox-duration-text">00:00:00</p>
        </div>
      </div>
      <div className="filmbox-info-elements" id="filmbox-title-element"> {/* title of the film */}
        <p className="filmbox-texts" id="filmbox-title-text">Film Title</p>
      </div>
      <div className="filmbox-info-elements" id="filmbox-upload-element"> {/* upload date of the film */}
        <div id="filmbox-upload-icon"></div>
        <p className="filmbox-texts">0 Days ago</p>
      </div>
      <div className="filmbox-info-elements" id="filmbox-views-element"> {/* views of the film */}
        <div id="filmbox-views-icon"></div>
        <p className="filmbox-texts">1.999.999</p>
        </div>
    </div>
  );
}
export default FilmBox;
