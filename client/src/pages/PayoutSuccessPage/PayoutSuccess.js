import React from "react";
import { useNavigate } from "react-router-dom";
import './PayoutSuccess.css';
import { FaHeart, FaCheckCircle } from 'react-icons/fa';

const PayoutSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payout-success">
      <FaCheckCircle className="success-icon" />
      <h1>Your Payout is Successful!</h1>
      <p>
        Please check your Stripe Connect account for the funds transfer.
      </p>
      <FaHeart className="heart-icon" />
      <div className="payout-details">
        <p>
          We have sent a confirmation email with the details of your payout.
        </p>
      </div>
      <div className="button-container">
        <button className="continue-button" onClick={() => navigate('/')}>Continue Browsing</button>
      </div>
    </div>
  );
};

export default PayoutSuccess;
