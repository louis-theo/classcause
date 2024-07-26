import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./DonationSuccess.css";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
import DonationNoti from "../../components/Notification/DonationNoti";
import { AuthContext } from "../../App";
import Container from "../../common/Container";

const DonationSuccess = () => {
  const navigate = useNavigate();
  const { authUser } = useContext(AuthContext);
  const { callCheckTargetAPI } = DonationNoti(authUser?.userId);
  const wishlistId = parseInt(sessionStorage.getItem("itemId"));

  callCheckTargetAPI(wishlistId);

  sessionStorage.removeItem("wishlistId");

  return (
    <Container>
      <div className="donation-success">
        <FaCheckCircle className="success-icon" />
        <h1>Thank You for Your Donation!</h1>
        <p>
          Your generous contribution will greatly help in supporting local
          schools.
        </p>
        <FaHeart className="heart-icon" />
        <div className="donation-details">
          <p>
            We have sent a confirmation email with the details of your donation.
          </p>
        </div>
        <div className="button-container">
          <button className="continue-button" onClick={() => navigate("/")}>
            Continue Browsing
          </button>
        </div>
      </div>
    </Container>
  );
};

export default DonationSuccess;
