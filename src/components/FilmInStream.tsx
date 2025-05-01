import "../App.css";
import Birdies from "./Birdies";
import Rating from "../YugenAssits/Icons/Rating.png";
import Genres from "../YugenAssits/Icons/GenreLogopng.png";
import React, { useEffect, useRef, useState } from "react";

const FilmInStream: React.FC = () => {
  const videoPath = "/uploads/films/Really short video.mp4";
  const PFPPath = "/uploads/pfp/temp.jpg";
  var V_Genres = "Adventure, Comedy";
  var V_Rating = 9.9;
  return (
    <div>
      <Birdies />
      <div className="FilmInStream">
        <label className="username"> username</label>
        <img src={PFPPath} alt={PFPPath} className="PFPStream" />
        <video src={videoPath} controls className="Film"></video>
        <h4 className="V_Title">Film Title</h4>
        <img src={Rating} alt={PFPPath} className="Rating" />
        <h4 className="V_Rating">{V_Rating}</h4>
        <img src={Genres} alt={PFPPath} className="Genres" />
        <h4 className="V_Genres">{V_Genres}</h4>
      </div>
    </div>
  );
};

export default FilmInStream;
