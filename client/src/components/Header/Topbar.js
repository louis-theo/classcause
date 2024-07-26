// Topbar.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import PropTypes from "prop-types";

// MUI components
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

// icons
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";

// assets
import logo from "../../assets/logo.svg";
import axios from "axios";

const Topbar = ({ onSidebarOpen, BACKEND_URL }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadCount, setShowUnreadCount] = useState(true); // State to control whether to show unread count
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const { isLoggedIn, handleLogout, authUser } = useContext(AuthContext);
  const userId = authUser?.userId;

  const role = authUser?.accountType;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const authToken = sessionStorage.getItem("authToken");
        const unreadCountResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/notification/unreadCount`,
          {
            params: { userId },
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          }
        );
        setUnreadCount(unreadCountResponse.data);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    if (isLoggedIn && userId) {
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId, BACKEND_URL]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/");
  };

  // Toggle function for showing/hiding unread count
  const toggleUnreadCount = () => {
    setShowUnreadCount(false);
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      bgcolor={"primary.main"}
      color={"primary.contrastText"}
      // paddingX={1}
      width="100%"
      paddingY={1}
    >
      {/* Burger Menu (for Mobile and Tablet) */}
      <Box display={{ xs: "flex", md: "none" }}>
        <IconButton onClick={onSidebarOpen} aria-label="Menu" color="inherit">
          <MenuIcon />
        </IconButton>
      </Box>
      {/* Logo */}
      <Box display="flex" alignItems="center">
        <Link
          underline="none"
          component="a"
          href="/"
          color="inherit"
          fontWeight="bold"
          display="flex"
          alignItems="flex-end"
          sx={{
            img: {
              height: { xs: "25px", md: "35px" },
              objectFit: "cover",
              objectPosition: "center",
            },
          }}
        >
          <img src={logo} alt="logo" />
        </Link>
      </Box>

      {/* Links for Larger Screens */}
      <Box
        display={{ xs: "none", md: "flex" }}
        alignItems={"center"}
        marginLeft={"auto"}
      >
        {isLoggedIn ? (
          <Box
            marginX={2}
            sx={{ display: "flex", gap: 2, alignItems: "center" }}
          >
            {role === "teacher" && (
              <>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/discover"
                  color="inherit"
                >
                  Discover
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href={`/classroom`}
                  color="inherit"
                >
                  My Classroom
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="inherit"
                >
                  Success Stories
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/teacher-analytics"
                  color="inherit"
                >
                  Analytics
                </Link>
              </>
            )}

            {role === "school" && (
              <>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/discover"
                  color="inherit"
                >
                  Discover
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/classroom"
                  color="inherit"
                >
                  My School
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="inherit"
                >
                  Success Stories
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/advertisement"
                  color="inherit"
                >
                  My Ads
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/teacher-analytics"
                  color="inherit"
                >
                  Analytics
                </Link>
              </>
            )}

            {role === "parent" && (
              <>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/discover"
                  color="inherit"
                >
                  Discover
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/favourites"
                  color="inherit"
                >
                  Favourites
                </Link>

                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="inherit"
                >
                  Success Stories
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/my-suggestions"
                  color="inherit"
                >
                  My Suggestions
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/my-donations"
                  color="inherit"
                >
                  My donations
                </Link>
              </>
            )}

            {role === "business" && (
              <>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/discover"
                  color="inherit"
                >
                  Discover
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/favourites"
                  color="inherit"
                >
                  Favourites
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/advertisement"
                  color="inherit"
                >
                  Advertisments
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="inherit"
                >
                  Success Stories
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/my-bids"
                  color="inherit"
                >
                  My Bids
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/my-donations"
                  color="inherit"
                >
                  My donations
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/discover"
                  color="inherit"
                >
                  Discover
                </Link>

                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/dispatch-items"
                  color="inherit"
                >
                  Dispatch Items
                </Link>

                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/success-stories"
                  color="inherit"
                >
                  Success Stories
                </Link>
                <Link
                  textAlign={"center"}
                  underline="none"
                  component="a"
                  href="/admin-dashboard"
                  color="inherit"
                >
                  Fees and Analytics
                </Link>
              </>
            )}
          </Box>
        ) : (
          <Box marginX={2} sx={{ display: "flex", gap: 2 }}>
            <Link
              underline="none"
              component="a"
              href="/discover"
              color="inherit"
            >
              Discover
            </Link>

            <Link
              underline="none"
              component="a"
              href="/success-stories"
              color="inherit"
            >
              Success Stories
            </Link>
            <Link
              textAlign={"center"}
              underline="none"
              component="a"
              href="/advertisement"
              color="inherit"
            >
              For partners
            </Link>
          </Box>
        )}
        {/* Divider and space between links */}
        <Divider orientation="vertical" flexItem />
        <Box marginX={1} />
      </Box>

      {/* Account Icon with Dropdown Menu (for Screens < 1020px) */}
      <Box display={{ xs: "flex", md: "none" }}>
        <IconButton aria-label="Account" color="inherit" onClick={handleMenu}>
          <AccountCircleIcon />
        </IconButton>
        {isLoggedIn ? (
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
              }}
            >
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        ) : (
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/signup");
              }}
            >
              Sign Up
            </MenuItem>
          </Menu>
        )}
      </Box>

      {/* Account and Logout Icons (for Screens >= 1020px) */}
      <Box display={{ xs: "none", md: "flex" }} alignItems={"center"}>
        {isLoggedIn ? (
          <>
            <Box marginX={1}>
              <IconButton
                aria-label="Notification"
                color="inherit"
                onClick={() => {
                  navigate("/notification");
                }}
              >
                <Badge
                  badgeContent={showUnreadCount ? unreadCount : null}
                  color="error"
                >
                  <NotificationIcon onClick={toggleUnreadCount} />
                </Badge>
              </IconButton>
            </Box>
            <Box marginX={1}>
              <IconButton
                aria-label="Account"
                color="inherit"
                onClick={() => {
                  navigate("/profile");
                }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Box>
            <Box marginX={1}>
              <IconButton
                aria-label="Logout"
                color="inherit"
                onClick={handleLogoutClick}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <Box marginX={2} sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" color="inherit" href="/signup">
                Sign Up
              </Button>
              <Button variant="outlined" color="inherit" href="/login">
                Login
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

Topbar.propTypes = {
  onSidebarOpen: PropTypes.func,
};

export default Topbar;
