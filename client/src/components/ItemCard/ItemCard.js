import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import { toast } from "sonner";

// MUI components import
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { Tooltip } from "@mui/material";

// icons imports
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";

// dialogs import
import DeleteItemDialog from "../DeleteItemDialog/DeleteItemDialog";
import ConfirmationDialog from "../../pages/ClassroomPage/components/ConfirmationDialog";
import DonationsDialog from "../../pages/ClassroomPage/components/DonationsDialog";
import LoginDialog from "../LoginDialog/LoginDialog";

const ItemCard = ({ item, BACKEND_URL, setReload }) => {
  const navigate = useNavigate();

  // user variables
  const { authUser, setReloadAuthUser } = useContext(AuthContext);
  const userId = authUser?.userId;
  const role = authUser ? authUser.accountType : "";

  // favourites state
  const [isFavorited, setIsFavorited] = useState(
    authUser?.favoriteItems.includes(item.wishlistItemId) || false
  );

  // upvoting state
  const [hasVoted, setHasVoted] = useState(
    authUser?.votedSuggestions.includes(item.wishlistItemId) || false
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

  // item id for donations dialogue
  const [currentDonationItemId, setCurrentDonationItemId] = useState(null);

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
  const formattedEndDate = new Date(item.endDate).toLocaleDateString("en-GB");
  const formatedCreationDate = new Date(item.creationTime).toLocaleDateString(
    "en-GB"
  );
  const formattedDeadline = new Date(item?.deadline).toLocaleDateString(
    "en-GB"
  );

  // progress bar
  const progress = (item.currentValue / item.goalValue) * 100;

  // image handling
  let image = item?.image.includes("uploads")
    ? `${BACKEND_URL}/${item.image}`
    : item?.image;
  if (item?.image.includes("uploads")) {
    image = image.replace(/\\/g, "/");
  }
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
    }

    setHasVoted(!hasVoted);

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
      setHasVoted(hasVoted);
    }
  };

  // Updated handleDonation function to redirect to donation payment page
  const handleDonation = (wishlistItemId) => {
    navigate(`/stripe-payment?wishlistId=${wishlistItemId}`);
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

  // redirection to item details
  const handleViewDetailsClick = (wishlistItemId) => {
    navigate(`/classroom/${item.teacherId}/item/${wishlistItemId}`);
  };

  //   delete item
  const handleDeleteItem = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/wishlists/${item.wishlistItemId}`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      setOpenDeleteDialog(false);
      toast.success("Item successufully deleted");
      setReload((prev) => !prev);
    } catch (error) {
      toast.error(`Error deleting item: ${error.response.data.message}`);
    }
  };

  //   pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openDonationsDialog, setOpenDonationsDialog] = useState(false);

  return (
    <>
      <Box
        component={Card}
        onClick={() => handleViewDetailsClick(item.wishlistItemId)}
        sx={{
          display: "flex",
          transition: "all .2s ease-in-out",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          minHeight: { xs: "530px", md: "350px" },
          maxWidth: { xs: 485 },
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        {/* image */}
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: "lightblue",
            minHeight: "200px",
          }}
        >
          <img
            src={image}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Box>

        <Box
          sx={{
            minHeight: { xs: "270px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 2,
            maxWidth: { xs: "450px", md: "260px" },
          }}
          md={{ justifyContent: "flex-end" }}
        >
          <CardContent
            sx={{
              flexGrow: 1,
              padding: 0,
            }}
          >
            <Box
              marginTop={0}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", paddingRight: 0 }}
            >
              {/* top bit */}
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
                {/* tag */}
                <Box
                  sx={{
                    bgcolor: getTagColor(item.status),
                    color: "common.white",
                    borderRadius: 1,
                    padding: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: 1,
                  }}
                >
                  <Typography variant="caption" margin={0}>
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
                            aria-label={
                              isFavorited ? "unsave-item" : "save-item"
                            }
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

                    {role === "parent" &&
                      item.parentId === userId &&
                      item.status === "suggestion" && (
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
                    {/* parents their own suggestions */}
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
                    {/* teachers */}
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
                  </Box>

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
            </Box>

            {/* name */}
            <Typography
              variant={"h6"}
              gutterBottom
              sx={{ fontWeight: 600 }}
              width="80%"
              marginTop={1}
            >
              {item.name}
            </Typography>

            {/* deadline date */}
            <Box>
              {item.endDate && (
                <Typography variant={"subtitle2"}>
                  {item.status === "completed"
                    ? `Completed on ${formattedEndDate}`
                    : `By ${formattedDeadline}`}
                </Typography>
              )}
              {item.status === "suggestion" && (
                <Typography variant={"subtitle2"}>
                  Created on {formatedCreationDate}
                </Typography>
              )}
            </Box>

            {/* progress bar */}
            {(item.status === "active" || item.status === "underfunded") && (
              <Box
                width={{ xs: "100%", md: "250px" }}
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
                    display: { xs: "block", md: "block" },
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

            {/* parent name*/}
            {item.status === "suggestion" && (
              <Box width="250px" my={2}>
                <Typography variant={"subtitle2"}>
                  Created by {userId === item.parentId ? "me" : item.parentName}
                </Typography>
              </Box>
            )}

            {/* code */}
            <Box width="250px" my={2}>
              <Typography variant={"subtitle2"}>
                Item code: {item.code}
              </Typography>
            </Box>

            {/* description */}
            <Typography
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                textOverflow: "ellipsis",
                height: "3rem",
              }}
            >
              {item.description}
            </Typography>
          </CardContent>
          {/* Donation button for roles other than teacher and school */}
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
                    setCurrentDonationItemId(item.wishlistItemId);
                    setOpenDonationsDialog(true);
                  } else handleDonation(item.wishlistItemId);
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
                  navigate(`item/${item.wishlistItemId}/edit`);
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
                // width={"50%"}
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
        handleDonation={handleDonation}
        itemId={currentDonationItemId}
      />
    </>
  );
};

export default ItemCard;
