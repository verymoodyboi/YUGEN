import "../App.css";
import { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider, Rate } from "antd";

function ReviewForm() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Rate: {
            starSize: 35,
            starBg: "#2c5d5a",
            starColor: "#cc651f",
          },
        },
      }}
    >
      <div className="ReviewForm">
        <label id="ReviewLabel">Review</label>
        <p id="ReviewText">
          How many stars does this film deserve? Let the creator know!
        </p>
        <div id="ReviewIcon"></div>
        <Rate count={10} allowHalf={true} />
      </div>
    </ConfigProvider>
  );
}

export default ReviewForm;
