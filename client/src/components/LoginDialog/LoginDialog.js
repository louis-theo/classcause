import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
    >
      <DialogTitle id="login-dialog-title">{"Login Required"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="login-dialog-description">
          You need to be logged in to perform this action.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Dismiss
        </Button>
        <Button
          onClick={() => {
            navigate("/login");
            onClose();
          }}
          color="primary"
          autoFocus
        >
          Login
        </Button>
        <Button
          onClick={() => {
            navigate("/signup");
            onClose();
          }}
          color="primary"
          autoFocus
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
