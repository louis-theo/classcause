import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import axios from "axios";
import { toast } from "sonner";
import PropTypes from "prop-types";

// MUI Components
import Container from "../../common/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Pagination } from "@mui/material";
import { Tooltip } from "@mui/material";
import { Menu, MenuItem, ListItemText } from "@mui/material";

// icons imports
import StarIcon from "@mui/icons-material/Star";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

// dialog imports and components
import LoginDialog from "../../components/LoginDialog/LoginDialog";
import BlockDialog from "./components/BlockDialog";
import ItemCard from "../../components/ItemCard/ItemCard";

const ClassroomPage = ({ BACKEND_URL }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // user variables
  const { authUser, setReloadAuthUser } = useContext(AuthContext);
  const { teacherId } = useParams();
  const userId = authUser?.userId;
  const role = authUser ? authUser.accountType : "";

  // state
  const [items, setItems] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);

  // enforcing stories
  const [itemsWithNoStory, setItemsWithNoStory] = useState(null);

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("");

  // state for refersh on delete
  const [reload, setReload] = useState(false);

  // favourites state
  const [isFavorited, setIsFavorited] = useState(
    authUser?.favoriteClassrooms.includes(parseInt(teacherId)) || false
  );

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // fetching items with pagination depending on the user role
  const fetchWishlistItems = async () => {
    try {
      if (
        (authUser?.accountType === "teacher" ||
          authUser?.accountType === "school") &&
        !teacherId
      ) {
        const { data } = await axios.get(`${BACKEND_URL}/wishlists/${userId}`);

        // Filter in items with no stories
        const displayItemsNoStories = data.filter(
          (item) => item.storiesId === null && item.status === "completed"
        );
        setItemsWithNoStory(displayItemsNoStories);
        setItems(data);
      } else {
        const { data } = await axios.get(
          `${BACKEND_URL}/wishlists/${teacherId}`
        );

        // Filter out underfunded items
        const filteredData = data.filter(
          (item) => item.status !== "underfunded"
        );
        setItems(filteredData);
      }
    } catch (error) {
      toast.error(`Error fetching wishlist items`);
    }
  };
  useEffect(() => {
    fetchWishlistItems();
  }, [BACKEND_URL, userId, teacherId, currentPage, reload, authUser]);

  // tab change
  const handleTabChange = (event, newValue) => {
    setCurrentPage(1);
    setSelectedTab(newValue);
  };
  const statusMap = {
    1: "active",
    2: "completed",
    3: "suggestion",
    4: "underfunded",
  };

  // tab styling
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

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
    if (!sortOption) {
      setItems([...items]);
      return;
    }

    let newDisplayedItems = [...items];

    switch (sortOption) {
      case "latest":
        // Sort active items by date in descending order, then append items without date
        newDisplayedItems.sort((a, b) => {
          if (a.status === "active" && b.status === "active") {
            return new Date(b.deadline) - new Date(a.deadline);
          } else if (a.status === "active") {
            return -1;
          } else if (b.status === "active") {
            return 1;
          }
          return 0;
        });
        break;
      case "earliest":
        // Sort active items by date in ascending order, then append items without date
        newDisplayedItems.sort((a, b) => {
          if (a.status === "active" && b.status === "active") {
            return new Date(a.deadline) - new Date(b.deadline);
          } else if (a.status === "active") {
            return -1;
          } else if (b.status === "active") {
            return 1;
          }
          return 0;
        });
        break;
      case "mostLiked":
        // Sort suggestion items by likes in descending order, then append the rest
        newDisplayedItems.sort((a, b) => {
          if (a.status === "suggestion" && b.status === "suggestion") {
            return b.likes - a.likes; // Most liked suggestions first
          } else if (a.status === "suggestion") {
            return -1;
          } else if (b.status === "suggestion") {
            return 1;
          }
          return 0;
        });
        break;
      case "mostFunded":
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

    setItems(newDisplayedItems);
  }, [sortOption]);

  //   Save classroom functionality
  const handleToggleFavorite = async () => {
    if (!userId) {
      setOpenLoginDialog(true);
      return;
    }

    const method = isFavorited ? "delete" : "post";
    const url = `${BACKEND_URL}/favourites/${
      isFavorited
        ? `delete/users/${userId}/classroom/${teacherId}`
        : "save/classroom"
    }`;

    try {
      const response = await axios({
        method,
        url,
        data: {
          userId,
          classroomId: teacherId,
        },
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setIsFavorited(!isFavorited); // toggle
        setReload((prev) => !prev);
        setReloadAuthUser((prev) => !prev);
        isFavorited
          ? toast.success("Removed from favourites")
          : toast.success("Added to favourites");
      }
    } catch (error) {
      isFavorited
        ? toast.error(
            `Error with removing from favourites: ${error.response.data.message}`
          )
        : toast.error(
            `Error with adding to favourites: ${error.response.data.message}`
          );
    }
  };

  // blocking adding item if no stories added
  const hasBlockingItems = items.some((item) => {
    const completionDate = new Date(item.completionDate);
    const twoWeeksAgo = new Date(Date.now() - 12096e5); // 2 weeks
    return (
      item.status === "completed" &&
      !item.storyId &&
      completionDate < twoWeeksAgo
    );
  });

  // teacher's name name from db
  const [userName, setUserName] = useState("Teacher");

  const getUserName = async (userId) => {
    const { data } = await axios.get(`${BACKEND_URL}/users/name/${userId}`);

    const userName = `${data.userFirstName} ${data.userLastName}`;
    setUserName(userName);
    return userName;
  };

  useEffect(() => {
    if (teacherId) {
      if ((authUser && (role !== "teacher" || role !== "school")) || !role) {
        getUserName(teacherId);
      }
    }
  }, [teacherId]);

  // pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  //   pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openStoriesBlockDialog, setOpenStoriesBlockDialog] = useState(false);

  return (
    <>
      {itemsWithNoStory?.length > 0 && (
        <Box
          sx={{
            width: "100%",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            padding: "8px 0",
            overflow: "hidden",
            marginTop: { xs: 8, md: 8.5, lg: 9 },
          }}
        >
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ userSelect: "none" }}
          >
            📣 Remember to add success stories for your completed items! 📣
          </Typography>
        </Box>
      )}
      <Container
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        height={"100%"}
        width={"100%"}
        marginTop={itemsWithNoStory?.length > 0 ? 0 : 5}
      >
        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"center"}
          flexDirection={"column"}
        >
          {/* Top bit */}
          <Box
            marginBottom={4}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            width="100%"
          >
            {/* page name */}
            {/* if the user is parent/business, if not logged in, if teacher/school but other's person webpage */}
            {(role === "parent" ||
              !role ||
              role === "business" ||
              role === "admin" ||
              (teacherId &&
                (role === "teacher" || role === "school") &&
                authUser.userId !== teacherId)) && (
              <Typography
                fontWeight={700}
                variant="h4"
              >{`${userName}'s Wishlist`}</Typography>
            )}

            {/* if the user is teacher and his page */}
            {(teacherId &&
              role === "teacher" &&
              authUser.userId === teacherId) ||
              (!teacherId && role === "teacher" && (
                <Typography
                  marginTop={2}
                  fontWeight={700}
                  variant={!isMd ? "h3" : "h4"}
                  color="primary"
                  gutterBottom
                >
                  My classroom wishlist
                </Typography>
              ))}

            {/* if the user is school and his page */}
            {(teacherId &&
              role === "school" &&
              authUser.userId === teacherId) ||
              (!teacherId && role === "school" && (
                <Typography
                  marginTop={2}
                  fontWeight={700}
                  variant={!isMd ? "h3" : "h4"}
                  color="primary"
                  gutterBottom
                >
                  My school wishlist
                </Typography>
              ))}

            <Box flexGrow={1} />
            {/* Save icon for parent or business */}
            {(role === "parent" || role === "business" || !role) && (
              <Tooltip
                title={
                  role === "parent" || role === "business" ? (
                    "Save to favourites"
                  ) : (
                    <span>You need to be logged in.</span>
                  )
                }
              >
                <span>
                  <IconButton
                    aria-label={isFavorited ? "unsave-item" : "save-item"}
                    size="small"
                    sx={{ marginRight: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (role === "parent" || role === "business") {
                        handleToggleFavorite();
                      } else {
                        setOpenLoginDialog(true);
                      }
                    }}
                  >
                    <StarIcon
                      fontSize="large"
                      color={isFavorited ? "error" : "disabled"}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Buttons to add new item or suggestion */}
            <Box>
              {/* Conditional rendering based on screen size */}
              {(role === "teacher" || role === "school") && (
                <>
                  {isXs ? (
                    <Tooltip title="Add Item">
                      <IconButton
                        onClick={() => {
                          if (hasBlockingItems) {
                            setOpenStoriesBlockDialog(true);
                          } else {
                            navigate("/classroom/items/add");
                          }
                        }}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      width="100%"
                      onClick={() => {
                        if (hasBlockingItems) {
                          setOpenStoriesBlockDialog(true);
                        } else {
                          navigate("/classroom/items/add");
                        }
                      }}
                    >
                      + Add Item
                    </Button>
                  )}
                </>
              )}

              {role === "parent" && (
                <>
                  {isXs ? (
                    <Tooltip title="Add Suggestion">
                      <IconButton
                        onClick={() => {
                          navigate(`/classroom/${teacherId}/items/add`);
                        }}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      width="100%"
                      onClick={() => {
                        navigate(`/classroom/${teacherId}/items/add`);
                      }}
                    >
                      + Add Suggestion
                    </Button>
                  )}
                </>
              )}
            </Box>
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
            <MenuItem onClick={() => handleSortOptionClick("mostLiked")}>
              <ListItemText primary="Most liked" />
            </MenuItem>
            <MenuItem onClick={() => handleSortOptionClick("")}>
              <ListItemText primary="Clear" />
            </MenuItem>
          </Menu>

          {/* filter tabs */}
          {role === "teacher" || role === "school" ? (
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant={isMd ? "scrollable" : "standard"}
              scrollButtons={isMd ? "auto" : false}
              allowScrollButtonsMobile={isMd}
            >
              <Tab label="All" />
              <Tab label="active" />
              <Tab label="completed" />
              <Tab label="suggestions" />
              <Tab label="underfunded" />
            </Tabs>
          ) : (
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
              <Tab label="suggestions" />
            </Tabs>
          )}

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

      {/* Login Dialog */}
      <LoginDialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
      />

      {/* Stories block Dialog */}
      <BlockDialog
        open={openStoriesBlockDialog}
        onClose={() => setOpenStoriesBlockDialog(false)}
      />
    </>
  );
};
ClassroomPage.propTypes = {
  onItemViewDetailsClick: PropTypes.func,

  themeMode: PropTypes.string,
};

export default ClassroomPage;
