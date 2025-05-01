import "../App.css";
import Birdies from "./Birdies";
import Rating from "../YugenAssits/Icons/Rating.png";
import Genres from "../YugenAssits/Icons/GenreLogopng.png";
import React, { useEffect, useRef, useState } from "react";
import type { CollapseProps } from "antd";
import { Collapse, Button, Avatar, Space } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
const Description = `
Film description.
`;
const Cast = `
Brad pitt as John Doe,
Leonardo Decapreo as Doe John
...
`;
const Crew = `
Directed by Martin Scorsese, 
Written by Aron Sorkin
...
`;

const items: CollapseProps["items"] = [
  {
    key: "1",
    label: "Description",
    children: <p>{Description}</p>,
  },
  {
    key: "2",
    label: "Cast",
    children: <p>{Cast}</p>,
  },
  {
    key: "3",
    label: "Crew",
    children: <p>{Crew}</p>,
  },
];
const videoPath = "/uploads/films/Really short video.mp4";
const PFPPath = "/uploads/pfp/temp.jpg";
var V_Genres = "Adventure, Comedy";
var V_Rating = 9.9;
const FilmInStream: React.FC = () => {
  return (
    <div>
      <div className="FilmInStream">
        <Space
          direction="vertical"
          style={{ width: "100%", alignItems: "flex-start" }}
        >
          <Space style={{}}>
            <Avatar size={"large"} icon={<UserOutlined />} />
            username
          </Space>
          <br />
          <Space direction="vertical" style={{ alignItems: "center" }}>
            <h4>Film Title</h4>

            <video
              src={videoPath}
              controls
              style={{ borderRadius: "5%" }}
            ></video>
          </Space>
          <Space style={{}}>
            <img src={Rating} alt={PFPPath} />
            <h4>{V_Rating}</h4>
            <Button
              type="primary"
              style={{
                fontFamily: '"Freckle Face", system-ui',
                backgroundColor: "rgba(0,0,0,0)",
                border: "none",
                color: "white",
              }}
              icon={<PlusOutlined />}
            >
              Add review
            </Button>
          </Space>

          <Space style={{}}>
            <img src={Genres} alt={PFPPath} />
            <h4>{V_Genres}</h4>
          </Space>
        </Space>
        <Collapse className="FilmApendencies" items={items} />
      </div>
    </div>
  );
};

export default FilmInStream;
