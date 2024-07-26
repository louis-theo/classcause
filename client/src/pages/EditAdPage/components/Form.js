import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../App";
import axios from "axios";
import { toast } from "sonner";

// styling
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// form
import { useFormik } from "formik";
import * as yup from "yup";
import { FormHelperText } from "@mui/material";

// MUI components
import { Box, TextField, Button, Grid, Typography } from "@mui/material";
import Container from "../../../common/Container";

// icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const validationSchema = yup.object({
  title: yup.string("Enter the title").required("Title is required."),
  details: yup.string("Enter the details").required("Details are required."),
  startingPrice: yup
    .number("Enter the starting price")
    .positive("The price must be a positive number.")
    .required("Starting price is required."),
  image: yup.string("Upload the picture").required("Picture URL is required."),
});
const EditAd = () => {
  const { authUser, BACKEND_URL } = useContext(AuthContext);
  const { advertisementId } = useParams();
  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [initialImage, setInitialImage] = useState("");

  // initial form values
  const initialValues = {
    title: "",
    details: "",
    startingPrice: "",
    image: initialImage || "",
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  // fetch ad details to prepopulate values
  const fetchAdDetails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/advertisement/${advertisementId}/details`
      );
      setInitialImage(data.advertisement.image);

      const dbImage = data.advertisement.image;

      let previewPic = null;
      // set preview image
      if (dbImage !== null) {
        previewPic = dbImage?.includes("uploads")
          ? `${BACKEND_URL}/${dbImage}`
          : dbImage;

        if (previewPic?.includes("uploads")) {
          previewPic = previewPic.replace(/\\/g, "/");
        }
      }
      setImagePreview(previewPic);

      let initialValues = {
        title: data.advertisement.title || "",
        details: data.advertisement.details || "",
        startingPrice: data.advertisement.startingPrice || null,
        image: data.advertisement.image,
      };

      formik.setValues(initialValues);
    } catch (error) {
      toast.error(
        "Couldn't retrieve the advertisement details:",
        error.response.data.message
      );
    }
  };

  useEffect(() => {
    fetchAdDetails();
 
  }, [advertisementId]);

  const onSubmit = async (values) => {
    const formData = new FormData();

    // Append fields to formData
    formData.append("title", values.title);
    formData.append("details", values.details);
    formData.append("startingPrice", values.startingPrice);

    // Append image if it exists
    if (values.image && typeof values.image === "object") {
      formData.append("image", values.image);
    } else {
      formData.append("image", initialImage);
    }
    try {
      const response = await axios.put(
        `${BACKEND_URL}/advertisement/${advertisementId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Advertisement updated");
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (error) {
      toast.error("Error updating advertisement:", error.response.data.message);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return authUser ? (
    <>
      {" "}
      <Container
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        display={"flex"}
        justifyContent={"center"}
        height={"100%"}
      >
        <Box width="100%">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ marginBottom: 2 }}
          >
            Back
          </Button>

          <Box marginBottom={4}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
              textTransform={"uppercase"}
              fontSize={!isMd && "1.75rem"}
            >
              Edit Advertisement
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Title *"
                  variant="outlined"
                  name="title"
                  fullWidth
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label=""
                  variant="outlined"
                  name="startingPrice"
                  type="number"
                  fullWidth
                  value={formik.values.startingPrice}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.startingPrice &&
                    Boolean(formik.errors.startingPrice)
                  }
                  helperText={
                    formik.touched.startingPrice && formik.errors.startingPrice
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Details *"
                  variant="outlined"
                  name="details"
                  multiline
                  rows={4}
                  fullWidth
                  value={formik.values.details}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.details && Boolean(formik.errors.details)
                  }
                  helperText={formik.touched.details && formik.errors.details}
                />
              </Grid>

              {/* image upload */}
              <Grid
                item
                xs={12}
                sx={{ display: "flex", flexDirection: isMd ? "row" : "column" }}
              >
                <Box
                  xs={12}
                  md={6}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width={isMd ? "50%" : "100%"}
                >
                  <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                    Image Upload
                  </Typography>
                  <input
                    accept="image/*"
                    id="image-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Button component="span" size="medium" variant="contained">
                      Upload Image
                    </Button>
                  </label>
                  {formik.touched.image && Boolean(formik.errors.image) && (
                    <FormHelperText error>{formik.errors.image}</FormHelperText>
                  )}
                </Box>
                {imagePreview && (
                  <Box xs={12} md={6} width={isMd ? "50%" : "100%"}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      marginTop={2}
                    >
                      <img
                        src={imagePreview}
                        alt="Upload"
                        style={{
                          maxWidth: "250px",
                          marginTop: "10px",
                        }}
                      />
                      <Typography variant={"body2"}>
                        {formik.values.image.name}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <Button
                    variant="outlined"
                    sx={{ mr: 2 }}
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Save changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </>
  ) : (
    <p>Loading...</p>
  );
};

export default EditAd;
