import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../App";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CardMedia,
} from "@mui/material";

const SuccessStoryCard = ({ story, handleOpenConfirmDialog }) => {
  const navigate = useNavigate();

  //   date format
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Unknown date";
  };

  // user variables
  const { authUser, BACKEND_URL } = useContext(AuthContext);

  //   conditional rendering
  const canModifyStory = (storyCreatorId) => {
    return (
      authUser &&
      (authUser.accountType === "admin" || authUser.userId === storyCreatorId)
    );
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

  return (
    <Card
      sx={{
        display: "flex",
        transition: "all .2s ease-in-out",
        flexDirection: "column",
        width: "100%",
        minHeight: { xs: "450px", md: "630px" },
        maxWidth: { xs: 485 },
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        alignItems: "center",
      }}
      bgcolor={"transparent"}
      onClick={() => {
        navigate(`/success-stories/${story.storyId}`);
      }}
    >
      <CardMedia
        component="img"
        image={picture}
        alt={story.storyName}
        width={"100%"}
        height={"240px"}
      />

      <CardContent
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: "100%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          maxWidth: { xs: "245px", md: "300px" },
          height: "100%",
        }}
        md={{ justifyContent: "flex-end" }}
      >
        <Box
          sx={{
            marginBottom: 2,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: "145px",
          }}
        >
          {/* name */}
          <Typography variant="h5" gutterBottom marginTop={2} fontWeight={600}>
            {story.storyName}
          </Typography>

          {/* description */}
          <Typography marginBottom={2} variant="body2" color="textSecondary">
            {story.storyDescription}
          </Typography>
        </Box>

        {/* wishlist */}
        {story.wishlistItemName && (
          <>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              width="100%"
              marginTop={1}
              marginBottom={1}
            >
              <Typography
                color="textSecondary"
                variant="subtitle2"
                textTransform={"uppercase"}
              >
                Item
              </Typography>
              <Typography
                color="primary"
                variant="subtitle2"
                textTransform={"uppercase"}
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
                    `/classroom/${story.wishlistItem.teacherId}/item/${story.wishlistItemId}`
                  );
                }}
              >
                {story.wishlistItemName}
              </Typography>
            </Box>
            {/* code */}
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              width="100%"
              marginTop={1}
              marginBottom={1}
            >
              <Typography
                color="textSecondary"
                variant="subtitle2"
                textTransform={"uppercase"}
              >
                Item code
              </Typography>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                textTransform={"uppercase"}
              >
                {story.wishlistItemCode}
              </Typography>
            </Box>
          </>
        )}
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width="100%"
          marginTop={1}
          marginBottom={1}
        >
          <Typography
            color="textSecondary"
            variant="subtitle2"
            textTransform={"uppercase"}
          >
            Total raised
          </Typography>
          <Typography
            color="textSecondary"
            variant="subtitle2"
            textTransform={"uppercase"}
          >
            £{story.wishlistItemCurrentValue}
          </Typography>
        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width="100%"
          marginTop={1}
          marginBottom={1}
        >
          <Typography
            color="textSecondary"
            variant="subtitle2"
            textTransform={"uppercase"}
          >
            Completion date
          </Typography>
          <Typography
            color="textSecondary"
            variant="subtitle2"
            textTransform={"uppercase"}
          >
            {parseDate(story.wishlistItemEndDate)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={() => navigate(`/success-stories/${story.storyId}`)}
        >
          View
        </Button>
        {canModifyStory(story.creatorId) && (
          <>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/success-stories/${story.storyId}/edit`);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConfirmDialog(story.storyId, story.storyName);
              }}
            >
              Delete
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default SuccessStoryCard;
