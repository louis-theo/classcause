import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../App";
import "./StripePaymentPage.css";
import Container from "../../common/Container";
import { Typography, Button, TextField, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const StripePaymentPage = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [donationAmount, setDonationAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { authUser } = useContext(AuthContext);
  const query = useQuery();
  const wishlistId = query.get("wishlistId");
  const [transactionFeeRate, setTransactionFeeRate] = useState(0.1); // Default transaction fee rate
  const presetAmounts = [5, 10, 15, 20, 50, 100];

  useEffect(() => {
    const accountType = authUser ? authUser.accountType : "parent";
    const fetchTransactionFeeRate = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/transaction-fee/latest/${accountType}`
        );
        setTransactionFeeRate(response.data.transactionRate);
      } catch (error) {
        console.error("Failed to fetch transaction fee rate:", error);
      }
    };
    fetchTransactionFeeRate();
  }, [authUser, BACKEND_URL]);

  const redirectToStripeCheckout = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/create-checkout-session`,
        {
          userId: authUser?.userId,
          wishlistId: wishlistId,
          amount: Math.round(donationAmount * 100),
        }
      );
      sessionStorage.setItem("itemId", wishlistId);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(`Error redirecting to Stripe Checkout: ${error}`);
    }
  };

  const handleDonateClick = () => {
    const amount = parseFloat(donationAmount);
    if (!isNaN(amount) && amount >= 1) {
      redirectToStripeCheckout();
    } else {
      toast.error("Please enter a valid amount (minimum £1).");
    }
  };

  const handlePresetAmountClick = (amount) => {
    setDonationAmount(amount.toString());
    setErrorMessage("");
  };

  // Calculate the amounts for display
  const donationReceived = donationAmount - donationAmount * transactionFeeRate;
  const transactionFee = donationAmount * transactionFeeRate;

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container>
      <Box sx={{ padding: 2 }}>
        <Typography
          marginTop={2}
          fontWeight={700}
          variant={!isMd ? "h2" : "h3"}
          color="primary"
          gutterBottom
          align="center"
        >
          Make donation
        </Typography>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        {donationAmount && (
          <Typography
            variant="h5"
            color="text.secondary"
            textAlign="center"
            sx={{ mx: "auto" }}
          >
            You are making a donation of £{donationAmount}. The School will
            receive £{donationReceived.toFixed(2)} and £
            {transactionFee.toFixed(2)} will be charged as a transaction fee.
          </Typography>
        )}
        <Box
          flexWrap={"wrap"}
          sx={{
            my: 2,
            display: "flex",
            justifyContent: "space-between",
            width: !isMd ? "60%" : "100%",
            mx: "auto",
          }}
        >
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outlined"
              sx={{ margin: 1 }}
              onClick={() => handlePresetAmountClick(amount)}
            >
              £{amount}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Enter custom donation"
            InputProps={{ inputProps: { min: 1 } }}
            variant="outlined"
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleDonateClick}
          >
            Donate
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default StripePaymentPage;
