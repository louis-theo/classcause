import React, { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../App";
import { getNavigationPages } from "./navigation";

const SidebarNav = ({ onClose }) => {
  const theme = useTheme();
  const [activeLink, setActiveLink] = useState("");
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    setActiveLink(window && window.location ? window.location.pathname : "");
  }, []);

  const role = authUser ? authUser.accountType : null;
  const pages = getNavigationPages(role);

  return (
    <Box>
      <Box
        display={"flex"}
        justifyContent={"flex-end"}
        onClick={() => onClose()}
      >
        <IconButton>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box paddingX={2} paddingBottom={2}>
        <Box>
          {pages.map((item, i) => (
            <Box key={i} marginBottom={4}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 1,
                  display: "block",
                }}
              >
                {item.title}
              </Typography>
              <Grid container spacing={1}>
                {item.pages.map((p, i) => (
                  <Grid item xs={6} key={i}>
                    <Link
                      variant="body2"
                      component={"a"}
                      href={p.href}
                      color={activeLink === p.href ? "primary" : "textPrimary"}
                      underline={"none"}
                      sx={{
                        fontWeight: activeLink === p.href ? 600 : 400,
                        "&:hover": {
                          textDecoration: "none",
                          color: theme.palette.primary.dark,
                        },
                      }}
                      onClick={() => onClose()}
                    >
                      {p.title}
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}></Box>
      </Box>
    </Box>
  );
};

SidebarNav.propTypes = {
  onClose: PropTypes.func,
};

export default SidebarNav;
