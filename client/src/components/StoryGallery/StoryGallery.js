import React from "react";
import Slider from "react-slick";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const StoryGallery = ({ BACKEND_URL }) => {
  const theme = useTheme();
  const [stories, setStories] = useState([]);

  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate("/success-stories");
  };

  useEffect(() => {
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

    fetchStories();
  }, [BACKEND_URL]);

  const isXs = useMediaQuery(theme.breakpoints.up("xs"), {
    defaultMatches: true,
  });
  const isSm = useMediaQuery(theme.breakpoints.up("sm"), {
    defaultMatches: true,
  });
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });
  const isLg = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true,
  });

  let slidesToShow = 1;
  if (isXs) {
    slidesToShow = 1;
  }
  if (isSm) {
    slidesToShow = 2;
  }
  if (isMd) {
    slidesToShow = 3;
  }
  if (isLg) {
    slidesToShow = 4;
  }

  const sliderOpts = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
  };

  return (
    <Box>
      <Box marginBottom={4}>
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
          }}
          gutterBottom
          color={"secondary"}
          align={"center"}
        >
          Gallery
        </Typography>
        <Box
          component={Typography}
          fontWeight={700}
          variant={"h3"}
          align={"center"}
          data-aos={"fade-up"}
        >
          Success Stories
        </Box>
        <Box
          marginTop={2}
          display={"flex"}
          justifyContent={"center"}
          data-aos="fade-up"
        >
          <Button
            onClick={handleViewAllClick}
            color={"primary"}
            variant={"contained"}
            size={"large"}
          >
            View all
          </Button>
        </Box>
      </Box>
      <Slider {...sliderOpts}>
        {stories.map((item, i) => (
          <Box key={i} paddingX={5}>
            <Box
              component={Card}
              width={"100%"}
              height={"100%"}
              borderRadius={5}
              sx={{
                cursor: "pointer",
                paddingX: 3,
              }}
            >
              <CardMedia
                image={item.picture}
                title={item.storyName}
                sx={{
                  height: 340,
                  paddingX: 3,
                }}
              />
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default StoryGallery;
