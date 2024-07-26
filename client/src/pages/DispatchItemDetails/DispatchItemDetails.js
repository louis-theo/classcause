import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Grid, Button } from "@mui/material";
import axios from "axios";
import { toast } from "sonner";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import useMediaQuery from "@mui/material/useMediaQuery";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Container from "../../common/Container";

const DispatchItemDetails = ({ BACKEND_URL }) => {
  const { itemId } = useParams();

  //   styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  const [reload, setReload] = useState(false);

  // tag colors
  const getTagColor = (status) => {
    const colors = {
      1: "green",
      0: "blue",
    };
    return colors[status] || "grey";
  };

  useEffect(() => {
    const fetchitem = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/dispatch/items/${itemId}`,
          {
            headers: {
              authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setItem(data);
      } catch (error) {
        toast.error(
          `Couldn't retrieve the item details: ${error.response.data.message}`
        );
        setItem(null);
      }
    };

    fetchitem();
  }, [BACKEND_URL, itemId, reload]);

  //   date for db
  const formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  const handleDispatchStatusChange = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/dispatch/items/${itemId}/dispatchStatus`,
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
      toast.success("Item marked dispatched");
      setReload(!reload);
    } catch (error) {
      toast.error(
        `Failed to mark the item dispatched: ${error.response.data.message}`
      );
    }
  };

  //   formatted date
  const formattedEndDate = new Date(item?.endDate).toLocaleDateString("en-GB");

  const formattedcompletionDate = item?.dispatchDate
    ? new Date(item?.endDate).toLocaleDateString("en-GB")
    : "";

  const itemInfoList = [
    {
      title: "Item Code",
      subtitle: item?.code,
    },
    {
      title: "Classroom",
      subtitle: item?.teacherName,
    },
    {
      title: "Contact email",
      subtitle: item?.email,
    },
    {
      title: "Completed on",
      subtitle: formattedEndDate,
    },
    {
      title: "shipping address",
      subtitle: item?.fullAddress,
    },
    {
      title: "amount raised",
      subtitle: `£ ${item?.currentValue}`,
    },
  ];

  return (
    <>
      <Container>
        {!item ? (
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
        ) : (
          <Box>
            <Box marginBottom={{ xs: 4, sm: 8, md: 12 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/dispatch-items")}
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
                    {/* dispatch tag */}
                    <Box
                      sx={{
                        bgcolor: getTagColor(item.isDispatched),
                        color: "common.white",
                        borderRadius: 1,
                        padding: "3px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 1,
                        width: "15%",
                        marginBottom: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: "medium",
                        }}
                        gutterBottom
                      >
                        {item.isDispatched === 0 ? "Pending" : "Sent"}
                      </Typography>
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
                              width="50%"
                            >
                              <Box
                                width={10}
                                minWidth={10}
                                height={10}
                                borderRadius={"100%"}
                                bgcolor={theme.palette.primary.main}
                                marginRight={5}
                              />
                              <Typography
                                variant={"subtitle1"}
                                color={"textSecondary"}

                                //   width="50%"
                              >
                                {item.title.toUpperCase()}
                              </Typography>
                            </Box>

                            <Typography
                              variant={"h6"}
                              width="50%"
                              textAlign="right"
                            >
                              {item.subtitle.toUpperCase()}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>

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
                      <Typography
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: "medium",
                          fontSize: 16,
                        }}
                        gutterBottom
                        color={"secondary"}
                        align={"center"}
                      >
                        Dispatched on {formattedcompletionDate}
                      </Typography>
                    )}
                  </Box>
                </Grid>
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
                  >
                    <Box
                      component={CardMedia}
                      height={"100%"}
                      width={"100%"}
                      minHeight={300}
                      image={item.image}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
};

export default DispatchItemDetails;
