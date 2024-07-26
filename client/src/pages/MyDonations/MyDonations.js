import React, { useState, useEffect, useContext, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";

// MUI components imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Menu, MenuItem, ListItemText, CircularProgress } from "@mui/material";
import { Tooltip, Button } from "@mui/material";
import { Pagination } from "@mui/material";
import Container from "../../common/Container";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// icon imports
import FilterListIcon from "@mui/icons-material/FilterList";

// component imports
import ItemCard from "../../components/ItemCard/ItemCard";
import LoginDialog from "../../components/LoginDialog/LoginDialog";
import Numbers from "./components/Numbers";
import HistoryGraph from "./components/HistoryGraph";

const MyDonationsPage = ({ BACKEND_URL }) => {
  const theme = useTheme();

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;

  // tab styling
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // state
  const [items, setItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("");

  // state for refersh
  const [reload, setReload] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // scroll
  const historyGraphRef = useRef(null);

  const scrollToGraph = () => {
    if (historyGraphRef.current) {
      historyGraphRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // fetch my donations
  const fetchMyDonations = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/parent-metrics/users/${userId}/donations`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      setItems(data);
    } catch (error) {
      console.error("Error fetching my donations:", error);
    }
  };
  useEffect(() => {
    if (authUser) {
      fetchMyDonations();
    }
  }, [BACKEND_URL, userId, currentPage, reload, authUser]);

  // tab change
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };
  const statusMap = {
    1: "active",
    2: "completed",
  };

  // search functionality
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // tabs and search filter for pagination
  useEffect(() => {
    const filtered = items.filter((item) => {
      return (
        (selectedTab === 0 || item.status === statusMap[selectedTab]) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    const paginatedItems = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    setDisplayItems(paginatedItems);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [items, selectedTab, searchTerm, currentPage]);

  // sorting functionality
  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSortOptionClick = (option) => {
    setSortOption(option);
    handleMenuClose();
  };

  // sorting logic
  useEffect(() => {
    let newDisplayedItems = [...items];

    switch (sortOption) {
      case "latest":
        // Sort active items by date in descending order, then append items without date
        newDisplayedItems.sort((a, b) => {
          if (a.status === "active" && b.status === "active") {
            return new Date(b.creationTime) - new Date(a.creationTime); // Latest active items first
          } else if (a.status === "active") {
            return -1; //  active items at the beginning
          } else if (b.status === "active") {
            return 1; //  non-active items to the end
          }
          return 0; //  original order for items without 'active' status or without dates
        });
        break;
      case "earliest":
        // Sort active items by date in ascending order, then append items without date
        newDisplayedItems.sort((a, b) => {
          if (a.status === "active" && b.status === "active") {
            return new Date(a.creationTime) - new Date(b.creationTime); // Earliest active items first
          } else if (a.status === "active") {
            return -1;
          } else if (b.status === "active") {
            return 1;
          }
          return 0;
        });
        break;

      case "mostFunded":
        // Sort active items by funding percentage in descending order, then append the rest
        newDisplayedItems.sort((a, b) => {
          const fundingA = a.currentValue / a.goalValue;
          const fundingB = b.currentValue / b.goalValue;

          if (a.status === "active" && b.status === "active") {
            return fundingB - fundingA;
          } else if (a.status === "active") {
            return -1;
          } else if (b.status === "active") {
            return 1;
          }
          return 0;
        });
        break;

      default:
        break;
    }

    setDisplayItems(newDisplayedItems);
  }, [sortOption, items]);

  const [parentMetrics, setParentMetrics] = useState(null);

  // fetch analytics
  const fetchAllParentMetrics = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/parent-metrics/users/${userId}/metrics`
      );
      setParentMetrics(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchAllParentMetrics();
    }
  }, [authUser]);

  // pagination
  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  //  pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  // loading animation
  if (!displayItems) {
    return <CircularProgress />;
  }

  return (
    <>
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
              My Donations
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              gutterBottom
              align="center"
              marginBottom={4}
            >
              See the donations you made, general statistics and your donation
              history
            </Typography>
          </Box>

          <Numbers parentMetrics={parentMetrics} />
          <Box marginY={3} textAlign={"center"}>
            <Button onClick={scrollToGraph}> see Donation History</Button>
          </Box>
          <Box
            marginTop={6}
            marginBottom={4}
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
          >
            {/* search */}
            <Box
              display="flex"
              alignItems="center"
              width={{ xs: "230px", md: "400px" }}
            >
              <TextField
                variant="outlined"
                placeholder="Search"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                  width: 350,
                  borderRadius: "25px",
                  marginRight: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "25px",
                  },
                }}
              />
            </Box>

            <Box flexGrow={1} />
            {/* sort button */}
            <Tooltip title={"Sort"}>
              <IconButton aria-label="sort" onClick={handleSortClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Sorting menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleSortOptionClick("latest")}>
              <ListItemText primary="Latest first" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("earliest")}>
              <ListItemText primary="Earliest first" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("mostFunded")}>
              <ListItemText primary="Most funded" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("")}>
              <ListItemText primary="Clear" />
            </MenuItem>
          </Menu>

          {/* filter tabs */}
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="filter tabs"
            variant={isMd ? "scrollable" : "standard"}
            scrollButtons={isMd ? "auto" : false}
            allowScrollButtonsMobile={isMd}
          >
            <Tab label="All" />
            <Tab label="active" />
            <Tab label="completed" />
          </Tabs>

          {/* Item list */}
          {displayItems?.length > 0 ? (
            <>
              <Grid marginTop={1} container spacing={2}>
                {displayItems?.map((item, i) => (
                  <Grid item xs={12} sm={6} key={i} data-aos={"fade-up"}>
                    <ItemCard
                      item={item}
                      BACKEND_URL={BACKEND_URL}
                      setReload={setReload}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Box>
            </>
          ) : (
            items?.length === 0 && (
              <Typography
                sx={{
                  textTransform: "uppercase",
                  fontWeight: "medium",
                  fontSize: 30,
                }}
                gutterBottom
                color={"secondary"}
                align={"center"}
                marginTop={10}
              >
                No items to display
              </Typography>
            )
          )}
        </Box>
        <HistoryGraph ref={historyGraphRef} parentMetrics={parentMetrics} />
      </Container>

      {/* Login Dialog */}
      <LoginDialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
      />
    </>
  );
};

export default MyDonationsPage;
