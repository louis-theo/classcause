import React, { forwardRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const HistoryGraph = forwardRef(({ parentMetrics }, ref) => {
  const theme = useTheme();

  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  return (
    <Box
      marginTop={4}
      ref={ref}
      boxShadow={10}
      sx={{
        // Common styles
        background: "#fff",
        borderRadius: "8px",
        p: isMd ? 2 : 1,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: isMd ? "400px" : "250px",
        maxWidth: !isMd ? "254px" : "1024px",
      }}
    >
      <Typography
        variant="h4"
        textAlign={"center"}
        color={"primary"}
        sx={{
          width: "100%",
          fontSize: !isMd ? "1.5rem" : "3rem",
        }}
        gutterBottom
      >
        Donation History
      </Typography>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minHeight={isMd ? "400px" : "250px"}
      >
        <LineChart data={parentMetrics?.history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="donationAmount"
            stroke="#8884d8"
            name="Donation Amount"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
});

export default HistoryGraph;
