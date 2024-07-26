import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";

// MUI components imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Menu, MenuItem, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import { Pagination } from "@mui/material";
import Container from "../../common/Container";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// icon imports
import FilterListIcon from "@mui/icons-material/FilterList";

// component imports
import LoginDialog from "../../components/LoginDialog/LoginDialog";
import AdCard from "../AdvertisementPage/components/AdCard";

const MyBidsPage = ({ BACKEND_URL }) => {
  const theme = useTheme();

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;

  // tab styling
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // state
  const [ads, setAds] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState("");

  // state for refersh
  const [reload, setReload] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // fetch my suggestions
  const fetchMyAds = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/bids/${authUser?.userId}/mine`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setAds(data);
    } catch (error) {
      console.error("Error fetching my bids:", error);
    }
  };
  useEffect(() => {
    fetchMyAds();
  }, [BACKEND_URL, userId, currentPage, reload, authUser]);

  // tab change
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };

  // search functionality
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAdvertisements = ads
    // filter if the user is school and selected mine tab
    .filter((ad) => {
      if (selectedTab === 1) return ad.status === "active";
      if (selectedTab === 2) return ad.status === "closed";
      return true;
    })
    .filter(
      (ad) =>
        !searchTerm ||
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort by ad date based on sortOrder
    .sort((a, b) => {
      const dateA = new Date(a.creationDate),
        dateB = new Date(b.creationDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // pagination
  const totalPages = Math.ceil(filteredAdvertisements.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdvertisements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const applySortOrder = (order) => {
    setSortOrder(order);
    setAnchorEl(null);
  };

  // pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  //  pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  // loading animation
  if (!ads) {
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
              My Bids
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              gutterBottom
              align="center"
              marginBottom={6}
            >
              You can find the advertisements that you have bid on here
            </Typography>
          </Box>

          <Box
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

          {/* sorting menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => applySortOrder("asc")}>
              Oldest First
            </MenuItem>
            <MenuItem onClick={() => applySortOrder("desc")}>
              Newest First
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
            <Tab label="closed" />
          </Tabs>

          {/* Item list */}
          {filteredAdvertisements?.length > 0 ? (
            <>
              <Grid marginTop={1} container spacing={2}>
                {currentItems?.map((ad, i) => (
                  <Grid item xs={15} sm={6} md={4} key={i} marginTop={1.5}>
                    <AdCard
                      ad={ad}
                      BACKEND_URL={BACKEND_URL}
                      theme={theme}
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
            filteredAdvertisements?.length === 0 && (
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
                No Ads to display
              </Typography>
            )
          )}
        </Box>
      </Container>

      {/* Login Dialog */}
      <LoginDialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
      />
    </>
  );
};

export default MyBidsPage;
