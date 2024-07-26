import React, { useContext } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import logo from "../../assets/logo-blue.svg";
import Container from "../../common/Container";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";

const Footer = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            width={"100%"}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            {/* Logo */}
            <Box display="flex" alignItems="center">
              <Link
                underline="none"
                component="a"
                href="/"
                color="inherit"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                sx={{
                  img: {
                    height: { xs: "25px", md: "35px" },
                    objectFit: "cover",
                    objectPosition: "center",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "100%",
                    minWidth: "150px",
                  },
                }}
              >
                <img src={logo} alt="logo" width="100%" />
              </Link>
            </Box>

            <Box display="flex" flexWrap={"wrap"} alignItems={"center"}>
              <Box marginTop={1} marginRight={2}>
                <Link
                  underline="none"
                  component="a"
                  href="/"
                  color="textPrimary"
                  variant={"subtitle2"}
                >
                  Discover
                </Link>
              </Box>
              <Box marginTop={1} marginRight={2}>
                <Link
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="textPrimary"
                  variant={"subtitle2"}
                >
                  Success Stories
                </Link>
              </Box>
              <Box marginTop={1} marginRight={2}>
                <Link
                  underline="none"
                  component="a"
                  href="/advertisement"
                  color="textPrimary"
                  variant={"subtitle2"}
                >
                  For Partners
                </Link>
              </Box>

              {!isLoggedIn && (
                <Box marginTop={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    component="a"
                    target="blank"
                    onClick={() => navigate("/signup")}
                    size="small"
                  >
                    Register now
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography
            align={"center"}
            variant={"subtitle2"}
            color="textSecondary"
            gutterBottom
          >
            &copy; Classcause. 2024, Maccarian. All rights reserved
          </Typography>
          <Typography
            align={"center"}
            variant={"caption"}
            color="textSecondary"
            component={"p"}
          >
            When you visit or interact with our sites, services or tools, we or
            our authorised service providers may use cookies for storing
            information to help provide you with a better, faster and safer
            experience and for marketing purposes.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Footer;
