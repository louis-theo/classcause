import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { styled } from "@mui/material/styles";

// form
import { useFormik } from "formik";
import * as yup from "yup";
import { FormHelperText } from "@mui/material";

// MUI components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

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
    .required("Email is required.")
    .email("Please enter a valid email address")
    .matches(/^.+@.+\..+$/, "Email must contain a dot in the domain part"),
  password: yup
    .string()
    .required("Please specify your password")
    .min(8, "The password should have at minimum length of 8"),
  mobileNum: yup
    .string()
    .trim()
    .matches(/^(07|\+447)\d{9}$/, "Invalid mobile number format")
    .required("Mobile number is required"),
  accountType: yup
    .string("Select your account type")
    .oneOf(["teacher", "parent", "school", "business"], "Invalid account type")
    .required("Account type is required"),
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

  bio: yup
    .string("Enter your bio")
    .trim()
    .max(500, "Bio can't exceed 500 characters"),
  avatar: yup.string("Upload the picture").required("Picture URL is required."),
});

const Input = styled("input")({
  display: "none",
});

const Form = ({ BACKEND_URL }) => {
  const navigate = useNavigate();

  const initialValues = {
    userFirstName: "",
    email: "",
    mobileNum: "",
    password: "",
    userLastName: "",
    accountType: "",
    school: "",
    groupName: "",
    street: "",
    city: "",
    postcode: "",
    orderCompletion: "company",
    bio: "",
    avatar: "",
  };

  const onSubmit = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    try {
      await axios.post(`${BACKEND_URL}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile created");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(`Error registering: ${error.response.data.message}`);
    }
  };

  // Handling file selection
  const handleFileChange = (event) => {
    formik.setFieldValue("avatar", event.currentTarget.files[0]);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return (
    <Box>
      <Box marginBottom={4}>
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
          }}
          gutterBottom
          color={"textSecondary"}
        >
          Signup
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Create an account
        </Typography>
        <Typography color="text.secondary">
          Fill out the form to get started.
        </Typography>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your first name
            </Typography>
            <TextField
              label="First name *"
              variant="outlined"
              name={"userFirstName"}
              fullWidth
              value={formik.values.userFirstName}
              onChange={formik.handleChange}
              error={
                formik.touched.userFirstName &&
                Boolean(formik.errors.userFirstName)
              }
              helperText={
                formik.touched.userFirstName && formik.errors.userFirstName
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your last name
            </Typography>
            <TextField
              label="Last name *"
              variant="outlined"
              name={"userLastName"}
              fullWidth
              value={formik.values.userLastName}
              onChange={formik.handleChange}
              error={
                formik.touched.userLastName &&
                Boolean(formik.errors.userLastName)
              }
              helperText={
                formik.touched.userLastName && formik.errors.userLastName
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your email
            </Typography>
            <TextField
              label="Email *"
              variant="outlined"
              name={"email"}
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your password
            </Typography>
            <TextField
              label="Password *"
              variant="outlined"
              name={"password"}
              type={"password"}
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your mobile
            </Typography>
            <TextField
              label="Mobile*"
              variant="outlined"
              name={"mobileNum"}
              fullWidth
              value={formik.values.mobileNum}
              onChange={formik.handleChange}
              error={
                formik.touched.mobileNum && Boolean(formik.errors.mobileNum)
              }
              helperText={formik.touched.mobileNum && formik.errors.mobileNum}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Please select the account type
            </Typography>
            <TextField
              select
              label="accountType*"
              variant="outlined"
              name={"accountType"}
              fullWidth
              value={formik.values.accountType}
              onChange={formik.handleChange}
              error={
                formik.touched.accountType && Boolean(formik.errors.accountType)
              }
              helperText={
                formik.touched.accountType && formik.errors.accountType
              }
            >
              {["teacher", "parent", "school", "business"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* bio */}
          <Grid item xs={12}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Enter your bio
            </Typography>
            <TextField
              label="Bio"
              variant="outlined"
              name={"bio"}
              multiline
              rows={4}
              fullWidth
              value={formik.values.bio}
              onChange={formik.handleChange}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
            />
          </Grid>
          {/* Image upload field */}
          <Grid item xs={12}>
            <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
              Upload your avatar
            </Typography>
            <label htmlFor="avatar-upload">
              <Input
                accept="image/*"
                id="avatar-upload"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <Button variant="contained" component="span">
                Upload
              </Button>
              {formik.values.avatar
                ? formik.values.avatar.name
                : "No file chosen"}
            </label>
            {formik.touched.avatar && formik.errors.avatar && (
              <FormHelperText error>{formik.errors.avatar}</FormHelperText>
            )}
          </Grid>
          {(formik.values.accountType === "teacher" ||
            formik.values.accountType === "school") && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
                  Enter your school
                </Typography>
                <TextField
                  label="School*"
                  variant="outlined"
                  name={"school"}
                  fullWidth
                  value={formik.values.school}
                  onChange={formik.handleChange}
                  error={formik.touched.school && Boolean(formik.errors.school)}
                  helperText={formik.touched.school && formik.errors.school}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
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
                    formik.touched.groupName && Boolean(formik.errors.groupName)
                  }
                  helperText={
                    formik.touched.groupName && formik.errors.groupName
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
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
                  error={formik.touched.street && Boolean(formik.errors.street)}
                  helperText={formik.touched.street && formik.errors.street}
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
                  error={formik.touched.city && Boolean(formik.errors.city)}
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
                    formik.touched.postcode && Boolean(formik.errors.postcode)
                  }
                  helperText={formik.touched.postcode && formik.errors.postcode}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant={"subtitle2"} sx={{ marginBottom: 2 }}>
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
            </>
          )}
          <Grid item container xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretched", sm: "center" }}
              justifyContent={"space-between"}
              width={"100%"}
              maxWidth={600}
              margin={"0 auto"}
            >
              <Box marginBottom={{ xs: 1, sm: 0 }}>
                <Typography variant={"subtitle2"}>
                  Already have an account?{" "}
                  <Link
                    component={"a"}
                    color={"primary"}
                    href={"/login"}
                    underline={"none"}
                  >
                    Login.
                  </Link>
                </Typography>
              </Box>
              <Button
                size={"large"}
                variant={"contained"}
                type={"submit"}
                name="signup"
              >
                Sign up
              </Button>
            </Box>
          </Grid>
          <Grid
            item
            container
            xs={12}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography
              variant={"subtitle2"}
              color={"textSecondary"}
              align={"center"}
            >
              By clicking "Sign up" button you agree with our{" "}
              <Link
                component={"a"}
                color={"primary"}
                href={"/page-privacy"}
                underline={"none"}
              >
                Privacy policy.
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Form;
