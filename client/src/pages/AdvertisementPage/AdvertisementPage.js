import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../App";
import { Typography, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Container from "../../common/Container";
import AdvertisementList from "./components/AdvertisementList";

const AdvertisementPage = ({ BACKEND_URL }) => {
  //   styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;
  const accountType = authUser?.accountType;

  // data state
  const [advertisement, setAdvertisement] = useState([]);
  const [reloadAds, setReloadAds] = useState(false);

  // fetch ads
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/advertisement`, {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });

        setAdvertisement(data);
      } catch (error) {
        console.error("Couldn't retrieve advertisements:", error);
      }
    };

    fetchAdvertisement();
  }, [BACKEND_URL, userId, accountType, authUser, reloadAds]);

  return (
    <Container
      position={"relative"}
      minHeight={"calc(100vh - 247px)"}
      height={"100%"}
      width={"100%"}
      marginTop={5}
    >
      <Box
        width={"100%"}
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
      >
        {/* Top bit */}
        <Box
          display="flex"
          flexDirection={"column"}
          justifyContent="center"
          alignItems="center"
        >
          {/* page name */}

          <Typography
            marginTop={2}
            fontWeight={700}
            variant={!isMd ? "h2" : "h4"}
            color="primary"
            gutterBottom
            align="center"
          >
            Current Advertisements
          </Typography>
          <Typography
            variant={!isMd ? "h4" : "h6"}
            color="textSecondary"
            gutterBottom
            align="center"
            marginBottom={6}
          >
            Explore various business opportunities!
          </Typography>
        </Box>
      </Box>
      <AdvertisementList
        advertisement={advertisement}
        BACKEND_URL={BACKEND_URL}
        setReloadAds={setReloadAds}
      />
    </Container>
  );
};

export default AdvertisementPage;
