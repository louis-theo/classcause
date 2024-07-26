import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Box,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { VictoryPie, VictoryTooltip } from "victory";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import useMediaQuery from "@mui/material/useMediaQuery";
import DonationBarChart from "./DonationChartYearly";
import WishlistDashboard from "./WishlistCharts";
import Container from "../../common/Container";

const AdminUpdatedDashboard = ({ BACKEND_URL }) => {
  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    parentsCount: 0,
    teachersCount: 0,
    businessesCount: 0,
  });
  // const [userMetrics, setUserMetrics] = useState([]);
  const [historicalFees, setHistoricalFees] = useState([]);
  const [fees, setFees] = useState({ parent: 0, business: 0 });
  const [open, setOpen] = useState(false);
  const [newRate, setNewRate] = useState("");
  const [accountType, setAccountType] = useState("");
  const [userMetricsWithPercent, setUserMetricsWithPercent] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const metricResponses = await Promise.all([
          axios.get(`${BACKEND_URL}/generalmetrics/metrics/total-users`), //not including admin
          axios.get(`${BACKEND_URL}/generalmetrics/metrics/parents-count`),
          axios.get(`${BACKEND_URL}/generalmetrics/metrics/teachers-count`),
          axios.get(`${BACKEND_URL}/generalmetrics/metrics/businesses-count`),
          axios.get(`${BACKEND_URL}/generalmetrics/metrics/schools-count`),
        ]);

        setMetrics({
          totalUsers: metricResponses[0].data.count,
          parentsCount: metricResponses[1].data.count,
          teachersCount: metricResponses[2].data.count,
          businessesCount: metricResponses[3].data.count,
          schoolsCount: metricResponses[4].data.count,
        });

        const userMetrics = [
          { x: "Parents", y: metricResponses[1].data.count },
          { x: "Teachers", y: metricResponses[2].data.count },
          { x: "Businesses", y: metricResponses[3].data.count },
          { x: "Schools", y: metricResponses[4].data.count },
        ];

        const totalUsers = metricResponses[0].data.count;

        const metricsWithPercent = userMetrics.map((metric) => ({
          ...metric,
          percentage: ((metric.y / totalUsers) * 100).toFixed(2),
        }));

        //console.log(userMetrics);

        setUserMetricsWithPercent(metricsWithPercent);

        const historicalFeesResponse = await axios.get(
          `${BACKEND_URL}/transaction-fee/historical`
        );
        setHistoricalFees(historicalFeesResponse.data);

        // Process the fetchedHistoricalFees to extract the latest rate for each account type
        const latestRates = historicalFeesResponse.data.reduce((acc, fee) => {
          const existingFee = acc[fee.accountType];
          if (
            !existingFee ||
            new Date(fee.timeStamp) > new Date(existingFee.timeStamp)
          ) {
            acc[fee.accountType] = fee; // Update with the newer fee
          }
          return acc;
        }, {});

        // Set the fees state with the latest rates extracted
        setFees({
          parent: latestRates.parent
            ? latestRates.parent.transactionRate
            : "N/A",
          business: latestRates.business
            ? latestRates.business.transactionRate
            : "N/A",
        });
      } catch (error) {
        toast.error(`Error fetching data:${error.response.data.message}`);
      }
    };

    fetchAllData();
  }, [BACKEND_URL]);

  const handleOpen = (type) => {
    setAccountType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewRate("");
  };

  const handleSave = async () => {
    try {
      if (parseFloat(newRate) > 1) {
        toast.error("The fee can't be larger than 1");
        return;
      }
      await axios.put(`${BACKEND_URL}/transaction-fee/fees/update`, {
        accountType,
        newRate: parseFloat(newRate),
      });

      toast.success(`Fees updated successfully for ${accountType}`);
      setOpen(false);

      // Refetch both the fees and historical fees to reflect the update
      const feesResponse = await Promise.all([
        axios.get(`${BACKEND_URL}/transaction-fee/fees/parents`),
        axios.get(`${BACKEND_URL}/transaction-fee/fees/businesses`),
      ]);

      setFees({
        parent: feesResponse[0].data.find((fee) => fee.accountType === "parent")
          .transactionRate,
        business: feesResponse[1].data.find(
          (fee) => fee.accountType === "business"
        ).transactionRate,
      });

      // Fetch updated historical fees
      const updatedHistoricalFeesResponse = await axios.get(
        `${BACKEND_URL}/transaction-fee/historical`
      );
      setHistoricalFees(updatedHistoricalFeesResponse.data);
    } catch (error) {
      toast.error(`Failed to update fees: ${error.response.data.message}`);
    }
  };

  const scrollToSection = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [businessTimeRange, setBusinessTimeRange] = useState("all");
  const [parentTimeRange, setParentTimeRange] = useState("all"); // Possible values: 'week', 'month', 'year', 'all'

  const filterFeesByTimeRange = (fees, range) => {
    const now = new Date();
    return fees.filter((fee) => {
      const feeDate = new Date(fee.timeStamp);
      switch (range) {
        case "week":
          return feeDate >= new Date(now.setDate(now.getDate() - 7));
        case "month":
          return feeDate >= new Date(now.setMonth(now.getMonth() - 1));
        case "year":
          return feeDate >= new Date(now.setFullYear(now.getFullYear() - 1));
        case "all":
        default:
          return true;
      }
    });
  };

  const dateFormat = (tickItem) => {
    try {
      return format(new Date(tickItem), "PPP");
    } catch (error) {
      return "";
    }
  };

  const renderCustomLabels = () => {
    const labelColors = {
      Parents: "#87CEFA", // Light Sky Blue colour
      Teachers: "#4682B4", // Steel Blue Colour
      Businesses: "#00BFFF", // Deep Sky bLue Colour
      Schools: "#6495ED", // Cornflower bLue Colour
    };
    return userMetricsWithPercent.map((entry, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: labelColors[entry.x],
            marginRight: "0.5rem",
          }}
        />
        {`${entry.x}: ${entry.percentage}%`}
      </div>
    ));
  };

  const chartColours = {
    parent: "#8884d8",
    business: "#82ca9d",
  };

  const renderFeeSection = (type, chartColour, timeRange, setTimeRange) => {
    const filteredData = filterFeesByTimeRange(
      historicalFees.filter((fee) => fee.accountType === type),
      timeRange
    );

    return (
      <Box mt={4} id="transaction-fees">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 3,
            textTransform: "uppercase",
            fontWeight: "medium",
            fontSize: 30,
          }}
          gutterBottom
          color={"secondary"}
          align="left"
          marginTop={3}
        >{`${type.charAt(0).toUpperCase() + type.slice(1)} Fees`}</Typography>
        <Button onClick={() => setTimeRange("week")}>Last Week</Button>
        <Button onClick={() => setTimeRange("month")}>Last Month</Button>
        <Button onClick={() => setTimeRange("year")}>Last Year</Button>
        <Button onClick={() => setTimeRange("all")}>All Time</Button>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeStamp" tickFormatter={dateFormat} />
            <YAxis domain={["auto", "auto"]} />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="transactionRate"
              stroke={chartColour}
            />
          </LineChart>
        </ResponsiveContainer>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Current Rate: {fees[type]}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen(type)}
          >
            Edit {type.charAt(0).toUpperCase() + type.slice(1)} Fee
          </Button>
        </Paper>
      </Box>
    );
  };

  return (
    <Container
      position={"relative"}
      minHeight={"calc(100vh - 247px)"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      height={"100%"}
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
          Admin Dashboard
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          gutterBottom
          align="center"
          marginBottom={4}
        >
          View user metrics, transaction fees, and overall site performance.
        </Typography>
      </Box>

      {/* Navigation Bar */}
      <Box display="flex" justifyContent="center" my={2}>
        <Button onClick={() => scrollToSection("donation-metrics")}>
          Donation Metrics
        </Button>
        <Button onClick={() => scrollToSection("user-distributions")}>
          User Distribution
        </Button>
        <Button onClick={() => scrollToSection("transaction-fees")}>
          Transaction Fees
        </Button>
        <Button onClick={() => scrollToSection("wishlist-metrics")}>
          Wishlist Metrics
        </Button>
        {/* Add more buttons as needed */}
      </Box>

      <Grid container spacing={4}>
        {/* Donation Metrics Monthly Bar Chart */}
        <Grid item xs={12} id="donation-metrics">
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              textTransform: "uppercase",
              fontWeight: "medium",
              fontSize: 30,
            }}
            gutterBottom
            color={"secondary"}
            align="left"
            marginTop={3}
          >
            Donation Metrics
          </Typography>
          <DonationBarChart BACKEND_URL={BACKEND_URL} />
        </Grid>
      </Grid>

      <Typography
        id="user-distributions"
        variant="h4"
        component="h2"
        sx={{
          textTransform: "uppercase",
          fontWeight: "medium",
          fontSize: 30,
        }}
        color={"secondary"}
        align="left"
        marginTop={3}
      >
        User Distribution
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Box display="flex" justifyContent="center">
            <VictoryPie
              data={userMetricsWithPercent}
              colorScale={["#87CEFA", "#4682B4", "#00BFFF", "#6495ED"]}
              innerRadius={50}
              labelComponent={<VictoryTooltip />}
              style={{ labels: { fontSize: 20 } }}
              // This will hide the labels inside the pie chart
              labels={() => null}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={8}>
          {renderCustomLabels()}
        </Grid>
      </Grid>

      {/* Wishlist Metrics Section */}
      <Grid item xs={12} id="wishlist-metrics">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 3,
            textTransform: "uppercase",
            fontWeight: "medium",
            fontSize: 30,
          }}
          gutterBottom
          color={"secondary"}
          align="left"
          marginTop={3}
        >
          Wishlist Metrics
        </Typography>

        <WishlistDashboard BACKEND_URL={BACKEND_URL} />
      </Grid>

      {/* Historical Fees Line Charts and Editing for Business and Parents */}
      {historicalFees.length > 0 && (
        <>
          {renderFeeSection(
            "business",
            chartColours.business,
            businessTimeRange,
            setBusinessTimeRange
          )}
          {renderFeeSection(
            "parent",
            chartColours.parent,
            parentTimeRange,
            setParentTimeRange
          )}
        </>
      )}

      {/* Dialog for Editing Fees */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Edit {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Fees
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="newRate"
            label="New Transaction Rate"
            type="number"
            fullWidth
            variant="outlined"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUpdatedDashboard;
