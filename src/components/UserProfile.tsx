import { useState } from "react";
import { Layout, Avatar, Flex, Card, Space, Button, Statistic } from "antd";
import { PlusOutlined, NotificationOutlined } from "@ant-design/icons";
import temmPFP from "../server/uploads/pfp/1.jpg";
const { Header, Footer, Sider, Content } = Layout;
const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 180,
  paddingInline: 48,
  lineHeight: "64px",
  //  border: "solid white 1px",
  backgroundColor: "transparent",
};

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  color: "#fff",
  // border: "solid white 1px",
  backgroundColor: "transparent",
};

const siderStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "transparent",
  width: 128,
  maxWidth: "300px",
  minWidth: "200px",
  padding: "1rem",
  height: "auto",
  aspectRatio: "1/1",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  // border: "solid white 1px",
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
const { Meta } = Card;

function UserProfile() {
  const [pfp, setPfp] = useState(temmPFP);
  const [username, setUsername] = useState("temp username");
  const [bio, setbio] = useState(
    `The lone lamp post of the one-street town flickered, not quite dead but definitely on its way out. Suitcase by her side, she paid no heed to the light, the street or the town. A car was coming down the street and with her arm outstretched and thumb in the air, she had a plan. `
  );
  const [followCount, setFollowCount] = useState(1000);
  const [isFollow, setIsFollow] = useState(false);
  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}> Header</Header>
      <Layout style={{ backgroundColor: "transparent" }}>
        <Content style={contentStyle}>Content</Content>
        <Sider width="25%" style={siderStyle}>
          <Card
            className="profile-bio2"
            cover={
              <Avatar
                style={{
                  borderRadius: "10%",
                  width: "100%",
                  height: "auto",
                  justifySelf: "center",
                  border: "solid white 3px",
                  top: "1rem",
                  maxWidth: "200px",
                  aspectRatio: "1/1",
                }}
                src={temmPFP}
              ></Avatar>
            }
            actions={[]}
          >
            <Meta
              title={username}
              style={{
                fontSize: "1rem",
                fontWeight: "lighter",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            />

            <Flex
              style={{
                justifyContent: "center",
                margin: "10px 0",
                width: "100%",
              }}
              justify="space-evenly"
            >
              {!isFollow && (
                <Space direction="horizontal" style={{}}>
                  <Statistic
                    title={
                      <span
                        style={{
                          fontFamily: ' "Freckle Face", system-ui',
                          fontSize: "1rem",
                        }}
                      >
                        Followers
                      </span>
                    }
                    valueStyle={{
                      fontFamily: '"Freckle Face", system-ui',
                      color: "white",
                      fontSize: "1rem", // optional: adjust size
                    }}
                    value={followCount}
                    precision={2}
                    prefix={
                      <Button
                        icon={<PlusOutlined />}
                        style={{
                          background: "transparent",
                          margin: "0",
                          border: "solid 2px white",
                          borderRadius: "10%",
                        }}
                        size="small"
                        onClick={() => {
                          setFollowCount(followCount + 1);
                          setIsFollow(true);
                        }}
                        type="primary"
                      ></Button>
                    }
                  />
                </Space>
              )}
              {isFollow && (
                <Space direction="horizontal" style={{}}>
                  <Statistic
                    title="Followers"
                    value={followCount}
                    precision={2}
                    prefix={
                      <Button
                        icon={<NotificationOutlined />}
                        style={{
                          background: "transparent",
                          margin: "0",
                          border: "solid 2px white",
                          borderRadius: "10%",
                        }}
                        size="small"
                        onClick={() => {}}
                        type="primary"
                      ></Button>
                    }
                  />
                </Space>
              )}
            </Flex>
            <Meta style={{ overflowY: "scroll" }} description={bio} />
          </Card>
        </Sider>
      </Layout>
      <Footer style={footerStyle}>Footer</Footer>
    </Layout>
  );
}

export default UserProfile;
