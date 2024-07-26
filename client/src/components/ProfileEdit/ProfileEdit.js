import React, { useContext } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// form
import { useFormik } from "formik";
import * as yup from "yup";
import FormControlLabel from "@mui/material/FormControlLabel";

// MUI components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Container from "../../common/Container";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const validationSchema = yup.object({
  userFirstName: yup
    .string("Enter your first name")
    .trim()
    .min(2, "Please enter a valid name")
    .max(50, "Please enter a valid name")
    .required("Please specify your first name"),
  userLastName: yup
    .string("Enter your last name")
    .trim()
    .min(2, "Please enter a valid name")
    .max(50, "Please enter a valid name")
    .required("Please specify your last name"),
  email: yup
    .string("Enter your email")
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "The password should have at minimum length of 8"),
  mobileNum: yup
    .string()
    .trim()
    .matches(/^(07|\+447)\d{9}$/, "Invalid mobile number format")
    .required("Mobile number is required"),
  bio: yup.string().required("Please write a little bit about yourself"),
  school: yup.string("Enter your school name").when(["accountType"], {
    is: (value) => value === "teacher" || value === "school",
    then: () => yup.string().required("School name is required"),
  }),
  groupName: yup.string("Enter your group name").when(["accountType"], {
    is: (value) => value === "teacher",
    then: () => yup.string().required("Group name is required"),
  }),
  street: yup.string("Enter your street name").when(["accountType"], {
    is: (accountType) => accountType === "teacher" || accountType === "school",
    then: () => yup.string().required("Street name is required"),
  }),
  city: yup.string("Enter your city").when(["accountType"], {
    is: (accountType) => accountType === "teacher" || accountType === "school",
    then: () => yup.string().required("City is required"),
  }),
  postcode: yup.string("Enter your postcode").when(["accountType"], {
    is: (accountType) => accountType === "teacher" || accountType === "school",
    then: () => yup.string().required("Postcode is required"),
  }),
});

const ProfileEdit = ({ BACKEND_URL }) => {
  const { authUser, setReloadAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialValues = {
    userFirstName: authUser.userFirstName || "",
    userLastName: authUser.userLastName || "",
    password: authUser.password || "",
    email: authUser.email || "",
    mobileNum: authUser.mobileNum || "",
    accountType: authUser.accountType || "",
    school: authUser.school || "",
    groupName: authUser.groupName || "",
    street: authUser.street || "",
    city: authUser.city || "",
    postcode: authUser.postcode || "",

    orderCompletion: "company",
    bio: authUser.bio || "",
  };

  // Handling file changes
  const handleAvatarChange = (event) => {
    formik.setFieldValue("avatar", event.currentTarget.files[0]);
  };

  const onSubmit = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "avatar") {
        formData.append(key, value);
      }
    });
    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }
    try {
      await axios.put(`${BACKEND_URL}/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      setTimeout(() => navigate("/profile"), 1500);
      setReloadAuthUser((prev) => !prev);
      toast.success("Profile information updated!");
    } catch (error) {
      toast.error(`Error updating the profile ${error.response.data.message}`);
    }
    return values;
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return (
    <>
      <Box
        position={"relative"}
        minHeight={"calc(100vh - 247px)"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        height={"100%"}
        marginTop={8}
      >
        <Container maxWidth={600}>
          <Box>
            {/* Back button */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/profile")}
              sx={{ marginBottom: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" sx={{ mb: 4 }}>
              Edit Profile
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {/* Form fields */}
                <Grid item xs={12}>
                  <TextField
                    id="accountType"
                    name="accountType"
                    label="Account Type"
                    value={formik.values.accountType}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                {/* Common fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="userFirstName"
                    name="userFirstName"
                    label="First Name"
                    value={formik.values.userFirstName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.userFirstName &&
                      Boolean(formik.errors.userFirstName)
                    }
                    helperText={
                      formik.touched.userFirstName &&
                      formik.errors.userFirstName
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="userLastName"
                    name="userLastName"
                    label="Last Name"
                    value={formik.values.userLastName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.userLastName &&
                      Boolean(formik.errors.userLastName)
                    }
                    helperText={
                      formik.touched.userLastName && formik.errors.userLastName
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    fullWidth
                  />
                </Grid>
                {/* do we need new password set up? */}
                <Grid item xs={12}>
                  <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                    Enter your new password
                  </Typography>
                  <TextField
                    label="Password *"
                    variant="outlined"
                    name={"password"}
                    type={"password"}
                    fullWidth
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="mobileNum"
                    name="mobileNum"
                    label="Mobile Number"
                    value={formik.values.mobileNum}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.mobileNum &&
                      Boolean(formik.errors.mobileNum)
                    }
                    helperText={
                      formik.touched.mobileNum && formik.errors.mobileNum
                    }
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    name="bio"
                    multiline
                    rows={3}
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    error={formik.touched.bio && Boolean(formik.errors.bio)}
                    helperText={formik.touched.bio && formik.errors.bio}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                    id="raised-button-file"
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span">
                      Upload New Avatar
                    </Button>
                  </label>
                  {formik.values.avatar ? formik.values.avatar.name : ""}
                </Grid>
                {/* Conditional for account types teacher and school */}
                {(formik.values.accountType === "teacher" ||
                  formik.values.accountType === "school") && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ marginBottom: 2 }}
                      >
                        Enter your school
                      </Typography>
                      <TextField
                        label="School*"
                        variant="outlined"
                        name={"school"}
                        fullWidth
                        value={formik.values.school}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.school && Boolean(formik.errors.school)
                        }
                        helperText={
                          formik.touched.school && formik.errors.school
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ marginBottom: 2 }}
                      >
                        Enter your group name
                      </Typography>
                      <TextField
                        label="Group"
                        variant="outlined"
                        name={"groupName"}
                        fullWidth
                        value={formik.values.groupName}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.groupName &&
                          Boolean(formik.errors.groupName)
                        }
                        helperText={
                          formik.touched.groupName && formik.errors.groupName
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ marginBottom: 2 }}
                      >
                        Enter your address
                      </Typography>
                      <TextField
                        label="Street name*"
                        variant="outlined"
                        name={"street"}
                        type={"street"}
                        fullWidth
                        value={formik.values.street}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.street && Boolean(formik.errors.street)
                        }
                        helperText={
                          formik.touched.street && formik.errors.street
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="City"
                        variant="outlined"
                        name={"city"}
                        fullWidth
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.city && Boolean(formik.errors.city)
                        }
                        helperText={formik.touched.city && formik.errors.city}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Postcode"
                        variant="outlined"
                        name={"postcode"}
                        fullWidth
                        value={formik.values.postcode}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.postcode &&
                          Boolean(formik.errors.postcode)
                        }
                        helperText={
                          formik.touched.postcode && formik.errors.postcode
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant={"subtitle2"}
                        sx={{ marginBottom: 2 }}
                      >
                        Who do you want to complete the order:
                      </Typography>
                      <RadioGroup
                        aria-label="orderCompletion"
                        name="orderCompletion"
                        value={formik.values.orderCompletion}
                        onChange={formik.handleChange}
                        row
                      >
                        <FormControlLabel
                          value="company"
                          control={<Radio />}
                          label="Numberfit"
                        />
                        <FormControlLabel
                          value="myself"
                          control={<Radio />}
                          label="Myself"
                        />
                      </RadioGroup>
                    </Grid>

                    {formik.values.orderCompletion === "myself"}
                  </>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    fullWidth
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProfileEdit;
