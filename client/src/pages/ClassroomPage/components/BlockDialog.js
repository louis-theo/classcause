import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const BlockDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
    >
      <DialogTitle id="login-dialog-title">{"Action BLocked"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="login-dialog-description">
          Please add stories to the existing completed items to be able to add
          new item to your wishlist
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockDialog;
