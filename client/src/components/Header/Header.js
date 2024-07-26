// Main.js
import React, { useState } from "react";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Slide from "@mui/material/Slide";
import AppBar from "@mui/material/AppBar";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Container from "../../common/Container";

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Header = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  return (
    <>
      <HideOnScroll>
        <AppBar
          position={"fixed"}
          sx={{
            backgroundColor: "#1976d2",
          }}
          elevation={1}
        >
          <Container
            width={"100%"}
            paddingY={{ xs: 1 / 2, sm: 1 }}
            marginTop={0}
          >
            <Topbar onSidebarOpen={handleSidebarOpen} />
          </Container>
        </AppBar>
      </HideOnScroll>
      <Sidebar
        onClose={handleSidebarClose}
        open={openSidebar}
        variant="temporary"
      />
    </>
  );
};

export default Header;
