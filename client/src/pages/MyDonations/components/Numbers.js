import React from "react";
import CountUp from "react-countup";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import useMediaQuery from "@mui/material/useMediaQuery";

const Numbers = ({ parentMetrics }) => {
  const theme = useTheme();

  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  return (
    <>
      <Box
        component={Card}
        boxShadow={10}
        borderTop={`4px solid ${theme.palette.primary.main}`}
        width="100%"
      >
        <Grid
          container
          spacing={2}
          data-aos={"fade-up"}
          display="flex"
          flexDirection={isMd ? "row" : "column"}
          justifyContent="space-between"
          width="100%"
        >
          {[
            {
              title: parentMetrics?.donationsCount,
              subtitle: "Contributions",
            },
            {
              title: parentMetrics?.totalDonated,
              subtitle: "Total donated",
              prefix: "£",
            },
            {
              title: parentMetrics?.averageDonation,
              subtitle: "Average donation amount",
              prefix: "£",
            },
          ].map((item, i) => (
            <Grid
              key={i}
              item
              xs={6}
              md={3}
              minWidth={300}
              margin={(0, "auto")}
            >
              <CardContent>
                <Typography
                  variant="h3"
                  fontWeight={600}
                  gutterBottom
                  align={"center"}
                >
                  <CountUp
                    end={item.title}
                    duration={2.75}
                    prefix={item.prefix || ""}
                  />
                </Typography>
                <Typography variant="h6" align={"center"}>
                  {item.subtitle}
                </Typography>
              </CardContent>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Numbers;
