import React, { useState } from "react";
import "../App.css";
import axios from "axios";

function Films() {
  const [filmData, setFilmData] = useState<any | null>(null);
  const [click, setClick] = useState(false);

  const handleClick = async () => {
    try {
      const response = await axios.get("http://localhost:3001/filmdata");
      if (response.data && response.data.length > 0) {
        setFilmData(response.data[0]); // assuming the API returns an array
      }
      setClick(true);
    } catch (error) {
      console.error("Error fetching film data:", error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>click</button>
      {click && filmData && (
        <div>
          <p>ID: {filmData.film_id}</p>
          <p>Title: {filmData.film_title}</p>
          <p>Path: {filmData.film_path}</p>
          <p>poster: {filmData.poster_path}</p>
          <p>Rating: {filmData.avg_rating}</p>
          <p>Thesis: {filmData.thesis}</p>
        </div>
      )}
    </div>
  );
}

export default Films;
