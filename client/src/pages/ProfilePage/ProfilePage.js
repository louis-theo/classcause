import React, { useContext, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import { toast } from "sonner";

// MUI components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Container from "../../common/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton, List, ListItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

// components
import DeleteProfileDialog from "./components/DeleteProfileDialog";

const ProfilePage = ({ BACKEND_URL }) => {
  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  // user data
  const { authUser, handleLogout } = useContext(AuthContext);
  const { profileId } = useParams();
  const userId = authUser?.userId;
  const [profileData, setProfileData] = useState(null);

  //  dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customDialogMessage, setCustomDialogMessage] = useState("");

  const navigate = useNavigate();

  // fetching user data
  useEffect(() => {
    // fetch function
    const fetchProfile = async (userId) => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/users/profile/${userId}`
        );

        if (
          authUser?.accountType !== "admin" &&
          data?.accountType === "admin"
        ) {
          navigate("/not-found");
        } else {
          setProfileData(data);
        }
      } catch (error) {
        return error;
      }
    };

    if (profileId) {
      fetchProfile(profileId);
    } else if (!profileId || profileId === authUser?.userId) {
      setProfileData(authUser);
    }
  }, [userId, authUser, profileId]);

  // // restrict access to admin profiles
  useEffect(() => {
    if (
      authUser?.accountType !== "admin" &&
      profileData?.accountType === "admin"
    ) {
      navigate("/not-found");
    }
  }, [authUser, navigate, profileData]);

  // withdraw money operation with Stripe
  const handleWithdraw = async () => {
    // Check if the teacher has a Stripe Connect account linked
    const stripeAccountId = profileData.stripeAccountId;
    sessionStorage.setItem("email", authUser.email);

    // If no Stripe Connect account is linked, initiate the onboarding process
    if (!stripeAccountId) {
      try {
        // API call to backend to generate Stripe onboarding link
        const response = await axios.post(`${BACKEND_URL}/api/onboarding`, {
          email: profileData.email, // Ensure this correctly references the teacher's email
        });

        // Redirect to Stripe's onboarding flow
        window.location.href = response.data.url;
      } catch (error) {
        console.error("Failed to get Stripe onboarding link:", error);
        alert("Failed to initiate Stripe onboarding. Please try again.");
      }
      return; // Return here to stop execution if no Stripe account is linked
    }

    // If a Stripe Connect account is linked, proceed with the withdrawal process
    try {
      // Call the new server endpoint to process the withdrawal
      await axios.post(`${BACKEND_URL}/api/withdraw-funds`, {
        userId: authUser?.userId,
      });

      // Redirect to the payout success page
      navigate("/payout-success");
    } catch (error) {
      setShowCustomDialog(true);
      console.log("Insufficient funds in Stripe account");
      setCustomDialogMessage(
        "You don't have any funds to withdraw in your Stripe connect account. Add a wishlist to your classroom to start fundraising!"
      );
    }
  };

  // deleting user
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${BACKEND_URL}/users/profile`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (response.data?.message) {
        toast.success("Profile deleted");
        handleLogout();
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      toast.error(`Error deleting profile: ${error.response?.data?.message}`);
      setCustomDialogMessage(
        error.response?.data?.message ||
          "An error occurred while trying to delete your profile."
      );
      setShowCustomDialog(true);
    }
    setIsLoading(false);
  };

  // Loading state
  if (!profileData) {
    return <div>Loading...</div>;
  }

  // image handling
  let avatar = profileData?.avatar?.includes("uploads")
    ? `${BACKEND_URL}/${profileData.avatar}`
    : profileData?.avatar;
  if (profileData?.avatar.includes("uploads")) {
    avatar = avatar.replace(/\\/g, "/");
  }

  // conditional info to display
  const loggedInUserRole = authUser?.accountType;
  const isAccountOwner =
    (profileId && parseInt(profileId) === authUser?.userId) ||
    (authUser && !profileId);

  let profileList = [];

  // general for everyone to see for scgools and teachers
  if (
    (profileData.accountType === "school" ||
      profileData.accountType === "teacher") &&
    (!loggedInUserRole ||
      loggedInUserRole === "parent" ||
      loggedInUserRole === "business") &&
    !isAccountOwner
  ) {
    profileList.push(
      { title: "Group Name", subtitle: profileData.groupName },
      { title: "School", subtitle: profileData.school ?? "Not Provided" },
      {
        title: "Postcode",
        subtitle: `${profileData.postcode?.substring(0, 3)}***`,
      }
    );
  }

  if (loggedInUserRole === "admin" || isAccountOwner) {
    // Details that only the admin or the account owner should see
    profileList.push(
      { title: "Mobile Number", subtitle: profileData.mobileNum },
      { title: "Email", subtitle: profileData.email }
    );

    if (
      loggedInUserRole === "teacher" ||
      loggedInUserRole === "school" ||
      loggedInUserRole === "admin"
    ) {
      profileList.push(
        { title: "Street", subtitle: profileData.street },
        { title: "City", subtitle: profileData.city },
        { title: "Postcode", subtitle: profileData.postcode }
      );
    }
  }

  return (
    <>
      <Box
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        display={"flex"}
        alignItems={"space-between"}
        justifyContent={"space-between"}
        height={"100%"}
        marginTop={2}
      >
        <Container maxWidth={1024}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ marginBottom: 2 }}
          >
            Back
          </Button>
          <Box>
            {/* page title and buttons */}
            {(profileId && parseInt(profileId) === authUser?.userId) ||
            (authUser && !profileId) ? (
              <>
                <Box>
                  <Grid
                    container
                    direction={{ xs: "row", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    marginBottom={5}
                  >
                    <Box
                      xs={12}
                      sm={8}
                      display="flex"
                      flexDirection={"row"}
                      width={!isMd ? "100%" : "50%"}
                      justifyContent="space-between"
                    >
                      <Typography
                        variant={isMd ? "h4" : "h5"}
                        sx={{ fontWeight: 700 }}
                      >
                        MY ACCOUNT
                      </Typography>
                      {!isMd && (
                        <IconButton
                          aria-label="edit"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/edit`);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {isMd &&
                      authUser &&
                      (parseInt(profileId) === authUser?.userId ||
                        !profileId) && (
                        <Grid item xs={12} sm={4}>
                          <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "stretched", sm: "flex-start" }}
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              size="large"
                              fullWidth
                              sx={{ marginBottom: { xs: 1, sm: 0 } }}
                              onClick={() => {
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              fullWidth
                              sx={{ marginLeft: { sm: 2 } }}
                              onClick={() => {
                                navigate("/profile/edit");
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Grid>
                      )}
                  </Grid>
                </Box>
              </>
            ) : (
              ""
            )}

            {/* styled content */}
            <Grid container spacing={4}>
              <Grid
                item
                container
                justifyContent="center"
                alignItems="center"
                xs={12}
                md={6}
                data-aos={isMd ? "fade-right" : "fade-up"}
                marginBottom={4}
              >
                {/* avatar image */}
                <Box
                  component={"img"}
                  maxWidth={isMd ? 500 : 300}
                  maxHeight={isMd ? 500 : 300}
                  minHeight={isMd ? 400 : 300}
                  width={"100%"}
                  height={"100%"}
                  src={avatar}
                  boxShadow={4}
                  data-aos={"fade-up"}
                  sx={{
                    objectFit: "cover",
                  }}
                />
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  width={"70%"}
                >
                  {" "}
                  {/* button to withdraw funds */}
                  {authUser &&
                    (parseInt(profileId) === authUser?.userId || !profileId) &&
                    (authUser.accountType === "teacher" ||
                      authUser.accountType === "school") && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        width="50%"
                        sx={{ marginTop: { xs: 2, md: 3 } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw();
                        }}
                      >
                        Withdraw funds
                      </Button>
                    )}
                  {/* links to the classroom and ads */}
                  {(profileData.accountType === "teacher" ||
                    profileData.accountType === "school") && (
                    // link to wishlist items for everyone
                    <Button
                      onClick={() =>
                        navigate(`/classroom/${profileData.userId}`)
                      }
                      sx={{ marginBottom: 2, marginTop: 2 }}
                    >
                      See all items
                    </Button>
                  )}
                  {profileData.accountType === "school" && (
                    <Button
                      onClick={() =>
                        navigate(`/advertisement/${profileData.userId}`)
                      }
                      sx={{ marginBottom: 2 }}
                    >
                      See ad opportunities
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                data-aos={isMd ? "fade-left" : "fade-up"}
              >
                <Box marginBottom={4}>
                  {/* role */}
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: "medium",
                    }}
                    gutterBottom
                    color={"secondary"}
                  >
                    {profileData.accountType}
                  </Typography>

                  {/* name */}
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
                      {profileData.userFirstName} {profileData.userLastName}
                    </Typography>
                  </Box>

                  {profileData.bio && (
                    <Typography
                      variant={"h6"}
                      component={"p"}
                      color={"textSecondary"}
                    >
                      {profileData.bio}
                    </Typography>
                  )}

                  {/* info list */}
                  <List disablePadding>
                    {profileList.map((item, index) => (
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
                            width={isMd ? "60%" : "50%"}
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
                              width="100%"
                              fontSize={!isMd && "0.8rem"}
                            >
                              {item.title.toUpperCase()}
                            </Typography>
                          </Box>

                          <Typography
                            variant={"h6"}
                            width="100%"
                            fontSize={!isMd && "0.8rem"}
                            textAlign={"right"}
                          >
                            {item.subtitle.toUpperCase()}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* delete buttom for mobile view */}
                {!isMd &&
                  authUser &&
                  (parseInt(profileId) === authUser?.userId || !profileId) && (
                    <Grid item xs={12} sm={4}>
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "stretched", sm: "flex-start" }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="large"
                          fullWidth
                          sx={{ marginBottom: { xs: 1, sm: 0 } }}
                          onClick={() => {
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Grid>
                  )}
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      <DeleteProfileDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        isLoading={isLoading}
        handleDeleteProfile={handleDelete}
      />

      <Dialog
        open={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
      >
        <DialogTitle>Notice</DialogTitle>
        <DialogContent>
          <DialogContentText>{customDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDialog(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePage;
