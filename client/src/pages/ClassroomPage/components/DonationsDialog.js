import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

const DonationsDialog = ({ open, onClose, handleDonation, itemId }) => {
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          minHeight: "250px",
        },
      }}
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <strong>Ready to Make a Difference?</strong>
        <IconButton onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography id="alert-dialog-description" variant="body2" gutterBottom>
          <strong>Log In</strong> to track your impact or{" "}
          <strong>Sign Up</strong> for a quick and easy process. Short on time?
          Feel free to <strong>Proceed as Guest</strong>.
        </Typography>
        <br />
        <Typography id="alert-dialog-description" variant="body2">
          Your generosity brings us closer to our goal. Thank you for your
          support! 🙏
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleDonation(itemId);
          }}
        >
          Proceed as a guest
        </Button>
        <Button onClick={() => navigate("/signup")}>Sign up</Button>
        <Button onClick={() => navigate("/login")} autoFocus>
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DonationsDialog;
