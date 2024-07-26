import React from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const validationSchema = yup.object({
  newPassword: yup
    .string("Enter your new password")
    .required("New password is required")
    .min(8, "Password should be at least 8 characters"),
  confirmPassword: yup
    .string("Confirm your new password")
    .required("Confirming your new password is required")
    .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});

const Form = () => {
  const navigate = useNavigate();

  let { token } = useParams();
  const initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const onSubmit = (values, { setSubmitting }) => {
    const resetPasswordData = {
      password: values.newPassword,
    };

    axios
      .post(`${BACKEND_URL}/users/reset-password/${token}`, resetPasswordData)
      .then((response) => {
        toast.success(
          "Password reset successfully. You can now log in with your new password."
        );
      })
      .catch((error) => {
        toast.error("An error occurred. Please try again.");
        console.error("Password reset error:", error);
      })
      .finally(() => {
        setSubmitting(false);
        navigate("/login");
      });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Reset Your Password
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="New Password"
              type="password"
              name="newPassword"
              fullWidth
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
              helperText={
                formik.touched.newPassword && formik.errors.newPassword
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              fullWidth
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
          </Grid>
          <Grid
            item
            container
            xs={12}
            justifyContent="space-between"
            sx={{ mt: 4 }}
          >
            <Grid item>
              <Button
                size="large"
                variant="outlined"
                component={Link}
                href={"/login"}
              >
                Back to login
              </Button>
            </Grid>
            <Grid item>
              <Button size="large" variant="contained" type="submit">
                Reset Password
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Form;
