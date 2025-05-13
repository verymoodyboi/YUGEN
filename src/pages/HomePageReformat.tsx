import "../App.css";
import FilmCatalog from "../components/FilmCatalog.tsx";
import GlassMenu from "../components/SideMenu.tsx";
import SearchBar from "../components/SearchBar.tsx";
import NavBar from "../components/NavBar.tsx";
import Birdies from "../components/Birdies.tsx";
import React from "react";
import { Flex, Layout, Space } from "antd";
const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "transparent",
  border: "black solid 2px",
};

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  color: "#fff",
  border: "black solid 2px",
};

const siderStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  //height: "70%",
  //top: "28vh",
  backgroundColor: "transparent",
  border: "black solid 2px",
  overflow: "hidden",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "transparent",
  border: "black solid 2px",
};

const layoutStyle = {
  borderRadius: 8,
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  backgroundColor: "transparent",
};

const HomePageReformat: React.FC = () => (
  <Layout style={layoutStyle}>
    <Header style={headerStyle}>
      <Space style={{ width: "100%" }}>
        <NavBar />
        <SearchBar />
      </Space>
    </Header>
    <Layout style={{ backgroundColor: "transparent" }}>
      <Content style={contentStyle}>
        <FilmCatalog />
      </Content>
      <Sider width="15%" style={siderStyle}>
        <GlassMenu />
      </Sider>
    </Layout>
    <Footer style={footerStyle}>Footer</Footer>
  </Layout>
);
export default HomePageReformat;
