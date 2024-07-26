import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import StoriesList from "./components/StoriesList";
import { useTheme } from "@mui/material/styles";
import Container from "../../common/Container";

const SuccessStoriesPage = ({ BACKEND_URL }) => {
  // data state
  const [stories, setStories] = useState([]);
  const [reloadStories, setReloadStories] = useState(false);

  //   styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // fetch stories
  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/success-stories`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      setStories(data);
    } catch (error) {
      console.error("Couldn't retrieve stories:", error);
    }
  };

  useEffect(() => {
    fetchStories();
 
  }, [BACKEND_URL, reloadStories]);

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
            variant={!isMd ? "h2" : "h3"}
            color="primary"
            gutterBottom
            align="center"
          >
            Success Stories
          </Typography>
          <Typography
            variant={!isMd ? "h4" : "h6"}
            color="textSecondary"
            gutterBottom
            align="center"
            marginBottom={6}
          >
            See the impact of your donations!
          </Typography>
        </Box>
      </Box>
      <StoriesList
        stories={stories}
        BACKEND_URL={BACKEND_URL}
        setReloadStories={setReloadStories}
      />
    </Container>
  );
};

export default SuccessStoriesPage;
