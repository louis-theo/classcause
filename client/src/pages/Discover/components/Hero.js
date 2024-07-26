import React from "react";
import CarouselItem from "./CarouselItem";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/material";
import Carousel from "react-material-ui-carousel";

const Hero = ({ items }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });
  return (
    <Box
      sx={{
        marginTop: isMd ? 8.5 : 7.5,
        display: "flex",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Carousel
        autoPlay
        interval={5000}
        animation="slide"
        indicators={false}
        navButtonsAlwaysVisible={false}
        stopAutoPlayOnHover
        swipe={true}
        sx={{
          maxWidth: "1200px",
          width: "100%",
          minHeight: "600px",
        }}
      >
        {items.map((item, i) => (
          <CarouselItem key={i} item={item} />
        ))}
      </Carousel>
    </Box>
  );
};

export default Hero;
