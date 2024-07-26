import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import axios from "axios";
import { Pagination } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Tooltip } from "@mui/material";
import { Menu, MenuItem, ListItemText } from "@mui/material";

import useMediaQuery from "@mui/material/useMediaQuery";
import { AuthContext } from "../../App";
import Container from "../../common/Container";
import TeacherCard from "../../components/TeacherCard/TeacherCard";
import ItemCard from "../../components/ItemCard/ItemCard";

const FavouritesPage = ({ BACKEND_URL }) => {
  const theme = useTheme();

  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;

  // state
  const [itemList, setItemList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // item status filter
  const [activeFilter, setActiveFilter] = useState("all");

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [originalTeacherList, setOriginalTeacherList] = useState([]);
  const [originalItemList, setOriginalItemList] = useState([]);

  // state for refersh on delete
  const [reload, setReload] = useState(false);

  // pagination
  const [displayItems, setDisplayItems] = useState([]);
  const [displayTeachers, setDisplayTeachers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Fetch and set items or teachers based on the selected tab
  useEffect(() => {
    const fetchData = async () => {
      const endpoint =
        selectedTab === 0
          ? `${BACKEND_URL}/favourites/users/${userId}/classrooms`
          : `${BACKEND_URL}/favourites/users/${userId}/items`;
      try {
        const { data } = await axios.get(endpoint);

        if (selectedTab === 0) {
          setTeacherList(data.data);
          setOriginalTeacherList(data.data);
        } else {
          setItemList(data.data);
          setOriginalItemList(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (userId) fetchData();
  }, [BACKEND_URL, selectedTab, reload, authUser, currentPage]);

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

  // tabs and search filter for pagination
  // filtered teachers and paginations
  useEffect(() => {
    const filteredTeachers = teacherList.filter((teacher) => {
      return (
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.school &&
          teacher.school.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.postcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const paginatedTeachers = filteredTeachers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setDisplayTeachers(paginatedTeachers);
    setTotalPages(Math.ceil(filteredTeachers.length / itemsPerPage));
  }, [teacherList, selectedTab, searchTerm, currentPage]);

  // filtered items
  useEffect(() => {
    const filteredItems = itemList.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.status === activeFilter;

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    const paginatedItems = filteredItems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setDisplayItems(paginatedItems);
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
  }, [itemList, selectedTab, searchTerm, currentPage]);

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
    if (option === "") {
      setTeacherList([...originalTeacherList]);
      setItemList([...originalItemList]);
    }
  };

  // sorting logic
  useEffect(() => {
    if (selectedTab === 0) {
      // Sorting teachers
      let sortedTeachers = [...originalTeacherList];
      switch (sortOption) {
        case "a-z":
          sortedTeachers.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "z-a":
          sortedTeachers.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "items-ascending":
          sortedTeachers.sort((a, b) => a.activeItems - b.activeItems);
          break;
        case "items-descending":
          sortedTeachers.sort((a, b) => b.activeItems - a.activeItems);
          break;
        default:
          break;
      }
      setTeacherList(sortedTeachers);
    } else {
      // Sorting items

      let sortedItems = [...originalItemList];
      switch (sortOption) {
        case "latest":
          sortedItems.sort((a, b) => {
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
          sortedItems.sort((a, b) => {
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
        case "most-funded":
          sortedItems.sort((a, b) => {
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
        case "least-funded":
          sortedItems.sort((a, b) => {
            const fundingA = a.currentValue / a.goalValue;
            const fundingB = b.currentValue / b.goalValue;

            if (a.status === "active" && b.status === "active") {
              return fundingA - fundingB;
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
      setItemList(sortedItems);
    }
  }, [sortOption, selectedTab, itemList, teacherList]);

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
      >
        <Box width={"100%"}>
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
              Favourites
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              gutterBottom
              align="center"
              marginBottom={4}
            >
              Find your saved items, schools and classrooms here
            </Typography>
          </Box>
          <Box flexGrow={1} />

          {/* search box */}
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
          {selectedTab === 0 ? (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleSortOptionClick("a-z")}>
                <ListItemText primary="A - Z" />
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("z-a")}>
                <ListItemText primary="Z - A" />
              </MenuItem>
              <MenuItem
                onClick={() => handleSortOptionClick("items-descending")}
              >
                <ListItemText primary="Most Items" />
              </MenuItem>
              <MenuItem
                onClick={() => handleSortOptionClick("items-ascending")}
              >
                <ListItemText primary="Least Items" />
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("")}>
                <ListItemText primary="Clear" />
              </MenuItem>
            </Menu>
          ) : (
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
              <MenuItem onClick={() => handleSortOptionClick("most-funded")}>
                <ListItemText primary="Most funded" />
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("least-funded")}>
                <ListItemText primary="Least funded" />
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionClick("")}>
                <ListItemText primary="Clear" />
              </MenuItem>
            </Menu>
          )}

          {/* filter tabs */}
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              ".MuiTabs-flexContainer": {
                justifyContent: "space-around",
              },
            }}
          >
            <Tab label="Classrooms" sx={{ width: "50%" }} />
            <Tab label="WIshlist Items" sx={{ width: "50%" }} />
          </Tabs>

          {/* item list */}

          <>
            {selectedTab === 0 ? (
              teacherList.length > 0 && (
                <Grid marginTop={1} container spacing={2}>
                  {/* Fav Teachers list */}
                  {displayTeachers.map((teacher, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={index}
                      data-aos={"fade-up"}
                    >
                      <TeacherCard
                        teacher={teacher}
                        BACKEND_URL={BACKEND_URL}
                        setReload={setReload}
                      />
                    </Grid>
                  ))}
                </Grid>
              )
            ) : (
              <>
                <Box
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                  marginTop={2}
                >
                  <Tabs
                    value={activeFilter}
                    onChange={(event, newValue) => setActiveFilter(newValue)}
                    aria-label="item filters"
                    variant={isMd ? "scrollable" : "standard"}
                    scrollButtons={isMd ? "auto" : false}
                    allowScrollButtonsMobile={isMd}
                  >
                    <Tab label="All" value="all" />
                    <Tab label="Active" value="active" />
                    <Tab label="Completed" value="completed" />
                    <Tab label="Suggestions" value="suggestion" />
                  </Tabs>
                </Box>
                {itemList.length > 0 ? (
                  <Grid marginTop={1} container spacing={2}>
                    {/* Fav items  list */}
                    {displayItems.map((item, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        key={index}
                        data-aos={"fade-up"}
                      >
                        <ItemCard
                          item={item}
                          BACKEND_URL={BACKEND_URL}
                          setReload={setReload}
                        />
                      </Grid>
                    ))}
                  </Grid>
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
                    No favourite items to display
                  </Typography>
                )}
              </>
            )}

            {/* if it's classroom tab and there are no items */}
            {selectedTab === 0 && displayTeachers.length === 0 && (
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
                No favourite classrooms to display
              </Typography>
            )}

            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
              />
            </Box>
          </>
        </Box>
      </Container>
    </>
  );
};

export default FavouritesPage;
