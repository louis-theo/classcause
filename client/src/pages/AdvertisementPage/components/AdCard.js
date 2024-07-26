import React, { useContext, useState } from "react";
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
import LoginDialog from "../../../components/LoginDialog/LoginDialog";

const AdCard = ({ ad, handleOpenConfirmDialog }) => {
  const navigate = useNavigate();

  // user variables
  const { authUser, BACKEND_URL } = useContext(AuthContext);

  //   conditional rendering
  const canModifyAd = (AdCreatorId) => {
    return (
      authUser &&
      (authUser.accountType === "admin" || authUser.userId === AdCreatorId)
    );
  };

  // tag colors
  const getTagColor = (status) => {
    const colors = {
      active: "green",
      closed: "red",
    };
    return colors[status] || "grey";
  };

  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  //   formatted
  const formatedCreationDate = new Date(ad.creationDate).toLocaleDateString(
    "en-GB"
  );

  // image handling
  let image = ad?.image?.includes("uploads")
    ? `${BACKEND_URL}/${ad.image}`
    : ad?.image;

  if (image && ad?.image.includes("uploads")) {
    image = image.replace(/\\/g, "/");
  }
  return (
    <>
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
          navigate(`/advertisement/${ad.advertisementId}`);
        }}
      >
        {/* image */}
        <CardMedia
          component="img"
          image={image || "https://via.placeholder.com/240"}
          alt={ad.title}
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
              bgcolor: getTagColor(ad.status),
              color: "common.white",
              borderRadius: 1,
              padding: "2px 8px",
              display: "flex",
              alignItems: "center",
              marginRight: 1,
              width: "25%",
            }}
          >
            <Typography
              variant="caption"
              margin={0}
              textTransform={"uppercase"}
            >
              {ad.status}
            </Typography>
          </Box>
          <Box
            sx={{
              marginBottom: 2,
              borderBottom: 1,
              borderColor: "divider",
              minHeight: "145px",
            }}
          >
            {/* name */}
            <Typography
              variant="h5"
              gutterBottom
              marginTop={2}
              fontWeight={600}
            >
              {ad.title}
            </Typography>

            {/* description */}
            <Typography marginBottom={2} variant="body2" color="textSecondary">
              {ad.details}
            </Typography>
          </Box>

          {/* info */}

          {/* creation date */}
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
              Created on
            </Typography>
            <Typography
              color="textSecondary"
              variant="subtitle2"
              textTransform={"uppercase"}
            >
              {formatedCreationDate}
            </Typography>
          </Box>

          {/* school name */}
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
              By
            </Typography>
            <Typography
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
                navigate(`/profile/${ad.schoolId}`);
              }}
              variant="subtitle2"
              textTransform={"uppercase"}
            >
              {ad.schoolName}
            </Typography>
          </Box>

          {/* starting price */}
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
              Starting Price
            </Typography>
            <Typography
              color="textSecondary"
              variant="subtitle2"
              textTransform={"uppercase"}
            >
              £{ad.startingPrice}
            </Typography>
          </Box>

          {/* number of bidders */}
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
              Bidders
            </Typography>
            <Typography
              color="textSecondary"
              variant="subtitle2"
              textTransform={"uppercase"}
            >
              {ad.biddersCount}
            </Typography>
          </Box>

          {/* highset bidder*/}
          {canModifyAd && (
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
                Highest Bidder
              </Typography>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                textTransform={"uppercase"}
              >
                {ad.highestBidderFirstName
                  ? `${ad.highestBidderFirstName} ${ad.highestBidderLastName}`
                  : "N/A"}
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/advertisement/${ad.advertisementId}`);
            }}
          >
            View
          </Button>

          {canModifyAd(ad.schoolId) && (
            <>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/advertisement/${ad.advertisementId}/edit`);
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfirmDialog(ad.advertisementId, ad.title);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </CardActions>
      </Card>
      {/* Login Dialog */}
      <LoginDialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
      />
    </>
  );
};

export default AdCard;
