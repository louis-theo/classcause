import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { toast } from "sonner";

// MUI components import
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
import Container from "../../common/Container";
import { Pagination } from "@mui/material";
import { Tooltip } from "@mui/material";
import { Menu, MenuItem, ListItemText } from "@mui/material";

// icon import
import FilterListIcon from "@mui/icons-material/FilterList";

// component import
import DispatchItemCard from "./components/DispatchItemCard";

const DispatchInfoPage = ({ BACKEND_URL }) => {
  const theme = useTheme();

  // tab styling
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;

  // state
  const [items, setItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);

  // state for refresh
  const [reload, setReload] = useState(false);

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // fetching items
  const fetchPlatformItems = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/dispatch/items/platform`
      );
      setItems(data);
    } catch (error) {
      toast.error(`Error retrieving items`);
    }
  };
  useEffect(() => {
    fetchPlatformItems();
  }, [BACKEND_URL, currentPage, authUser]);

  // tab change
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };
  const statusMap = {
    1: 0,
    2: 1,
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
        (selectedTab === 0 || item.isDispatched === statusMap[selectedTab]) &&
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
  }, [items, currentPage, selectedTab, searchTerm]);

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
    const sortedItems = [...items].sort((a, b) => {
      switch (sortOption) {
        case "latest":
          return new Date(b.endDate) - new Date(a.endDate);
        case "earliest":
          return new Date(a.endDate) - new Date(b.endDate);
        default:
          return 0;
      }
    });
    setItems(sortedItems);
  }, [sortOption]);

  // pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Container
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        display={"flex"}
        justifyContent={"center"}
        height={"100%"}
        marginTop={7}
      >
        <Box maxWidth={960} width={"100%"}>
          {/* Top bit */}
          <Box
            marginBottom={4}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
          >
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
                align="left"
              >
                Items to dispatch
              </Typography>
              <Typography
                variant="h6"
                color="textSecondary"
                gutterBottom
                align="left"
                marginBottom={4}
                textAlign={"center"}
              >
                Begin by utilising the sorting feature to organise your dispatch
                items by their status, whether you're looking for the newest
                additions or items ready to be sent. Then, employ the search
                function to swiftly find items by name or code. To keep your
                dispatch process seamless and up-to-date, simply click on an
                item to view its detailed information and use the provided
                interface to change its status from pending to dispatched,
                ensuring every item is accounted for.
              </Typography>
            </Box>
          </Box>

          <Box
            marginBottom={4}
            display="flex"
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
            <Tab label="pending" />
            <Tab label="dispatched" />
          </Tabs>

          {/* Item list */}

          {items.length > 0 ? (
            <>
              <Grid marginTop={1} container spacing={2}>
                {displayItems.map((item, i) => (
                  <Grid item xs={12} sm={6} key={i} data-aos={"fade-up"}>
                    <DispatchItemCard
                      item={item}
                      BACKEND_URL={BACKEND_URL}
                      theme={theme}
                      fetchPlatformItems={fetchPlatformItems}
                      setItems={setItems}
                      items={items}
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
          )}
        </Box>
      </Container>
    </>
  );
};
DispatchInfoPage.propTypes = {
  onItemViewDetailsClick: PropTypes.func,

  themeMode: PropTypes.string,
};

export default DispatchInfoPage;
