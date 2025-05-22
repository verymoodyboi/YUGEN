import * as React from "react";
import { styled, createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { AppProvider, Navigation, Router } from "@toolpad/core/AppProvider";
import {
  PageContainer,
  PageHeader,
  PageHeaderToolbar,
} from "@toolpad/core/PageContainer";
import { Grid, Paper, Stack, Button, Box, Typography } from "@mui/material";
import FilmCard from "../components/FilmCard";
const NAVIGATION: Navigation = [
  { segment: "inbox", title: "Inbox" },
  {
    segment: "inbox/all",
    title: "All",
    icon: <DashboardIcon />,
  },
];

function useDemoRouter(initialPath: string): Router {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path: string | URL) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

const Skeleton = styled("div")<{ height: number }>(({ theme, height }) => ({
  backgroundColor: (theme.vars || theme).palette.action.hover,
  borderRadius: (theme.vars || theme).shape.borderRadius,
  height,
  content: '" "',
}));

function CustomPageToolbar() {
  return (
    <PageHeaderToolbar>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          color="neutral"
          startIcon={<DownloadIcon fontSize="inherit" />}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="neutral"
          startIcon={<PrintIcon fontSize="inherit" />}
        >
          Print
        </Button>
      </Stack>
    </PageHeaderToolbar>
  );
}

function CustomPageHeader() {
  return <PageHeader slots={{ toolbar: CustomPageToolbar }} />;
}

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
});

export default function PageContainerBasic(props: any) {
  const { window } = props;
  const router = useDemoRouter("/inbox/all");
  // Remove this const when copying and pasting into your project.
  const demoWindow = window ? window() : undefined;

  return (
    <AppProvider
      // navigation={NAVIGATION}
      //router={router}
      theme={demoTheme}
      window={demoWindow}
      branding={{
        title: "Home",
      }}
    >
      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          backdropFilter: "blur(5px)",
          p: 2,
          position: "absolute",
          left: "2vw",
          top: "10vh",
          width: "80vw",
          height: "88vh", // this is fine
          overflow: "hidden", // prevent double scrollbars
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
        }}
      >
        <PageContainer
          sx={{
            height: "100%",
            overflowY: "auto", // allow vertical scroll
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
              overflowY: "auto", // apply scrolling to this box too
              pr: 1, // padding right to prevent overlap with scrollbar
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              Hot Right Now
            </Typography>
            <Stack direction="row" spacing={2} className="catagory2">
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
            </Stack>
            <Typography
              variant="h4"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              Latest
            </Typography>
            <Stack direction="row" spacing={2} className="catagory2">
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
              <FilmCard />
            </Stack>
          </Box>
        </PageContainer>
      </Paper>
    </AppProvider>
  );
}
