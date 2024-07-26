import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../../App";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { toast } from "sonner";

// MUI components imports
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Container from "../../common/Container";

// icons import
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// dialogs import
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

const StoryDetails = ({ BACKEND_URL }) => {
  const { storyId } = useParams();

  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  // user variables
  const { authUser } = useContext(AuthContext);
  const userId = authUser?.userId;
  const role = authUser ? authUser.accountType : "";
  const [story, setStory] = useState(null);

  //   delete state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // fetch story details from db
  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/success-stories/${storyId}`,
          {
            headers: {
              authorization: `Bearer ${sessionStorage.getItem("a")}`,
            },
          }
        );
        setStory(data);
      } catch (error) {
        console.error("Couldn't retrieve the story details:", error);
      }
    };

    fetchStoryDetails();
  }, [BACKEND_URL, storyId]);

  //   formatted date
  const formattedCompletionDate = new Date(
    story?.wishlistItemEndDate
  ).toLocaleDateString("en-GB");

  // delete story
  const handleDeleteStory = async () => {
    setOpenConfirmDialog(false);
    if (!storyId) return;
    try {
      await axios.delete(`${BACKEND_URL}/success-stories/${storyId}`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      toast.success("Story deleted");
      navigate(-1);
    } catch (error) {
      toast.error(`Failed to delete the story: ${error.response.data.message}`);
    }
  };

  const dbPicture = story?.picture;

  // image handling
  let picture = "https://via.placeholder.com/240";

  if (dbPicture !== null) {
    picture = dbPicture?.includes("uploads")
      ? `${BACKEND_URL}/${story.picture}`
      : dbPicture;

    if (dbPicture?.includes("uploads")) {
      picture = picture.replace(/\\/g, "/");
    }
  }

  // loading state
  if (!story) {
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
        Story not found
      </Typography>
    );
  }

  let storyInfoList = [
    {
      title: "Item Name",
      subtitle: (
        <Typography
          color="primary"
          variant={"h6"}
          component={"p"}
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
            navigate(
              `/classroom/${story.teacherId}/item/${story.wishlistItemId}`
            );
          }}
        >
          {story.wishlistItemName}
        </Typography>
      ),
    },
    {
      title: "Item Code",
      subtitle: story.wishlistItemCode.toUpperCase(),
    },
    {
      title: "Classroom",
      subtitle:
        story.teacherId !== userId ? (
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
              navigate(`/profile/${story.teacherId}`);
            }}
          >
            {story.teacherName.toUpperCase()}
          </Typography>
        ) : (
          <Typography variant={"h6"} component={"p"} color="text.primary">
            MINE
          </Typography>
        ),
    },
    {
      title: "Total raised",
      subtitle: `£${story.wishlistItemCurrentValue}`,
    },

    {
      title: "Created on",
      subtitle: formattedCompletionDate,
    },
  ].filter(Boolean);

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
                <Box
                  marginBottom={4}
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={isMd ? "center" : "flex-start"}
                >
                  {/* top bit with icons and name*/}

                  {/* story name */}
                  <Box
                    component={Typography}
                    fontWeight={700}
                    variant={"h4"}
                    width={story.teacherId === userId ? "80%" : "100%"}
                  >
                    <Typography
                      color="primary"
                      variant="inherit"
                      component="span"
                    >
                      {story.storyName}
                    </Typography>
                  </Box>
                  {/* icon box */}
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      flexDirection: "row",
                    }}
                    marginTop={isMd ? 0 : 1}
                  >
                    {/*  icons for teachers and school */}
                    {(role === "teacher" || role === "school") &&
                      story.teacherId === userId && (
                        <>
                          <Tooltip title={"Edit Story"}>
                            <span>
                              <IconButton
                                aria-label="edit"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/success-stories/${story.storyId}/edit`
                                  );
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={"Delete Story"}>
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
                        </>
                      )}
                  </Box>
                </Box>

                {/* description */}
                <Typography
                  variant={"h6"}
                  component={"p"}
                  color={"textSecondary"}
                >
                  {story.description}
                </Typography>

                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  gap={4}
                >
                  {/* info list */}
                  <List disablePadding>
                    {storyInfoList.map((story, index) => (
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
                              {story.title.toUpperCase()}
                            </Typography>
                          </Box>

                          <Typography
                            variant={"h6"}
                            width={isMd ? "40%" : "60%"}
                            textAlign={"right"}
                          >
                            {story.subtitle}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
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
                    image={picture || "https://via.placeholder.com/240"}
                    maxHeight={isMd ? "435px" : "300px"}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Confirmation dialog */}
        <ConfirmDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          onConfirm={handleDeleteStory}
          title="Delete Story"
          message={`Are you sure you want to delete "${story.storyName}"?`}
        />
      </Container>
    </>
  );
};

export default StoryDetails;
