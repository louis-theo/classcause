import React, { useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { AuthContext } from "../../../App";

const DeleteProfileDialog = ({
  open,
  onClose,
  handleDeleteProfile,
  isLoading,
}) => {
  const { authUser } = useContext(AuthContext);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        {(authUser?.accountType === "teacher" ||
          authUser?.accountType === "school") && (
          <DialogContentText marginBottom={1}>
            {" "}
            You won't be able to delete the profile if you have any active items
            or items pending money withdrawal and purchase
          </DialogContentText>
        )}
        {authUser?.accountType !== "teacher" &&
          authUser?.accountType !== "school" && (
            <DialogContentText marginBottom={1}>
              All the items related to your account will be permanently deleted
            </DialogContentText>
          )}
        <DialogContentText marginBottom={1}>
          {" "}
          Are you sure you want to delete your profile?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleDeleteProfile}
          color="error"
          disabled={isLoading}
          autoFocus
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProfileDialog;
