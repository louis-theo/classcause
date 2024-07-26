import React from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";

const CarouselItem = ({ item }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (item.buttonLink) {
      navigate(item.buttonLink);
    } else if (typeof item.buttonAction === "function") {
      item.buttonAction();
    }
  };

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  return (
    <Box
      sx={{
        minHeight: "600px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Image with Diagonal Cut */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          backgroundImage: `linear-gradient(90deg, white ${
            isMd ? "30%" : "50%"
          }, transparent 100%), url(${item.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Text Content */}
      <Box
        sx={{
          zIndex: 1,
          color: "#fff",
          padding: isMd ? 8 : 2,
          paddingTop: isMd ? 16 : 0,
          maxWidth: isMd ? "50%" : "90%",
        }}
      >
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
            fontSize: isMd ? "1rem" : "0.8rem",
          }}
          gutterBottom
          color={"secondary"}
        >
          {item.reference}
        </Typography>

        <Box marginBottom={2}>
          <Typography
            variant={isMd ? "h2" : "h4"}
            color="textPrimary"
            sx={{
              fontWeight: 700,
            }}
          >
            {item.title}
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              {item.subtitle}
            </Typography>
          </Typography>
        </Box>
        <Box marginBottom={3}>
          <Typography variant="h6" component="p" color="textSecondary">
            {item.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAction}
          startIcon={
            item.buttonText === "Discover Opportunities" ? (
              <ArrowDownwardIcon />
            ) : null
          }
        >
          {item.buttonText}
        </Button>
      </Box>
    </Box>
  );
};

export default CarouselItem;
