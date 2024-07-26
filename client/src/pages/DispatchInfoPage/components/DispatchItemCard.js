import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const DispatchItemCard = ({
  item,
  BACKEND_URL,
  fetchPlatformItems,
  items,
  setItems,
}) => {
  const navigate = useNavigate();

  // tag colors
  const getTagColor = (status) => {
    const colors = {
      1: "green",
      0: "blue",
    };
    return colors[status] || "grey";
  };

  //   formatted date
  const formattedEndDate = new Date(item.endDate).toLocaleDateString("en-GB");

  //   date for db
  const formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  const formatedDispatchDate = item.dispatchDate
    ? new Date(item.dispatchDate).toLocaleDateString("en-GB")
    : "";

  const handleDispatchStatusChange = async () => {
    const optimisticUpdatedItems = items.map((dispatchItem) =>
      dispatchItem.wishlistItemId === item.wishlistItemId
        ? { ...dispatchItem, isDispatched: 1 }
        : dispatchItem
    );

    setItems(optimisticUpdatedItems);

    try {
      await axios.patch(
        `${BACKEND_URL}/dispatch/items/${item.wishlistItemId}/dispatchStatus`,
        {
          isDispatched: 1,
          dispatchDate: formattedDate,
        },
        {
          headers: {
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      fetchPlatformItems();
      toast.success("Item marked dispatched");
    } catch (error) {
      toast.error(
        `Failed to mark the item dispatched: ${error.response.data.message}`
      );
    }
  };

  // redirection to item details
  const handleViewDetailsClick = (wishlistItemId) => {
    navigate(`/dispatch-items/${wishlistItemId}`);
  };

  return (
    <>
      <Box
        component={Card}
        onClick={() => handleViewDetailsClick(item.wishlistItemId)}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          transition: "all .2s ease-in-out",
          width: "100%",
          minHeight: "300px",
        }}
      >
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
            src={item.image}
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
            width: { xs: "100%", md: "60%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 2,
            maxWidth: { xs: "560px", md: "260px" },
          }}
          md={{ justifyContent: "flex-end" }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
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
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                {/* tag */}
                <Box
                  sx={{
                    bgcolor: getTagColor(item.isDispatched),
                    color: "common.white",
                    borderRadius: 1,
                    padding: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: 1,
                  }}
                >
                  <Typography variant="caption">
                    {item.isDispatched === 0 ? "Pending" : "Sent"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography
              variant={"h6"}
              gutterBottom
              sx={{ fontWeight: 600 }}
              width="100%"
              marginTop={2}
            >
              {item.name}
            </Typography>

            {/* code */}
            <Typography variant={"subtitle2"} marginTop={1} marginBottom={1}>
              Classroom: {item.teacherName}
            </Typography>

            {/* end date */}
            <Box>
              {item.endDate && (
                <Typography variant={"subtitle2"}>
                  Fully funded on {formattedEndDate}
                </Typography>
              )}
            </Box>

            {/* code */}
            <Typography variant={"subtitle2"} marginTop={1} marginBottom={1}>
              Item code: {item.code}
            </Typography>
          </CardContent>

          {/* Dispatch status button or text */}
          {item.isDispatched === 0 ? (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              width="50%"
              sx={{ marginRight: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDispatchStatusChange();
              }}
            >
              Mark as dispatched
            </Button>
          ) : (
            <Typography>Dispatched on {formatedDispatchDate}</Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DispatchItemCard;
