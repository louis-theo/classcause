import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Menu,
} from "@mui/material";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { AuthContext } from "../../../App";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Tooltip } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AdCard from "./AdCard";

const AdvertisementList = ({ advertisement, BACKEND_URL, setReloadAds }) => {
  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  //  user variables
  const { authUser } = useContext(AuthContext);
  const accountType = authUser?.accountType;

  // search  and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // tab state
  const [selectedTab, setSelectedTab] = useState(0);

  // pagination state
  const itemsPerPage = isMd ? 9 : 4;
  const [currentPage, setCurrentPage] = useState(1);

  //  delete state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [deleteAd, setDeleteAd] = useState(null);

  // delete dialog open
  const handleOpenConfirmDialog = (adId, adName) => {
    setDeleteAd({ adId, adName });
    setOpenConfirmDialog(true);
  };

  // delete ad
  const handleDelete = async () => {
    setOpenConfirmDialog(false);

    try {
      await axios.delete(`${BACKEND_URL}/advertisement/${deleteAd.adId}`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      setReloadAds((prev) => !prev);
      toast.success("Advertisement deleted successfully");
    } catch (error) {
      toast.error(
        `Failed to delete advertisement: ${error.response.data.message}`
      );
    }
  };

  // navigation to add ad
  const handleAddAdvertisement = () => {
    navigate("/advertisement/add");
  };

  // tabs for school
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    handleClose();
  };

  // sorting functionality
  const handleSortChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sorting order
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredAdvertisements = advertisement
    // filter if the user is school and selected mine tab
    .filter((ad) => {
      if (selectedTab === 1) {
        return ad.schoolId === authUser.userId;
      }
      return true;
    })
    // Filter by status if filterStatus is set
    .filter((ad) => !filterStatus || ad.status === filterStatus)
    // Further filter by searchTerm if set
    .filter(
      (ad) =>
        !searchTerm ||
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort by ad date based on sortOrder
    .sort((a, b) => {
      // Convert ad.time to Date objects for comparison
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

  return (
    <>
      {/* actions box */}
      <Box
        marginBottom={4}
        display="flex"
        flexDirection={isMd ? "row" : "column-reverse"}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width={
            isMd
              ? !authUser &&
                !["teacher", "school", "admin"].includes(
                  authUser?.accountType
                ) &&
                "100%"
              : "100%"
          }
        >
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

          {/* sort */}
          {/* sort icon */}
          <Tooltip title={"Sort"}>
            <IconButton aria-label="sort" onClick={handleMenuClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          {/* sorting menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleFilterChange(null)}>All</MenuItem>
            <MenuItem onClick={() => handleFilterChange("active")}>
              Active
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange("closed")}>
              Closed
            </MenuItem>
            <MenuItem onClick={handleSortChange}>
              {sortOrder === "asc" ? "Latest First" : "Earliest First"}
            </MenuItem>
          </Menu>
        </Box>

        {/* Render the add advertisement button as IconButton or Typography based on screen size */}
        {accountType === "school" && (
          <>
            {" "}
            <Box flexGrow={1} />
            <Button
              onClick={handleAddAdvertisement}
              variant="contained"
              color="primary"
              sx={{ marginBottom: 2 }}
              width="100%"
            >
              Add Advertisement
            </Button>
          </>
        )}
      </Box>

      {/* filter tabs for school to see their ads*/}
      {authUser?.accountType === "school" && (
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="filter tabs"
          variant={isMd ? "scrollable" : "standard"}
          scrollButtons={isMd ? "auto" : false}
          allowScrollButtonsMobile={isMd}
        >
          <Tab label="All" />
          <Tab label="mine" />
        </Tabs>
      )}

      {/* Item list */}
      {currentItems?.length > 0 ? (
        <>
          <Grid marginTop={1} container spacing={2}>
            {currentItems.map((ad, i) => (
              <Grid item xs={15} sm={6} md={4} key={i} marginTop={1.5}>
                <AdCard
                  ad={ad}
                  handleOpenConfirmDialog={handleOpenConfirmDialog}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination control */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
            />
          </Box>
        </>
      ) : (
        currentItems?.length === 0 && (
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
            No ads to display
          </Typography>
        )
      )}

      {/* confirm dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Delete Ad"
        message={`Are you sure you want to delete "${deleteAd?.adName}"?`}
      />
    </>
  );
};

export default AdvertisementList;
