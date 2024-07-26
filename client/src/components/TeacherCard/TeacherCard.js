import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import { toast } from "sonner";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import { CardMedia, Tooltip } from "@mui/material";

// Icon import
import StarIcon from "@mui/icons-material/Star";

// Component import
import LoginDialog from "../LoginDialog/LoginDialog";

const TeacherCard = ({ teacher, BACKEND_URL, setReload }) => {
  const navigate = useNavigate();

  // tag colors
  const getTagColor = (status) => {
    const colors = {
      teacher: "red",
      school: "blue",
    };
    return colors[status] || "grey";
  };

  // user variables
  const { authUser, setReloadAuthUser } = useContext(AuthContext);
  const userId = authUser?.userId;
  const role = authUser ? authUser.accountType : "";

  // favourites state
  const [isFavorited, setIsFavorited] = useState(
    authUser?.favoriteClassrooms?.includes(teacher.userId) || false
  );

  // redirection to classroom
  const handleViewDetailsClick = (teacherId) => {
    navigate(`/classroom/${teacherId}`);
  };

  //   Save classroom functionality
  const handleToggleFavorite = async () => {
    if (!userId) {
      setOpenLoginDialog(true);
      return;
    }

    const method = isFavorited ? "delete" : "post";
    const url = `${BACKEND_URL}/favourites/${
      isFavorited
        ? `delete/users/${userId}/classroom/${teacher.userId}`
        : "save/classroom"
    }`;

    try {
      const response = await axios({
        method,
        url,
        data: {
          userId,
          classroomId: teacher.userId,
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

  // image handling
  let avatar = teacher?.avatar.includes("uploads")
    ? `${BACKEND_URL}/${teacher.avatar}`
    : teacher?.avatar;
  if (teacher?.avatar.includes("uploads")) {
    avatar = avatar.replace(/\\/g, "/");
  }

  //   pop up logic states
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  return (
    <>
      <Card
        component={Card}
        onClick={() => handleViewDetailsClick(teacher.userId)}
        sx={{
          display: "flex",
          transition: "all .2s ease-in-out",
          flexDirection: "column",
          width: "100%",
          minHeight: { xs: "450px", md: "250px" },
          maxWidth: { xs: 485 },
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          alignItems: "center",
        }}
        bgcolor={"transparent"}
      >
        <Box
          component={CardMedia}
          borderRadius={2}
          width={"100%"}
          height={"100%"}
          minHeight={320}
          image={avatar}
        />

        <Box
          sx={{
            width: { xs: "100%", md: "100%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            maxWidth: { xs: "260px", md: "330px" },
          }}
          md={{ justifyContent: "flex-end" }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box
              marginTop={0}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ width: "100%", paddingRight: 0 }}
            >
              {/* top bit */}
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                {/* tag */}
                <Box
                  sx={{
                    bgcolor: getTagColor(teacher.accountType),
                    color: "common.white",
                    borderRadius: 1,
                    padding: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: 1,
                  }}
                >
                  <Typography variant="caption">
                    {teacher.accountType}
                  </Typography>
                </Box>

                {/* icon box */}
                <Box
                  display="flex"
                  alignItems="flex-end"
                  sx={{
                    flexDirection: {
                      md: "row",
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
                  </Box>
                </Box>
              </Box>

              <Box width={"100%"}>
                {/* teacher name */}
                <Typography
                  variant="h5"
                  gutterBottom
                  marginTop={2}
                  fontWeight={600}
                >
                  {teacher.name}
                </Typography>

                {/* postcode */}
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  width="100%"
                  marginTop={1.5}
                  marginBottom={1.5}
                >
                  <Typography
                    color="textSecondary"
                    variant="subtitle2"
                    textTransform={"uppercase"}
                  >
                    Postcode:
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle2">
                    {teacher.postcode.split(" ")[0].toUpperCase()}
                  </Typography>
                </Box>

                {/* school name */}
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  width="100%"
                  marginTop={1.5}
                  marginBottom={1.5}
                >
                  <Typography
                    color="textSecondary"
                    variant="subtitle2"
                    textTransform={"uppercase"}
                  >
                    school:
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle2">
                    {teacher.school?.toUpperCase()}
                  </Typography>
                </Box>

                {/* stats about items */}
                <Typography
                  textAlign="center"
                  variant="h6"
                  sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    borderTop: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                  textTransform={"uppercase"}
                  color={"secondary"}
                  fontWeight={500}
                >
                  Wishlist Items
                </Typography>

                {/* boxed grid */}
                <Grid
                  container
                  spacing={1}
                  sx={{
                    margin: 0,
                    justifyContent: "space-around",
                    alignItems: "flex-end",
                  }}
                >
                  {/* active items */}
                  <Grid
                    item
                    xs={2}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    width={"30%"}
                  >
                    <Typography
                      variant="h5"
                      align="center"
                      textTransform={"bold"}
                      color={"primary"}
                    >
                      {teacher.activeItems}
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      textTransform={"uppercase"}
                    >
                      Active
                    </Typography>
                  </Grid>

                  {/* completed */}
                  <Grid
                    item
                    xs={4}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      align="center"
                      textTransform={"bold"}
                      color={"primary"}
                    >
                      {teacher.completedItems}
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      textTransform={"uppercase"}
                      width={"100%"}
                    >
                      completed
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
      {/* Login Dialog */}
      <LoginDialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
      />
    </>
  );
};

export default TeacherCard;
