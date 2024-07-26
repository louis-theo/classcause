import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../../App";

// MUI components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required."),
  password: yup
    .string()
    .required("Please specify your password")
    .min(8, "The password should have at minimum length of 8"),
});

const Form = ({ BACKEND_URL }) => {
  const { setAuthUser, setIsLoggedIn } = useContext(AuthContext);

  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const onSubmit = async (values) => {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/users/login`, {
        email: values.email,
        password: values.password,
      });

      sessionStorage.setItem("authToken", data.authToken);

      if (data.authToken) {
        // Fetch user data after successful login
        const response = await axios.get(`${BACKEND_URL}/users/profile`, {
          headers: {
            authorization: `Bearer ${data.authToken}`,
          },
        });
        sessionStorage.setItem("role", response.data.accountType);

        setAuthUser({ ...response.data, userId: response.data.userId });
        setIsLoggedIn(true);
        toast.success("You are now logged in!");
        if (
          response.data.accountType === "teacher" ||
          response.data.accountType === "school"
        ) {
          setTimeout(() => navigate("/classroom"), 1000);
        } else if (response.data.accountType === "admin") {
          setTimeout(() => navigate("/admin-dashboard"), 1000);
        } else {
          setTimeout(() => navigate("/"), 1000);
        }
      }
    } catch (error) {
      toast.error(`Error logging in: ${error.response.data.message}`);
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
            Login
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Welcome back
          </Typography>
          <Typography color="text.secondary">
            Login to manage your account.
          </Typography>
        </Box>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
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
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretched", sm: "center" }}
                justifyContent={"space-between"}
                width={"100%"}
                marginBottom={2}
              >
                <Box marginBottom={{ xs: 1, sm: 0 }}>
                  <Typography variant={"subtitle2"}>
                    Enter your password
                  </Typography>
                </Box>
                <Typography variant={"subtitle2"}>
                  <Link
                    component={"a"}
                    color={"primary"}
                    href={"/page-forgot-password"}
                    underline={"none"}
                  >
                    Forgot your password?
                  </Link>
                </Typography>
              </Box>
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
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
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
                    Don't have an account yet?{" "}
                    <Link
                      component={"a"}
                      color={"primary"}
                      href={"/signup"}
                      underline={"none"}
                    >
                      Sign up here.
                    </Link>
                  </Typography>
                </Box>
                <Button size={"large"} variant={"contained"} type={"submit"}>
                  Login
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
};

export default Form;
