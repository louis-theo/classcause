import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../App";
import { ListItemText, Menu, Pagination } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { toast } from "sonner";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import { Tooltip } from "@mui/material";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import SuccessStoryCard from "./SuccessStoryCard";
// icon imports
import FilterListIcon from "@mui/icons-material/FilterList";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const StoriesList = ({ stories, BACKEND_URL, setReloadStories }) => {
  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  // user variables
  const { authUser } = useContext(AuthContext);

  // search  and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");
  const [anchorEl, setAnchorEl] = useState(null);

  // tab state
  const [selectedTab, setSelectedTab] = useState(0);

  // pagination state
  const storiesPerPage = isMd ? 9 : 4;
  const [currentPage, setCurrentPage] = useState(1);

  // add story navigation
  const handleAddStory = () => {
    navigate("/success-stories/add");
  };

  // delete state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // delete dialog open
  const handleOpenConfirmDialog = (storyId, storyName) => {
    setStoryToDelete({ storyId, storyName });
    setOpenConfirmDialog(true);
  };

  // delete story
  const handleDeleteStoryConfirmed = async () => {
    setOpenConfirmDialog(false);
    if (!storyToDelete || !storyToDelete.storyId) return;
    try {
      await axios.delete(
        `${BACKEND_URL}/success-stories/${storyToDelete.storyId}`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setReloadStories((prev) => !prev);
      toast.success("Story successfully deleted");
    } catch (error) {
      console.log(error);
      toast.error(`Failed to delete the story:${error.response.data.message}`);
    }
  };

  // tabs for teacher
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };

  // search and sort functionality (filtering)
  const filteredSortedStories = stories
    .filter((story) => {
      if (selectedTab === 1) {
        return story.teacherId === authUser.userId;
      }
      return true;
    })
    .filter(
      (story) =>
        story.storyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.storyDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (story.wishlistItemName &&
          story.wishlistItemName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (story.wishlistItemCode &&
          story.wishlistItemCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "nameAsc":
          return a.storyName.localeCompare(b.storyName);
        case "nameDesc":
          return b.storyName.localeCompare(a.storyName);
        case "mostRecent":
          return (
            new Date(b.wishlistItemEndDate) - new Date(a.wishlistItemEndDate)
          );
        case "oldestFirst":
          return (
            new Date(a.wishlistItemEndDate) - new Date(b.wishlistItemEndDate)
          );
        default:
          return 0;
      }
    });

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

  // pagination
  const totalPages = Math.ceil(filteredSortedStories.length / storiesPerPage);
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = filteredSortedStories.slice(
    indexOfFirstStory,
    indexOfLastStory
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
        {/* search */}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width={
            !authUser &&
            !["teacher", "school", "admin"].includes(authUser?.accountType) &&
            "100%"
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <IconButton aria-label="sort" onClick={handleSortClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          {/* sorting menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleSortOptionClick("nameAsc")}>
              <ListItemText primary="Name Ascending" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("nameDesc")}>
              <ListItemText primary="Name Descending" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("mostRecent")}>
              <ListItemText primary="Most Recent" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("oldestFirst")}>
              <ListItemText primary="Oldest First" />
            </MenuItem>
          </Menu>
        </Box>

        {/* add story */}
        {authUser && ["teacher", "school"].includes(authUser?.accountType) && (
          <>
            {" "}
            <Box flexGrow={1} />
            <Button
              onClick={handleAddStory}
              variant="contained"
              color="primary"
              sx={{ marginBottom: 2 }}
              width="100%"
            >
              Add Story
            </Button>
          </>
        )}
      </Box>

      {/* tabs for teacher and school to view their stories separately */}

      {/* filter tabs */}
      {["teacher", "school"].includes(authUser?.accountType) && (
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
      {currentStories?.length > 0 ? (
        <>
          <Grid marginTop={1} container spacing={2}>
            {currentStories.map((story, i) => (
              <Grid item xs={12} sm={6} md={4} key={i} data-aos={"fade-up"}>
                <SuccessStoryCard
                  story={story}
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
        currentStories?.length === 0 && (
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
            No stories to display
          </Typography>
        )
      )}

      {/* confirm dialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleDeleteStoryConfirmed}
        title="Delete Story"
        message={`Are you sure you want to delete "${storyToDelete?.storyName}"?`}
      />
    </>
  );
};

StoriesList.propTypes = {
  stories: PropTypes.arrayOf(
    PropTypes.shape({
      storyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      wishlistItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      picture: PropTypes.string,
      storyName: PropTypes.string.isRequired,
      storyDescription: PropTypes.string.isRequired,
      wishlistItemName: PropTypes.string,
      wishlistItemCode: PropTypes.string,
      currentValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Object),
      ]),
      endDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Object),
      ]),
    })
  ).isRequired,
  themeMode: PropTypes.string,
};

export default StoriesList;
