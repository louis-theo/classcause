// Stipe Connect Return Page
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
// MUI components
import { Box, Typography, Button } from "@mui/material";
import Container from "../../common/Container";

const StripeReturnPage = () => {
  const { authUser, setReloadAuthUser, BACKEND_URL } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const finaliseStripeConnect = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/finalise-stripe-connect`,
          {
            // Send email from sessionStorage if authUser not available
            email: sessionStorage.getItem("email"),
          }
        );

        if (response.data.success) {
          toast.success("Stripe Connect account finalised successfully.");

          setReloadAuthUser((prev) => !prev);
        } else {
          toast.error("Failed to finalise Stripe Connect account linkage.");
        }
      } catch (error) {
        toast.error(`Failed to finalise Stripe Connect account: ${error}`);
      }
    };

    finaliseStripeConnect();
  }, [BACKEND_URL, location]);

  return (
    <Container>
      <Box>
        <Typography
          variant="h6"
          color="textSecondary"
          gutterBottom
          align="center"
          marginBottom={6}
        >
          Stripe Connect account created successfully. Please return to the
          profile page to withdraw funds.
        </Typography>
      </Box>
      <Box marginTop={3} width="100%">
        <Button
          variant="outlined"
          color="primary"
          component="a"
          target="blank"
          marginX="auto"
          onClick={() => navigate("/profile")}
          size="large"
        >
          Go to my profile
        </Button>
      </Box>
    </Container>
  );
};

export default StripeReturnPage;
