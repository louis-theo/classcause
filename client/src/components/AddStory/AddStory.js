import axios from "axios";
import { toast } from "sonner";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../App";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import Button from "@mui/material/Button";
import * as yup from "yup";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Container from "../../common/Container";
import { FormHelperText } from "@mui/material";

const AddStory = ({ BACKEND_URL }) => {
  const { authUser } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const { itemId } = useParams();

  const navigate = useNavigate();

  const validationSchema = yup.object({
    storyName: yup
      .string("Enter the story name")
      .required("Story name is required."),

    storyDescription: yup
      .string("Enter the story description")
      .required("Story description is required."),

    picture: yup
      .string("Upload the picture")
      .required("Picture URL is required."),

    wishlistItemId: yup
      .string("Select a wishlist item")
      .required("Wishlist item is required."),
  });

  // fetch wishlist items for story
  useEffect(() => {
    const fetchWishlistItems = async () => {
      const teacherId = authUser ? authUser.userId : null;

      if (!teacherId) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/wishlists/eligible-for-story?teacherId=${teacherId}`,
          {
            headers: {
              authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setWishlistItems(data);
      } catch (error) {
        toast.error("Error fetching eligible wishlist items:", error);
      }
    };

    if (
      authUser &&
      (authUser.accountType === "teacher" || authUser.accountType === "admin")
    ) {
      fetchWishlistItems();
    }
  }, [BACKEND_URL, authUser]);

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue("picture", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const initialValues = {
    teacherId: "",
    storyName: "",
    storyDescription: "",
    wishlistItemId: itemId ? itemId : "",
    picture: null,
  };

  const onSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("teacherId", authUser?.userId);
    formData.append("storyName", values.storyName);
    formData.append("storyDescription", values.storyDescription);
    formData.append("wishlistItemId", values.wishlistItemId);

    // Append image if it exists
    if (values.picture) {
      formData.append("picture", values.picture);
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/success-stories/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Success story created");
        navigate("/success-stories");
      }
    } catch (error) {
      toast.error("Error creating story:", error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return (
    <Container>
      <Box sx={{ maxWidth: "lg", mx: "auto", px: 2 }}>
        <Box marginBottom={4}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Create a New Story
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                    Wishlist item
                  </Typography>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.wishlistItemId &&
                      Boolean(formik.errors.wishlistItemId)
                    }
                  >
                    <InputLabel id="wishlist-item-label">
                      Wishlist Item
                    </InputLabel>
                    <Select
                      labelId="wishlist-item-label"
                      id="wishlistItemId"
                      name="wishlistItemId"
                      value={formik.values.wishlistItemId}
                      label="Wishlist Item"
                      onChange={formik.handleChange}
                      error={
                        formik.touched.wishlistItemId &&
                        Boolean(formik.errors.wishlistItemId)
                      }
                    >
                      {wishlistItems.map((item) => (
                        <MenuItem
                          key={item.wishlistItemId}
                          value={item.wishlistItemId}
                        >
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.wishlistItemId &&
                      formik.errors.wishlistItemId && (
                        <FormHelperText error>
                          {formik.errors.wishlistItemId}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                    Story Name
                  </Typography>
                  <TextField
                    label="Story name *"
                    variant="outlined"
                    name={"storyName"}
                    fullWidth
                    value={formik.values.storyName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.storyName &&
                      Boolean(formik.errors.storyName)
                    }
                    helperText={
                      formik.touched.storyName && formik.errors.storyName
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                    Story Description
                  </Typography>
                  <TextField
                    label="Story description *"
                    variant="outlined"
                    name={"storyDescription"}
                    multiline
                    rows={5}
                    fullWidth
                    value={formik.values.storyDescription}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.storyDescription &&
                      Boolean(formik.errors.storyDescription)
                    }
                    helperText={
                      formik.touched.storyDescription &&
                      formik.errors.storyDescription
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* picture Upload */}
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width={"100%"}
                maxWidth={1000}
                margin={"0 auto"}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Box
                    xs={12}
                    md={6}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="50%"
                  >
                    <Box>
                      <Typography variant={"subtitle2"}>
                        Image Upload
                      </Typography>
                    </Box>
                    <Box>
                      <input
                        accept="image/*"
                        id="image-upload"
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                        error={formik.touched.picture && formik.errors.picture}
                      />
                      <label htmlFor="image-upload">
                        <Button
                          component="span"
                          size={"medium"}
                          variant={"contained"}
                        >
                          Upload
                        </Button>
                      </label>
                    </Box>
                    {formik.touched.picture &&
                      Boolean(formik.errors.picture) && (
                        <FormHelperText error>
                          {formik.errors.picture}
                        </FormHelperText>
                      )}
                  </Box>

                  {imagePreview && (
                    <Box xs={12} md={6} width="50%">
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        marginTop={2}
                      >
                        <img
                          src={imagePreview}
                          alt="Uploaded"
                          style={{
                            maxWidth: "250px",
                            marginTop: "10px",
                          }}
                        />
                        <Typography variant={"body2"}>
                          {formik.values.picture.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 5,
              mb: 10,
            }}
          >
            <Button
              variant="outlined"
              sx={{ mr: 5 }}
              onClick={() => navigate("/success-stories")}
            >
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Add
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default AddStory;
