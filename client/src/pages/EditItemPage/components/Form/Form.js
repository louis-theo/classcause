import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../../App";
import axios from "axios";
import { toast } from "sonner";

// form
import { format } from "date-fns";
import { useFormik } from "formik";
import * as yup from "yup";
import { FormHelperText } from "@mui/material";

// MUI components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

// icon import
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// component import
import DonationNoti from "../../../../components/Notification/DonationNoti";

const Form = ({ BACKEND_URL }) => {
  // user variables
  const { authUser } = useContext(AuthContext);
  const role = authUser && authUser.accountType;
  const { itemId } = useParams();

  const navigate = useNavigate();

  const [initialImage, setInitialImage] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [originalStatus, setOriginalStatus] = useState("");
  const [OriginalParentId, setOriginalParentId] = useState("");

  // form error handling
  const validationSchema = yup.object({
    itemName: yup
      .string("Enter the item name")
      .required("Item name is required."),
    target: yup
      .number("Enter the target amount")
      .positive("The target must be a positive number.")
      .integer("The target must be an integer.")
      .when("$role", (role, schema) => {
        return authUser?.accountType === "teacher" ||
          authUser?.accountType === "school"
          ? schema.required("Target to raise is required.").min(currentValue)
          : schema;
      }),
    itemDescription: yup
      .string("Enter the item description")
      .required("Item description is required."),
    deadline: yup
      .date("Enter the deadline")
      .min(new Date(), "Deadline cannot be in the past.")
      .when("$role", (role, schema) => {
        return authUser?.accountType === "teacher" ||
          authUser?.accountType === "school"
          ? schema.required("Deadline is required.")
          : schema;
      }),
    link: yup.string("Enter the link to the item"),
    image: yup
      .string("Upload the picture")
      .required("Picture URL is required."),
  });

  // fetch item to prepopulate the fields
  useEffect(() => {
    const fetchwishlistItem = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/wishlists/item/${itemId}`,
          {
            headers: {
              authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        const {
          teacherId,
          parentId,
          name,
          goalValue,
          description,
          deadline,
          platformFulfillment,
          status,
          link,
          image,
          currentValue,
        } = data;

        const parsedDeadline = deadline ? new Date(deadline) : new Date();
        setInitialImage(image);
        setCurrentValue(currentValue);
        setOriginalStatus(data.status);
        setOriginalParentId(data.parentId);

        // Format the parsed date using date-fns
        const formattedDeadline = format(parsedDeadline, "yyyy-MM-dd");
        const fulfilmentChoice =
          platformFulfillment === 1 ? "company" : "myself";

        let previewPic = null;
        // set preview image
        if (image !== null) {
          previewPic = image?.includes("uploads")
            ? `${BACKEND_URL}/${image}`
            : image;

          if (previewPic?.includes("uploads")) {
            previewPic = previewPic.replace(/\\/g, "/");
          }
        }

        setImagePreview(previewPic);

        formik.setValues({
          parentId: parentId ? parentId : "",
          teacherId: teacherId,
          itemName: name,
          target: goalValue || "",
          itemDescription: description,
          link: link || "",
          deadline: formattedDeadline,
          fulfilmentChoice: fulfilmentChoice || "company",
          image: image,
          status: status,
        });
      } catch (error) {
        toast.error(
          "Couldn't retrieve wishlist item details:",
          error.response.data.message
        );
      }
    };

    fetchwishlistItem();
  }, [BACKEND_URL, itemId]);

  const [imagePreview, setImagePreview] = useState(null);

  // image handling
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const initialValues = {
    parentId: "",
    teacherId: "",
    itemName: "",
    target: "",
    itemDescription: "",
    link: "",
    deadline: "",
    fulfilmentChoice: "company",
    image: initialImage,
  };

  // submit handling
  const onSubmit = async (values) => {
    try {
      const {
        itemName,
        target,
        itemDescription,
        link,
        deadline,
        fulfilmentChoice,
      } = values;

      const status =
        role === "teacher" || role === "school" ? "active" : "suggestion";

      const platformFulfillment = fulfilmentChoice === "company" ? 1 : 0;

      // Format the deadline date into MySQL format
      const formattedDeadline = deadline
        ? new Date(deadline).toISOString().slice(0, 19).replace("T", " ")
        : null;

      const formData = new FormData();

      // If status is 'suggestion', only include basic fields
      if (status === "suggestion") {
        // Append fields to formData
        formData.append("name", itemName);
        formData.append("description", itemDescription);
        formData.append("status", status);
        formData.append("link", link);

        // Append image if it exists
        if (values.image && typeof values.image === "object") {
          formData.append("image", values.image);
        } else {
          formData.append("image", initialImage);
        }
      } else {
        // teacher or school
        formData.append("goalValue", target);
        formData.append("name", itemName);
        formData.append("description", itemDescription);
        formData.append("status", status);
        formData.append("link", link);
        formData.append("deadline", formattedDeadline);
        formData.append("platformFulfillment", platformFulfillment);

        if (values.image && typeof values.image === "object") {
          formData.append("image", values.image);
        } else {
          formData.append("image", initialImage);
        }
      }

      // Send the data through API
      const response = await axios.put(
        `${BACKEND_URL}/wishlists/${itemId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        if (originalStatus === "suggestion" && role === "teacher") {
          DonationNoti(authUser.userId).approveSuggestion(
            itemId,
            OriginalParentId,
            authUser.userId
          );
          toast.success("The suggestion has been approved successfully!");
        } else {
          toast.success("Item updated successfully!");
        }

        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } catch (error) {
      toast.error(
        "Couldn't update wishlist item:",
        error.response.data.message
      );
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return (
    <>
      <Box width={"100%"}>
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
            EDIT ITEM
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            {/* Item Name */}
            <Grid item xs={12} sm={6}>
              <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                Item Name
              </Typography>
              <TextField
                label="Item name *"
                variant="outlined"
                name={"itemName"}
                fullWidth
                value={formik.values.itemName}
                onChange={formik.handleChange}
                error={
                  formik.touched.itemName && Boolean(formik.errors.itemName)
                }
                helperText={formik.touched.itemName && formik.errors.itemName}
              />
            </Grid>

            {/* Link to Item */}
            <Grid item xs={12} md={6}>
              <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                Link to Item
              </Typography>
              <TextField
                label="Link"
                variant="outlined"
                name={"link"}
                fullWidth
                value={formik.values.link}
                onChange={formik.handleChange}
                error={formik.touched.link && Boolean(formik.errors.link)}
                helperText={formik.touched.link && formik.errors.link}
              />
            </Grid>

            {/* Item Description */}
            <Grid item xs={12}>
              <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                Item Description
              </Typography>
              <TextField
                label="Item description *"
                variant="outlined"
                name={"itemDescription"}
                multiline
                rows={4}
                fullWidth
                value={formik.values.itemDescription}
                onChange={formik.handleChange}
                error={
                  formik.touched.itemDescription &&
                  Boolean(formik.errors.itemDescription)
                }
                helperText={
                  formik.touched.itemDescription &&
                  formik.errors.itemDescription
                }
              />
            </Grid>

            {/* Target to raise */}
            {(role === "teacher" || role === "school") && (
              <Grid item xs={12} md={6}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                  Target to raise
                </Typography>
                <TextField
                  label="Target to raise *"
                  variant="outlined"
                  name={"target"}
                  fullWidth
                  value={formik.values.target}
                  onChange={formik.handleChange}
                  error={formik.touched.target && Boolean(formik.errors.target)}
                  helperText={formik.touched.target && formik.errors.target}
                />
              </Grid>
            )}

            {/* Deadline */}
            {(role === "teacher" || role === "school") && (
              <Grid item xs={12} md={6}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                  Deadline
                </Typography>
                <TextField
                  label="Deadline"
                  variant="outlined"
                  name={"deadline"}
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formik.values.deadline}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.deadline && Boolean(formik.errors.deadline)
                  }
                  helperText={formik.touched.deadline && formik.errors.deadline}
                />
              </Grid>
            )}

            {/* Image Upload */}
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
                        error={formik.touched.image && formik.errors.image}
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
                    {formik.touched.image && Boolean(formik.errors.image) && (
                      <FormHelperText error>
                        {formik.errors.image}
                      </FormHelperText>
                    )}
                  </Box>
                  <Box xs={12} md={6} width="50%">
                    {imagePreview && (
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
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Fulfilment Choice */}
            {(role === "teacher" || role === "school") && (
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Fulfilment Choice</FormLabel>
                  <RadioGroup
                    aria-label="fulfilmentChoice"
                    name="fulfilmentChoice"
                    value={formik.values.fulfilmentChoice}
                    onChange={formik.handleChange}
                    row
                  >
                    <FormControlLabel
                      value="company"
                      control={<Radio />}
                      label="Company"
                    />
                    <FormControlLabel
                      value="myself"
                      control={<Radio />}
                      label="Myself"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: "20px",
                  mt: 5,
                }}
              >
                <Button
                  variant="outlined"
                  sx={{ mr: 2, borderRadius: "20px" }}
                  onClick={() => navigate("/classroom")}
                >
                  Cancel
                </Button>
                {formik.values.status !== "suggestion" && (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ borderRadius: "20px", mr: 2 }}
                  >
                    Save Changes
                  </Button>
                )}

                {(role === "teacher" || role === "school") &&
                  formik.values.status === "suggestion" && (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{ borderRadius: "20px" }}
                    >
                      Approve
                    </Button>
                  )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
};

export default Form;
