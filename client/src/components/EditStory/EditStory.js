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
import Container from "../../common/Container";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FormHelperText } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditStory = ({ BACKEND_URL }) => {
  const { storyId } = useParams();
  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // styling
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  // initial image
  const [initialImage, setInitialImage] = useState("");

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
  });

  const authToken = sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/success-stories/${storyId}`,
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          }
        );
        const { storyName, storyDescription, picture } = data;
        setInitialImage(picture);

        let previewPic = null;
        // set preview image
        if (picture !== null) {
          previewPic = picture?.includes("uploads")
            ? `${BACKEND_URL}/${picture}`
            : picture;

          if (previewPic?.includes("uploads")) {
            previewPic = previewPic.replace(/\\/g, "/");
          }
        }

        setImagePreview(previewPic);

        formik.setValues({
          storyName: storyName,
          storyDescription: storyDescription,
          picture: picture,
        });
      } catch (error) {
        toast.error(
          "Couldn't retrieve the story details:",
          error.response.data.message
        );
      }
    };

    fetchStoryDetails();
 
  }, [BACKEND_URL, storyId]);

  const [imagePreview, setImagePreview] = useState(null);

  // image handling
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue("picture", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const initialValues = {
    teacherId: "",
    storyName: "",
    storyDescription: "",
    picture: initialImage,
  };

  const onSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("teacherId", authUser?.userId);
    formData.append("storyName", values.storyName);
    formData.append("storyDescription", values.storyDescription);
    formData.append("wishlistItemId", values.wishlistItemId);

    // Append image if it exists
    if (values.picture && typeof values.picture === "object") {
      formData.append("picture", values.picture);
    } else {
      formData.append("picture", initialImage);
    }
    try {
      const response = await axios.put(
        `${BACKEND_URL}/success-stories/${storyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Success story updated");
        navigate("/success-stories");
      }
    } catch (error) {
      toast.error("Error updating story:", error.response.data.message);
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
    <Container
      position={"relative"}
      minHeight={"calc(100vh - 247px)"}
      display={"flex"}
      justifyContent={"center"}
      height={"100%"}
    >
      <Box maxWidth={900} width={"100%"}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ marginBottom: 2 }}
        >
          Back
        </Button>

        {/* Form header */}
        <Box marginBottom={4}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            EDIT SUCCESS STORY
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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

            {/* image upload */}
            <Grid item xs={isMd ? 6 : 12}>
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
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Box
                    xs={12}
                    md={12}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
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
                    <Box xs={12} md={6} width="100%">
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
                            marginTop: "20px",
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
              Update Story
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
export default EditStory;
