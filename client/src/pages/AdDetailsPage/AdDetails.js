import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../App";

// MUI components
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  Tooltip,
  IconButton,
} from "@mui/material";

// styling
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import CardMedia from "@mui/material/CardMedia";
import Container from "../../common/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import BidNoti from "../../components/Notification/BidNoti";

// icons import
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";

// dialogs import
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import LoginDialog from "../../components/LoginDialog/LoginDialog";
import BidDialog from "./AddBidDialog";

const AdDetails = () => {
  const navigate = useNavigate();
  const { advertisementId } = useParams();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const getTagColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green";
      case "closed":
        return "red";
      default:
        return "grey";
    }
  };

  // user variables
  const { isLoggedIn, authUser, BACKEND_URL } = useContext(AuthContext);
  const role = sessionStorage.getItem("role");
  const userId = authUser?.userId;

  // data state
  const [adDetails, setAdDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [highestBidder, setHighestBidder] = useState("");
  const [reload, setReload] = useState(false);

  // delete dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  const bidNotiInstance = BidNoti();
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);

  // fetch all the info
  const fetchAdDetails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/advertisement/${advertisementId}/details`
      );
      setAdDetails(data.advertisement);
      const sortedParticipants = data.bids.sort((a, b) => b.price - a.price);
      setParticipants(sortedParticipants);
      setHighestBidder(data.highestBidder);
    } catch (error) {
      toast.error(
        `Failed to fetch participants: ${error.response.data.message}`
      );
    }
  };

  useEffect(() => {
    fetchAdDetails();
  }, [advertisementId, authUser, reload]);

  // edit navigation
  const handleEdit = () => {
    navigate(`/advertisement/${advertisementId}/edit`);
  };

  // delete ad
  const handleDeleteAd = async () => {
    setOpenConfirmDialog(false);
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/advertisement/${adDetails.advertisementId}`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      setReload((prev) => !prev);
      navigate("/advertisement");
      toast.success("Advertisement successufully deleted");
    } catch (error) {
      toast.error(
        `Error deleting advetisement: ${error.response.data.message}`
      );
    }
  };

  const handleOpenBidDialog = () => {
    setOpenBidDialog(true);
  };

  const handleCloseBidDialog = () => {
    setOpenBidDialog(false);
  };

  const handleBidAmountChange = (event) => {
    setBidAmount(event.target.value);
  };

  const submitBid = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/bids/add`, {
        advertisementId,
        businessID: authUser?.userId,
        price: bidAmount,
      });
      setReload((prev) => !prev);

      bidNotiInstance.addBid(advertisementId, userId);
      setOpenBidDialog(false);
      toast.success("Bid submitted");
    } catch (error) {
      toast.error(`Error submitting bid: ${error?.response.data.message}`);
    }
  };

  // remove bid
  const handleRemoveBid = async (bidId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/bids/remove/${bidId}`,
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      setReload((prev) => !prev);
      toast.success("Bid removed");
    } catch (error) {
      toast.error(`Failed to remove bid: ${error.response.data.message}`);
    }
  };

  // select winner by school
  const selectWinner = async (participantId, bidPrice) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/advertisement/${adDetails.advertisementId}/selectWinner`,
        {
          winnerId: participantId,
          bidPrice: bidPrice,
        },
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      setReload((prev) => !prev);
      toast.success("Winner has been successfully selected!");
    } catch (error) {
      toast.error(`Error selecting winner: ${error.response.data.message}`);
    }
  };

  // loading state
  if (!adDetails) {
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
        Advertisement not found
      </Typography>
    );
  }
  // info list
  const isAdmin = authUser?.accountType === "admin";
  const isCreator = authUser?.userId === adDetails.schoolId;

  let adInfoList = [
    {
      title: "Starting Price",
      subtitle: `£${adDetails.startingPrice}`,
    },
    {
      title: "Highest Bidding Price",
      subtitle: `£${adDetails.highestBiddingPrice}`,
    },
    {
      title: "School",
      subtitle: (
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
            navigate(`/profile/${adDetails.schoolId}`);
          }}
        >
          {adDetails?.schoolName.toUpperCase()}
        </Typography>
      ),
    },

    // Highest bidder information, visible only to the admin or the ad's creator
    (isAdmin || isCreator) &&
      highestBidder && {
        title:
          adDetails.status === "active" ? "Highest Bidder" : "Winning bidder",
        subtitle: (
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
              navigate(`/profile/${highestBidder.userId}`);
            }}
          >
            {highestBidder.userFirstName.toUpperCase()}{" "}
            {highestBidder.userLastName.toUpperCase()}
          </Typography>
        ),
      },
  ].filter(Boolean);

  // image handling
  let image = adDetails?.image?.includes("uploads")
    ? `${BACKEND_URL}/${adDetails.image}`
    : adDetails?.image;
  if (adDetails?.image?.includes("uploads")) {
    image = image?.replace(/\\/g, "/");
  }

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
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    marginBottom={3}
                  >
                    {/*  tag */}
                    <Box
                      sx={{
                        bgcolor: getTagColor(adDetails.status),
                        color: "common.white",
                        borderRadius: 1,
                        padding: "3px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 1,
                        width: isMd ? "40%" : "55%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "medium",
                        }}
                        gutterBottom
                      >
                        {adDetails.status.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* icon box */}
                    {((role === "school" && adDetails.schoolId === userId) ||
                      role === "admin") &&
                      adDetails.status.toLowerCase() === "active" && (
                        <Box
                          display="flex"
                          alignItems="flex-end"
                          sx={{
                            flexDirection: "row",
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <Tooltip title={"Edit Advertisement"}>
                              <span>
                                <IconButton
                                  aria-label="edit"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit();
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={"Delete Advetisement"}>
                              <span>
                                <IconButton
                                  aria-label="delete"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenConfirmDialog(true);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </Box>
                      )}
                  </Box>

                  {/* ad name */}
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
                      {adDetails.title}
                    </Typography>
                  </Box>

                  {/* Description*/}
                  <Typography
                    variant="h6"
                    component="p"
                    color="textSecondary"
                    style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                    mb={3}
                  >
                    {adDetails.details}
                  </Typography>

                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                    gap={4}
                    mb={3}
                  >
                    {/* info list */}
                    <List disablePadding>
                      {adInfoList.map((ad, index) => (
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
                                {ad.title.toUpperCase()}
                              </Typography>
                            </Box>

                            <Typography
                              variant={"h6"}
                              width={isMd ? "40%" : "60%"}
                              textAlign={"right"}
                            >
                              {ad.subtitle}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {adDetails.status === "active" && !isMd && (
                    <Box
                      width={"100%"}
                      display={"flex"}
                      alignItems="center"
                      justifyContent={"space-around"}
                      marginBottom={2}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        width="100%"
                        aria-label="open bid dialog"
                        sx={{ marginRight: 1, marginTop: { xs: 2, md: 1 } }}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!authUser) {
                            setOpenLoginDialog(true);
                          } else if (authUser.accountType !== "business") {
                            toast.warning(
                              "You need to have a business account"
                            );
                          } else {
                            handleOpenBidDialog();
                          }
                        }}
                      >
                        Add bid
                      </Button>
                    </Box>
                  )}

                  {/* Participants and Actions */}
                  {isLoggedIn && (
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Typography
                        variant="h5"
                        gutterBottom
                        align="center"
                        color={"secondary"}
                        fontWeight={"medium"}
                      >{`PARTICIPANTS (${participants.length})`}</Typography>
                      {participants.map((participant, index) => (
                        <Box
                          key={index}
                          display={"flex"}
                          flexDirection={"column"}
                          alignContent={"center"}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width={"100%"}
                            marginBottom={2}
                          >
                            <Typography>{`${participant.userFirstName} ${participant.userLastName}`}</Typography>
                            <Typography>£{participant.price}</Typography>
                            {/* Remove Bid button for bids made by the logged-in business */}
                            {participant.userId === userId &&
                              adDetails.status === "active" && (
                                <IconButton
                                  width="20px"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveBid(
                                      participant.advertisementBidderId
                                    )
                                  }
                                >
                                  <CancelIcon />
                                </IconButton>
                              )}
                          </Box>
                          {role === "school" &&
                            isCreator &&
                            adDetails.status.toLowerCase() !== "closed" && (
                              <Button
                                width="100%"
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                  selectWinner(
                                    participant.businessID,
                                    participant.price
                                  )
                                }
                              >
                                Select as Winner
                              </Button>
                            )}
                        </Box>
                      ))}
                    </Box>
                  )}
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
                maxHeight={"535px"}
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
                    image={image || "https://via.placeholder.com/240"}
                    maxHeight={isMd ? "435px" : "300px"}
                  />
                </Box>
                {adDetails.status === "active" && isMd && (
                  <Box
                    width={"100%"}
                    display={"flex"}
                    align="center"
                    justifyContent={"space-around"}
                    mt={2}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      width="100%"
                      sx={{ marginRight: 1, marginTop: { xs: 2, md: 1 } }}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!authUser) {
                          setOpenLoginDialog(true);
                        } else if (authUser.accountType !== "business") {
                          toast.warning("You need to have a business acount");
                        } else {
                          handleOpenBidDialog();
                        }
                      }}
                    >
                      Add bid
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>
        {/* Confirmation dialog */}
        <ConfirmDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          onConfirm={handleDeleteAd}
          title="Delete Ad"
          message={`Are you sure you want to delete "${adDetails?.title}"?`}
        />
        {/* Login Dialog */}
        <LoginDialog
          open={openLoginDialog}
          onClose={() => setOpenLoginDialog(false)}
        />

        {/* Dialog for submitting a bid */}
        <BidDialog
          open={openBidDialog}
          onClose={handleCloseBidDialog}
          submitBid={submitBid}
          bidAmount={bidAmount}
          handleBidAmountChange={handleBidAmountChange}
        />
      </Container>
    </>
  );
};

export default AdDetails;
