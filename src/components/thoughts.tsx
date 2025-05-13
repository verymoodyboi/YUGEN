import "../App.css";
import { useState } from "react";
import axios from "axios";
import React from "react";

function Thoughts() {
  const [thought, setThought] = useState<any | null>(null);
  const getThoughts = async () => {
    const response = await axios.get("http://localhost:3001/thought");
    {
      if (response.data && response.data.length > 0) {
        setThought(response.data[0]);
      }
      console.log(thought);
    }
  };
  function handleClick() {
    getThoughts();
  }
  return (
    <div className="thoughts_window">
      <button onClick={handleClick}></button>
    </div>
  );
}
export default Thoughts;
