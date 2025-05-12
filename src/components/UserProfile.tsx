import React from "react";
import { Layout, Avatar, Flex, Card, Space } from "antd";
import temmPFP from "../YugenAssits/Icons//Reviewstar.png";
const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 180,
  paddingInline: 48,
  lineHeight: "64px",
  border: "solid white 1px",
  backgroundColor: "transparent",
};

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  color: "#fff",
  border: "solid white 1px",
  backgroundColor: "transparent",
};

const siderStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  border: "solid white 1px",
  backgroundColor: "transparent",
  width: 128,
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  border: "solid white 1px",
  backgroundColor: "transparent",
  height: 64,
};

const layoutStyle: React.CSSProperties = {
  borderRadius: 8,
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  backgroundColor: "transparent",
};

function UserProfile() {
  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <Flex justify="start" align="center" style={{ height: "100%" }}>
          <Avatar
            style={{
              borderRadius: "5%",
              width: "150px",
              height: "150px",
            }}
            src={temmPFP}
          ></Avatar>
          <Card size="small" title="Default size card" className="profile-bio">
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card>
        </Flex>
      </Header>
      <Layout style={{ backgroundColor: "transparent" }}>
        <Content style={contentStyle}>Content</Content>
        <Sider width="25%" style={siderStyle}>
          Sider
        </Sider>
      </Layout>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>
  );
}

export default UserProfile;