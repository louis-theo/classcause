import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import { VictoryPie, VictoryTooltip } from "victory";
import Container from "../../common/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const TeacherDashboard = ({ BACKEND_URL }) => {
  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  const [topContributors, setTopContributors] = useState([]);
  const [averageContributors, setAverageContributors] = useState(null);
  const [pieData, setPieData] = useState([]);
  const { authUser } = useContext(AuthContext);
  const [totalDonations, setTotalDonations] = useState(null);

  useEffect(() => {
    const userId = authUser?.userId;
    if (userId) {
      const fetchData = async () => {
        try {
          // Fetch the top contributors, average contributors, and status counts
          const responses = await Promise.all([
            fetch(`${BACKEND_URL}/teachermetrics/${userId}/top-contributors`),
            fetch(
              `${BACKEND_URL}/teachermetrics/${userId}/average-contributors`
            ),
            fetch(`${BACKEND_URL}/teachermetrics/${userId}/completed-items`),
            fetch(`${BACKEND_URL}/teachermetrics/${userId}/active-items`),
            fetch(`${BACKEND_URL}/teachermetrics/${userId}/pending-items`),
            fetch(`${BACKEND_URL}/teachermetrics/${userId}/total-donated`),
          ]);
          const [
            topContributors,
            averageContributors,
            completedItems,
            activeItems,
            pendingItems,
            totalDonations,
          ] = await Promise.all(responses.map((res) => res.json()));

          // Set the fetched data to state
          setTopContributors(topContributors);
          setTotalDonations(parseFloat(totalDonations.totalDonations));
          setAverageContributors(
            averageContributors.averageContributors !== null
              ? Math.round(parseFloat(averageContributors.averageContributors))
              : null
          );
          setPieData([
            { x: "Completed", y: completedItems.completedCount },
            { x: "Active", y: activeItems.activeCount },
            { x: "Suggestions", y: pendingItems.pendingCount },
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [authUser, BACKEND_URL]);

  const COLORS = ["#87CEFA", "#4682B4", "#00BFFF"];
  return (
    <>
      <Container
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        height={"100%"}
        width={"100%"}
        marginTop={5}
      >
        {" "}
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
            variant={isMd ? "h2" : "h3"}
            color="primary"
            gutterBottom
            align="center"
          >
            My metrics
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            gutterBottom
            align="center"
            marginBottom={6}
          >
            You can find the statistics for performance here
          </Typography>
        </Box>
        {/* stats */}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            flexDirection: isMd ? "row" : "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: isMd ? "50%" : "100%",
            }}
          >
            {/* Average Contributors */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant={isMd ? "h5" : "h6"} component="h2">
                  Average Contributors Per Item
                </Typography>
                <Typography>
                  {averageContributors !== null
                    ? ""
                    : "You have not received any donations yet."}
                </Typography>
              </Box>
              <Typography
                variant={isMd ? "h4" : "h5"}
                align="center"
                textTransform={"bold"}
                color={"primary"}
                marginX={isMd ? 2 : 1}
              >
                {averageContributors}
              </Typography>
            </Paper>

            {/* Total Donations */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant={isMd ? "h5" : "h6"} component="h2">
                  Total Donations
                </Typography>
                <Typography>
                  {totalDonations !== null
                    ? ``
                    : "You have not received any donations yet."}
                </Typography>
              </Box>
              <Typography
                variant={isMd ? "h4" : "h5"}
                align="center"
                textTransform={"bold"}
                color={"primary"}
                marginX={isMd ? 2 : 1}
              >
                £{totalDonations}
              </Typography>
            </Paper>
          </Box>

          {/* Pie Chart for Wishlist Item Status */}
          <Box
            spacing={2}
            alignItems="center"
            flexDirection={"column"}
            width={isMd ? "50%" : "100%"}
          >
            <Typography
              variant="h5"
              align="center"
              textTransform={"uppercase"}
              color={"secondary"}
              fontWeight="bold"
            >
              Wishlist Item Status
            </Typography>
            <Box
              spacing={2}
              display={"flex"}
              alignItems="center"
              flexDirection={"row"}
            >
              {/* pie chart */}
              <Box width={"300px"}>
                <VictoryPie
                  data={pieData}
                  colorScale={COLORS}
                  innerRadius={30}
                  labelComponent={<VictoryTooltip />}
                  height={100}
                  width={150}
                  style={{
                    labels: {
                      fill: "black",
                      fontSize: 6,
                      fontWeight: "bold",
                    },
                  }}
                  labels={({ datum }) => `${datum.x}: ${datum.y}`}
                />
              </Box>
              {/* legend */}
              <Box mt={4}>
                {pieData.map((entry, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: "0.5rem" }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        backgroundColor: COLORS[index % COLORS.length],
                        mr: 1,
                      }}
                    />
                    <Typography sx={{ fontSize: "18px" }}>
                      {entry.x}: {entry.y}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        {/* top contributors */}
        <Box sx={{ gridColumn: "span 3", mb: 2, mt: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: 30,
            }}
            gutterBottom
            color={"secondary"}
            align="center"
          >
            Top Contributors
          </Typography>
          {topContributors.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                mb: 2,
                "::-webkit-scrollbar": {
                  width: "8px",
                },
                "::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                },
                "::-webkit-scrollbar-thumb": {
                  background: "#888",
                  "&:hover": {
                    background: "#555",
                  },
                },
                "& *": {
                  scrollbarWidth: "thin",
                  scrollbarColor: "#888 #f1f1f1",
                },
              }}
            >
              <Table
                sx={{ minWidth: isMd ? 650 : 270 }}
                aria-label="contributors table"
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.main" }}>
                    <TableCell
                      align="center"
                      sx={{
                        variant: "h3",
                        color: "white",
                        textTransform: "uppercase",
                        fontSize: "large",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        variant: "h3",
                        color: "white",
                        textTransform: "uppercase",
                        fontSize: "large",
                      }}
                    >
                      Total Donation
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topContributors.map((contributor, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        align="center"
                        component="th"
                        scope="row"
                        sx={{
                          variant: "p",
                          fontSize: "large",
                        }}
                      >
                        {contributor.name}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          variant: "p",
                          fontSize: "large",
                        }}
                      >
                        £{parseFloat(contributor.totalDonation).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1">
              You have no top contributors yet.
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default TeacherDashboard;
