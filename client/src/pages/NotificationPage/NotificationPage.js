import React, { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import { AuthContext } from "../../App";
import Container from "../../common/Container";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import { toast } from "sonner";

const NotificationPage = ({ BACKEND_URL }) => {
  const { authUser } = useContext(AuthContext);
  const [notificationContent, setNotificationContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(6);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortByTime, setSortByTime] = useState(true);
  const [sortByReadStatus, setSortByReadStatus] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/notification`, {
        params: {
          userId: authUser?.userId,
          searchTerm,
        },
      });
      if (response.data) {
        const formattedNotifications = response.data.map((notification) => ({
          ...notification,
          title:
            notification.senderFirstName && notification.senderLastName
              ? `${notification.messageTitle} from ${notification.senderFirstName} ${notification.senderLastName}`
              : notification.messageTitle,
          timeFormatted: new Date(notification.time).toLocaleDateString(
            "en-GB"
          ),
          content: notification.messageContent,
          actualUrl: notification.url.startsWith("Link to the target: ")
            ? notification.url.replace("Link to the target: ", "")
            : notification.url,
        }));

        const sortedNotifications = formattedNotifications.sort((a, b) => {
          return sortByTime
            ? new Date(b.timeFormatted) - new Date(a.timeFormatted)
            : 0;
        });

        const filteredNotifications =
          sortByReadStatus !== null
            ? sortedNotifications.filter(
                (notification) => notification.status === sortByReadStatus
              )
            : sortedNotifications;

        setNotificationContent(filteredNotifications);
      }
    } catch (error) {
      console.error(`Failed to fetch notifications: ${error}`);
      toast.error(`Failed to fetch notifications: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchNotifications();
    }
  }, [authUser, BACKEND_URL, sortByTime, sortByReadStatus, searchTerm]);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notificationContent.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const pageCount = Math.ceil(
    notificationContent.length / notificationsPerPage
  );

  const handleOpenDialog = (notification) => {
    setSelectedNotification(notification);
    setOpenDialog(true);
    if (notification.status === 0) {
      updateNotificationStatus(notification.notificationId);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const updateNotificationStatus = async (notificationId) => {
    try {
      await axios.put(`${BACKEND_URL}/notification/${notificationId}`, {
        status: 1,
      });
      fetchNotifications();
    } catch (error) {
      toast.error(
        `Failed to update notification status: ${error.response.data.message}`
      );
    }
  };

  const handleSortByTime = () => {
    setSortByTime(true);
    setSortByReadStatus(null);
    setAnchorEl(null);
  };

  const handleSortByReadStatus = (status) => {
    setSortByTime(false);
    setSortByReadStatus(status);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box py={4}>
      <Container maxWidth={800}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Notifications
        </Typography>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ mr: 1, mt: 0.5 }} />
          <TextField
            sx={{ mr: 6, mt: 0.5 }}
            label="Search Notifications"
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <IconButton onClick={handleMenuOpen}>
            <FilterListIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleSortByTime}>Sort by Time</MenuItem>
            <MenuItem onClick={() => handleSortByReadStatus(0)}>
              Unread
            </MenuItem>
            <MenuItem onClick={() => handleSortByReadStatus(1)}>Read</MenuItem>
          </Menu>
        </Box>
        {currentNotifications.length === 0 ? (
          <Typography
            sx={{
              textTransform: "uppercase",
              fontWeight: "medium",
              fontSize: 30,
            }}
            gutterBottom
            color={"secondary"}
            align={"center"}
            marginTop={8}
          >
            No notifications to display
          </Typography>
        ) : (
          currentNotifications.map((notification, index) => {
            const actualUrl = notification.url.replace(
              "Link to the target: ",
              ""
            );

            return (
              <Box
                key={index}
                my={2}
                border={1}
                borderColor="primary.main"
                p={2}
                borderRadius={5}
                onClick={() => handleOpenDialog(notification)}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  height: "100%",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={notification.status === 0 ? "bold" : "normal"}
                    color={
                      notification.status === 0 ? "primary" : "text.primary"
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {notification.timeFormatted}
                  </Typography>
                  <Typography variant="body1">
                    {notification.content}
                  </Typography>
                </Box>

                <Box
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%) translateX(-20px)",
                    paddingRight: 12,
                  }}
                >
                  <Button
                    component="a"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = actualUrl;
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{
                      borderRadius: 18,
                    }}
                  >
                    See Link
                  </Button>
                </Box>
              </Box>
            );
          })
        )}
        <Grid container justifyContent="center">
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={handleChangePage}
          />
        </Grid>
      </Container>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          style: { maxWidth: "md", minWidth: "60%", padding: "20px" },
        }}
      >
        <DialogTitle variant="h4">{selectedNotification?.title}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle" color="textSecondary" marginTop={2}>
            {selectedNotification?.timeFormatted}
          </Typography>
          <Typography
            variant="p"
            fontSize="large"
            marginTop={2}
            marginBottom={3}
          >
            {selectedNotification?.content}
          </Typography>

          {selectedNotification && (
            <Button
              component="a"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = selectedNotification.url.replace(
                  "Link to the target: ",
                  ""
                );
              }}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              size="small"
              style={{
                borderRadius: 18,

                width: "30%",
              }}
            >
              See Link
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} style={{ color: "red" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationPage;
