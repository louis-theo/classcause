import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { toast } from "sonner";

// MUI components imports
import Container from "../../common/Container";
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

// icons import
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";

// dialogs import
import DonationsDialog from "../../pages/ClassroomPage/components/DonationsDialog";
import ConfirmationDialog from "../../pages/ClassroomPage/components/ConfirmationDialog";
import DeleteItemDialog from "../DeleteItemDialog/DeleteItemDialog";
import LoginDialog from "../LoginDialog/LoginDialog";

const WishlistItemDetails = ({ BACKEND_URL }) => {
  const { wishlistItemId } = useParams();

  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  // user variables
  const { authUser, setReloadAuthUser } = useContext(AuthContext);
  const userId = authUser?.userId;
  const role = authUser ? authUser.accountType : "";
  const [item, setItem] = useState(null);

  // favourites state
  const [isFavorited, setIsFavorited] = useState(
    authUser?.favoriteItems.includes(item?.wishlistItemId) || false
  );
  const [reload, setReload] = useState(false);

  // upvoting state
  const [hasVoted, setHasVoted] = useState(
    authUser?.votedSuggestions.includes(item?.wishlistItemId) || false
  );

  // to preview the like and save state on page load
  useEffect(() => {
    setIsFavorited(
      authUser?.favoriteItems.includes(item?.wishlistItemId) || false
    );
    setHasVoted(
      authUser?.votedSuggestions.includes(item?.wishlistItemId) || false
    );
  }, [authUser, item?.wishlistItemId]);

  // fetch item details from db
  useEffect(() => {
    const fetchwishlistItem = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/wishlists/item/${wishlistItemId}`,
          {
            headers: {
              authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setItem(data);
      } catch (error) {
        toast.error(
          `Couldn't retrieve the wishlistItem details:${error.response.data.message}`
        );
      }
    };

    fetchwishlistItem();
  }, [BACKEND_URL, wishlistItemId, reload]);

  // tag colors
  const getTagColor = (status) => {
    const colors = {
      active: "green",
      suggestion: "purple",
      completed: "blue",
      underfunded: "orange",
    };
    return colors[status] || "grey";
  };

  //   formatted date
  const formattedEndDate = new Date(item?.endDate).toLocaleDateString("en-GB");
  const formattedCreationDate = new Date(item?.creationTime).toLocaleDateString(
    "en-GB"
  );
  const formattedDeadline = new Date(item?.deadline).toLocaleDateString(
    "en-GB"
  );
  const formattedDispatchDate = new Date(
    item?.dispatchDate
  )?.toLocaleDateString("en-GB");

  const formattedBoughtDate = new Date(item?.purchaseDate)?.toLocaleDateString(
    "en-GB"
  );
  const formattedWithdrawalDate = new Date(
    item?.withdrawalDate
  )?.toLocaleDateString("en-GB");

  // progress bar
  const progress = (item?.currentValue / item?.goalValue) * 100;

  //  handle donations
  const handleDonateClick = () => {
    navigate(`/stripe-payment?wishlistId=${item.wishlistItemId}`);
  };

  // update status function for underfunded or early end items
  const handleUnderfundedItem = async () => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/wishlists/${item.wishlistItemId}`,
        {
          status: "completed",
          isUnderfunded: 1,
        },
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setOpenConfirmationDialog(false);
      setReload((prev) => !prev);
      toast.success("Successfully ended item early");
      return response.data;
    } catch (error) {
      toast.error(`Error ending item early:${error.response.data.message}`);
    }
  };

  // voting on suggestions functionality
  const handleVoteClick = async (e) => {
    e.stopPropagation();

    if (!authUser) {
      setOpenLoginDialog(true);
      return;
    } else {
      setHasVoted(true);

      const method = hasVoted ? "delete" : "post";
      const url = `${BACKEND_URL}/vote${
        hasVoted ? `/delete/users/${userId}/item/${item.wishlistItemId}` : ""
      }`;

      try {
        await axios({
          method,
          url,
          data: {
            userId,
            wishlistItemId: item.wishlistItemId,
          },
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });

        setHasVoted(!hasVoted);
        setReload((prev) => !prev);
        setReloadAuthUser((prev) => !prev);
        hasVoted
          ? toast.success("Removed vote")
          : toast.success("Voted successfully");
      } catch (error) {
        hasVoted
          ? toast.error(
              `Error with removing the vote: ${error.response.data.message}`
            )
          : toast.error(
              `Error with adding the vote: ${error.response.data.message}`
            );
        setHasVoted(false);
      }
    }
  };

  //   Save item functionality
  const handleToggleFavorite = async () => {
    if (!userId) {
      setOpenLoginDialog(true);
      return;
    }

    const method = isFavorited ? "delete" : "post";
    const url = `${BACKEND_URL}/favourites/${
      isFavorited
        ? `delete/users/${userId}/item/${item.wishlistItemId}`
        : "save/item"
    }`;

    try {
      const response = await axios({
        method,
        url,
        data: {
          userId,
          wishlistItemId: item.wishlistItemId,
        },
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        setIsFavorited(!isFavorited);
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

  // withdrawn mark for teacher
  const markWithdrawn = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/wishlists/${item.wishlistItemId}/markWithdrawn`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      toast.success("Money marked withdrawn successfully");

      setReload((prev) => !prev);
    } catch (error) {
      toast.error(`Error marking withdrawal: ${error.response.data.message}`);
    }
  };

  // bought mark for teacher
  const markBought = async () => {
    if (!item.isMoneyWithdrawn) {
      toast.error("Need to withdraw funds first");
      return;
    }
    try {
      await axios.patch(
        `${BACKEND_URL}/wishlists/${item.wishlistItemId}/markBought`,
        {},
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      toast.success("Item marked as bought successfully.");
      setReload((prev) => !prev);
    } catch (error) {
      toast.error(
        `Error marking item as bought: ${error.response.data.message}`
      );
    }
  };

  //   delete item
  const handleDeleteItem = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/wishlists/${item.wishlistItemId}`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      toast.success("Item successufully deleted");
      setOpenDeleteDialog(false);
      setReload((prev) => !prev);
    } catch (error) {
      toast.error(`Error deleting item: ${error.response.data.message}`);
    }
  };

  // image handling
  let image = item?.image.includes("uploads")
    ? `${BACKEND_URL}/${item.image}`
    : item?.image;
  if (item?.image.includes("uploads")) {
    image = image.replace(/\\/g, "/");
  }

  //   pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openDonationsDialog, setOpenDonationsDialog] = useState(false);

  // loading state
  if (!item) {
    return (
      <Typography
        sx={{
          textTransform: "uppercase",
          fontWeight: "medium",
          fontSize: 30,
        }}
        gutterBottom
        color={"secondary"}
        align={"center"}
      >
        Item not found
      </Typography>
    );
  }

  let itemInfoList = [
    {
      title: "Item Code",
      subtitle: item.code.toUpperCase(),
    },
    {
      title: "Classroom",
      subtitle:
        item.teacherId !== userId ? (
          <Typography
            variant={"h6"}
            component={"p"}
            color="primary"
            sx={{
              cursor: "pointer",
              "&:hover": {
                color: "secondary",
                textDecoration: "underline",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${item.teacherId}`);
            }}
          >
            {item.teacherName.toUpperCase()}
          </Typography>
        ) : (
          <Typography variant={"h6"} component={"p"} color="text.primary">
            MINE
          </Typography>
        ),
    },
    {
      title: "Created on",
      subtitle: formattedCreationDate,
    },
    item.endDate && { title: "Ended On", subtitle: formattedEndDate },
    item.link && {
      title: "Item link",
      subtitle: item.link,
    },
  ].filter(Boolean);

  // target amount and deadline
  if (item.status === "active" || item.status === "underfunded") {
    itemInfoList.push(
      { title: "Target amount", subtitle: `£${Math.round(item.goalValue)}` },
      { title: "Deadline", subtitle: formattedDeadline.toUpperCase() }
    );
  }

  // money raised
  if (item.status === "completed" || item.status === "underfunded") {
    itemInfoList.push({
      title: "Money raised",
      subtitle: `£${Math.round(item.currentValue)}`,
    });
  }

  // fulfillment option
  if (item.teacherId === userId && item.status !== "suggestion") {
    itemInfoList.push({
      title: "Fulfillment option",
      subtitle: item.platformFulfillment === 0 ? "MYSELF" : "PLATFORM",
    });
  }

  // platform dispatch info
  if (
    item.status === "completed" &&
    item.teacherId === userId &&
    item.platformFulfillment === 1 &&
    item.isDispatched === 1
  ) {
    itemInfoList.push({
      title: "Dispatched on",
      subtitle: formattedDispatchDate,
    });
  }

  // suggestion creator
  if (item.status === "suggestion") {
    itemInfoList.push({
      title: "Created by",
      subtitle:
        userId !== item.parentId ? (
          <Typography
            variant={"h6"}
            component={"p"}
            color="primary"
            sx={{
              cursor: "pointer",
              "&:hover": {
                color: "secondary",
                textDecoration: "underline",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${item.parentId}`);
            }}
          >
            {item.teacherName.toUpperCase()}
          </Typography>
        ) : (
          <Typography variant={"h6"} component={"p"} color="text.primary">
            ME
          </Typography>
        ),
    });
  }

  // teacher fulfilment details
  if (
    item.status === "completed" &&
    item.teacherId === userId &&
    item.platformFulfillment === 0
  ) {
    if (item.isMoneyWithdrawn === 1) {
      itemInfoList.push({
        title: "Money withdrawn on",
        subtitle: formattedWithdrawalDate,
      });
    }
    if (item.isItemBought === 1) {
      itemInfoList.push({ title: "Bought on", subtitle: formattedBoughtDate });
    }
  }

  // render action buttons
  const renderButtons = () => {
    return (
      <Box marginTop={2} textAlign={"center"}>
        {role !== "teacher" &&
          role !== "school" &&
          item.status === "active" && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              width="50%"
              sx={{ marginRight: 1, marginTop: { xs: 2, md: 1 } }}
              onClick={(e) => {
                e.stopPropagation();

                if (!authUser) {
                  setOpenDonationsDialog(true);
                } else handleDonateClick(item.wishlistItemId);
              }}
            >
              Donate
            </Button>
          )}
        {/* review for suggestions */}
        {(role === "teacher" || role === "school") &&
          item.teacherId === userId &&
          item.status === "suggestion" && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              width="50%"
              sx={{ marginRight: 1, marginTop: { xs: 2, md: 1 } }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/classroom/item/${item.wishlistItemId}/edit`);
              }}
            >
              Review
            </Button>
          )}
        {/* end item for active  */}
        {(role === "teacher" || role === "school") &&
          item.teacherId === userId &&
          item.status === "active" && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              width="50%"
              sx={{ marginRight: 1, marginTop: { xs: 2, md: 1 } }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenConfirmationDialog(true);
              }}
            >
              End item now
            </Button>
          )}
        {/* swicth underfunded to complete for active  */}
        {(role === "teacher" || role === "school") &&
          item.teacherId === userId &&
          item.status === "underfunded" && (
            <Tooltip title="Mark this item as complete. You can withdraw the money already sourced.">
              <Button
                variant="contained"
                color="secondary"
                size="small"
                width="50%"
                sx={{ marginRight: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnderfundedItem();
                }}
              >
                Mark as Complete
              </Button>
            </Tooltip>
          )}

        {/* add story as proof to completed with content */}
        {item.status === "completed" &&
          (!item.storiesId ? (
            (role === "teacher" || role === "school") &&
            item.teacherId === userId ? (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                width="50%"
                cursor="pointer"
                sx={{ marginRight: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${item.wishlistItemId}/success-stories/add`);
                }}
              >
                Add story
              </Button>
            ) : (
              ""
            )
          ) : (
            <Typography
              color="primary"
              textTransform={"uppercase"}
              textAlign={"right"}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  color: "secondary",
                  textDecoration: "underline",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/success-stories/${item.storiesId}`);
              }}
            >
              see Success story
            </Typography>
          ))}
      </Box>
    );
  };

  return (
    <>
      <Container>
        <Box>
          <Box marginBottom={{ xs: 4, sm: 8, md: 12 }}>
            {/* back button */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ marginBottom: 2 }}
            >
              Back
            </Button>
            <Grid
              container
              spacing={4}
              direction={isMd ? "row" : "column-reverse"}
              marginTop={0}
            >
              <Grid
                item
                xs={12}
                md={6}
                data-aos={isMd ? "fade-right" : "fade-up"}
              >
                <Box marginBottom={4}>
                  {/* top bit with icons and tag */}
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems={
                      role === "parent" &&
                      item.parentId === userId &&
                      item.status === "suggestion"
                        ? "flex-start"
                        : "center"
                    }
                    justifyContent="space-between"
                    width="100%"
                  >
                    {/*  tag */}
                    <Box
                      sx={{
                        bgcolor: getTagColor(item.status),
                        color: "common.white",
                        borderRadius: 1,
                        padding: "3px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 1,
                        width: isMd ? "40%" : "55%",
                        marginBottom: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: "medium",
                        }}
                      >
                        {item.status}
                      </Typography>
                    </Box>
                    {/* icon box */}
                    <Box
                      display="flex"
                      alignItems="flex-end"
                      sx={{
                        flexDirection: {
                          md:
                            role === "parent" && item.parentId === userId
                              ? "column"
                              : "row",
                          xs: "row",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        {/* save to favourites */}
                        {(role === "parent" ||
                          role === "business" ||
                          !role) && (
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
                                aria-label={
                                  isFavorited ? "unsave-item" : "save-item"
                                }
                                size="small"
                                sx={{ marginRight: 1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    role === "parent" ||
                                    role === "business"
                                  ) {
                                    handleToggleFavorite();
                                  } else {
                                    setOpenLoginDialog(true);
                                  }
                                }}
                              >
                                <StarIcon
                                  fontSize="small"
                                  color={isFavorited ? "error" : "disabled"}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {/*  icons for teachers and school */}
                        {(role === "teacher" || role === "school") &&
                          item.teacherId === userId &&
                          (() => {
                            if (item.status === "completed") {
                              if (item.platformFulfillment === 0) {
                                return (
                                  <>
                                    {/*item bought icon */}
                                    <Tooltip
                                      title={
                                        !item.isItemBought
                                          ? "Mark item as bought"
                                          : "Item bought"
                                      }
                                    >
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!item.isItemBought) {
                                            markBought();
                                          }
                                        }}
                                      >
                                        <LocalMallIcon
                                          color={
                                            item.isItemBought
                                              ? "secondary"
                                              : "disabled"
                                          }
                                        />
                                      </IconButton>
                                    </Tooltip>

                                    {/* money withdrawn icon */}
                                    <Tooltip
                                      title={
                                        !item.isMoneyWithdrawn
                                          ? "Mark money as withdrawn"
                                          : "Money withdrawn"
                                      }
                                    >
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!item.isMoneyWithdrawn) {
                                            markWithdrawn();
                                          }
                                        }}
                                      >
                                        <AccountBalanceWalletIcon
                                          color={
                                            item.isMoneyWithdrawn
                                              ? "secondary"
                                              : "disabled"
                                          }
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                );
                              } else if (item.platformFulfillment === 1) {
                                return (
                                  <>
                                    <Tooltip
                                      title={
                                        item.isDispatched
                                          ? "Item dispatched"
                                          : "Item hasn't been dispatched yet"
                                      }
                                    >
                                      <IconButton>
                                        <LibraryAddCheckIcon
                                          color={
                                            item.isDispatched
                                              ? "secondary"
                                              : "disabled"
                                          }
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                );
                              }
                            } else if (item.status === "active") {
                              return (
                                <Tooltip title={"Edit Item"}>
                                  <span>
                                    <IconButton
                                      aria-label="edit"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/classroom/item/${item.wishlistItemId}/edit`
                                        );
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              );
                            }
                          })()}

                        {role === "parent" && item.parentId === userId && (
                          <Tooltip title={"Edit Item"}>
                            <span>
                              <IconButton
                                aria-label="edit"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/suggestions/${item.wishlistItemId}/edit`
                                  );
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {/* delete icon */}

                        {role === "parent" &&
                          item.status === "suggestion" &&
                          item.parentId === userId && (
                            <Tooltip title={"Delete Item"}>
                              <span>
                                <IconButton
                                  aria-label="delete"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                      </Box>

                      {(role === "teacher" || role === "school") &&
                        item.status === "suggestion" &&
                        item.teacherId === userId && (
                          <Tooltip title={"Delete Item"}>
                            <span>
                              <IconButton
                                aria-label="delete"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                      {/* upvoting icon */}
                      {(role === "parent" ||
                        !role ||
                        role === "teacher" ||
                        role === "school") &&
                        item.status === "suggestion" && (
                          <Tooltip
                            title={
                              role === "parent" || role === "business" ? (
                                hasVoted ? (
                                  "Unvote"
                                ) : (
                                  "Vote"
                                )
                              ) : role === "school" || role === "teacher" ? (
                                "Likes number"
                              ) : (
                                <span>You need to be logged in.</span>
                              )
                            }
                          >
                            <span>
                              <IconButton
                                aria-label="upvote"
                                size="small"
                                sx={{
                                  marginRight: 1,
                                  color: hasVoted
                                    ? "secondary.main"
                                    : "action.disabled",
                                }}
                                onClick={
                                  role === "parent"
                                    ? (e) => {
                                        handleVoteClick(e, item.itemId);
                                      }
                                    : role === "school" || role === "teacher"
                                    ? (e) => {
                                        e.stopPropagation();
                                      }
                                    : (e) => {
                                        e.stopPropagation();
                                        setOpenLoginDialog(true);
                                      }
                                }
                              >
                                <ThumbUpIcon fontSize="small" />
                                <Typography
                                  sx={{
                                    color: hasVoted
                                      ? "secondary.main"
                                      : "action.disabled",
                                  }}
                                >
                                  {item.votingNum || 0}
                                </Typography>
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                    </Box>
                  </Box>

                  {/* item name */}
                  <Box
                    component={Typography}
                    fontWeight={700}
                    variant={"h4"}
                    gutterBottom
                  >
                    <Typography
                      color="primary"
                      variant="inherit"
                      component="span"
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  {/* progress bar */}
                  {(item.status === "active" ||
                    item.status === "underfunded") && (
                    <Box
                      width={{ xs: "100%", md: "100%" }}
                      my={2}
                      position="relative"
                      sx={{
                        "&:hover": {
                          ".progress-percentage": {
                            display: "block",
                          },
                        },
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: "20px",
                          borderRadius: "10px",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: "10px",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        component="div"
                        color="white"
                        sx={{
                          position: "absolute",
                          width: "100%",
                          top: "50%",
                          left: 0,
                          transform: "translateY(-50%)",
                          textAlign: "center",
                          fontWeight: "bold",
                          display: { xs: "block", md: "block" }, // Display on non-desktop by default
                        }}
                      >
                        {`£${Math.round(item?.currentValue)} / £${Math.round(
                          item?.goalValue
                        )}`}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        className="progress-percentage"
                        sx={{
                          display: "none",
                          position: "absolute",
                          top: "-30px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "black",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          pointerEvents: "none",
                        }}
                      >
                        {`${Math.round(progress)}%`}
                      </Typography>
                    </Box>
                  )}

                  {/* description */}
                  <Typography
                    variant={"h6"}
                    component={"p"}
                    color={"textSecondary"}
                  >
                    {item.description}
                  </Typography>
                </Box>
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  gap={4}
                >
                  {/* info list */}
                  <List disablePadding>
                    {itemInfoList.map((item, index) => (
                      <ListItem
                        key={index}
                        disableGutters
                        data-aos="fade-up"
                        alignItems="flex-start"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          width="100%"
                        >
                          <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            width="60%"
                          >
                            {isMd ? (
                              <Box
                                width={10}
                                minWidth={10}
                                height={10}
                                borderRadius={"100%"}
                                bgcolor={theme.palette.primary.main}
                                marginRight={5}
                              />
                            ) : (
                              ""
                            )}
                            <Typography
                              variant={"subtitle1"}
                              color={"textSecondary"}
                              width="80%"
                            >
                              {item.title.toUpperCase()}
                            </Typography>
                          </Box>

                          <Typography
                            variant={"h6"}
                            width="40%"
                            textAlign={"right"}
                          >
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  {item.status === "completed" &&
                    item.teacherId === userId &&
                    item.isUnderfunded === 1 &&
                    (item.endDate < item.deadline ? (
                      <Typography
                        variant={"subtitle1"}
                        color={"textSecondary"}
                        textTransform={"uppercase"}
                        textAlign={"center"}
                      >
                        Item was ended earlier
                      </Typography>
                    ) : (
                      item.endDate === item.deadline && (
                        <Typography
                          variant={"subtitle1"}
                          color={"textSecondary"}
                          textTransform={"uppercase"}
                          textAlign={"center"}
                        >
                          Item was underfunded
                        </Typography>
                      )
                    ))}

                  {!isMd && renderButtons()}
                </Box>
              </Grid>

              {/* image */}
              <Grid
                item
                container
                justifyContent="center"
                alignItems="center"
                xs={12}
                md={6}
                data-aos={isMd ? "fade-left" : "fade-up"}
              >
                <Box
                  component={Card}
                  boxShadow={4}
                  height={"100%"}
                  width={"100%"}
                  maxHeight={isMd ? "435px" : "300px"}
                >
                  <Box
                    component={CardMedia}
                    height={"100%"}
                    width={"100%"}
                    minHeight={300}
                    image={image}
                    maxHeight={isMd ? "435px" : "300px"}
                  />
                </Box>
                {isMd && renderButtons()}
              </Grid>
            </Grid>
          </Box>
        </Box>
        {/* Login Dialog */}
        <LoginDialog
          open={openLoginDialog}
          onClose={() => setOpenLoginDialog(false)}
        />
        {/* Delete dialog */}
        <DeleteItemDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          handleDeleteItem={handleDeleteItem}
        />
        {/* Confirmation dialog */}
        <ConfirmationDialog
          open={openConfirmationDialog}
          onClose={() => setOpenConfirmationDialog(false)}
          handleUnderfundedItem={handleUnderfundedItem}
        />
        {/* Donations login prompt dialog */}
        <DonationsDialog
          open={openDonationsDialog}
          onClose={() => setOpenDonationsDialog(false)}
          handleDonation={handleDonateClick}
          itemId={item.wishlistItemId}
        />
      </Container>
    </>
  );
};

export default WishlistItemDetails;
