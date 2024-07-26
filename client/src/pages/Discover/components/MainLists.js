import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { toast } from "sonner";

// MUI compnents
import Container from "../../../common/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Pagination } from "@mui/material";
import { Tooltip } from "@mui/material";
import { Menu, MenuItem, ListItemText } from "@mui/material";

// icons
import FilterListIcon from "@mui/icons-material/FilterList";

// components
import TeacherCard from "../../../components/TeacherCard/TeacherCard";
import ItemCard from "../../../components/ItemCard/ItemCard";

const MainLists = ({ BACKEND_URL }) => {
  const theme = useTheme();
  //  styling
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // user variables
  const { authUser, isLoggedIn } = useContext(AuthContext);

  // state
  const [itemList, setItemList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [originalTeacherList, setOriginalTeacherList] = useState([]);
  const [originalItemList, setOriginalItemList] = useState([]);

  // sorting state
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("");

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
          ? `${BACKEND_URL}/discover/teachers`
          : `${BACKEND_URL}/discover/active-items`;
      try {
        const { data } = await axios.get(endpoint);

        if (selectedTab === 0) {
          setTeacherList(data);
          setOriginalTeacherList(data);
        } else {
          setItemList(data);
          setOriginalItemList(data);
        }
      } catch (error) {
        toast.error(`Error retrieving items`);
      }
    };

    fetchData();
  }, [BACKEND_URL, selectedTab, reload, isLoggedIn, authUser, currentPage]);

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
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          sortedItems.sort(
            (a, b) => new Date(a.deadline) - new Date(b.deadline)
          );
          break;
        case "earliest":
          sortedItems.sort(
            (a, b) => new Date(b.deadline) - new Date(a.deadline)
          );
          break;
        case "most-funded":
          sortedItems.sort((a, b) => {
            return b.currentValue / b.goalValue - a.currentValue / a.goalValue;
          });
          break;
        case "least-funded":
          sortedItems.sort((a, b) => {
            return a.currentValue / a.goalValue - b.currentValue / b.goalValue;
          });
          break;
        default:
          break;
      }
      setItemList(sortedItems);
    }
  }, [sortOption, selectedTab]);

  // pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Container
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        height={"100%"}
        width={"100%"}
        marginTop={5}
        id="discover-list"
      >
        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"center"}
          flexDirection={"column"}
        >
          {/* Top bit */}
          <Box
            maxWidth={isMd ? "270px" : "1020px"}
            display="flex"
            flexDirection={"column"}
            justifyContent="center"
            alignItems="center"
          >
            {/* Motivational Header */}
            <Typography
              gutterBottom
              align="center"
              marginTop={2}
              marginBottom={4}
              fontWeight={600}
              variant={!isMd ? "h2" : "h4"}
              color="primary"
            >
              Explore Opportunities to Make a Difference
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              gutterBottom
              align="center"
              marginBottom={4}
            >
              Browse through items or teachers for potential donation options.
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
            <Tab label="Teachers and Schools" sx={{ width: "50%" }} />
            <Tab label="All Items" sx={{ width: "50%" }} />
          </Tabs>

          {/* Item and teacher lists */}
          <>
            {selectedTab === 0 ? (
              displayTeachers.length > 0 && (
                <Grid marginTop={1} container spacing={2}>
                  {/* Teachers list */}
                  {displayTeachers.map((teacher, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
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
                {displayItems.length > 0 ? (
                  <Grid marginTop={1} container spacing={2}>
                    {/* Active items  list */}
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
                    No items to display
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
                No classrooms to display
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

export default MainLists;
