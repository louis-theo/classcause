import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const BidDialog = ({
  open,
  onClose,
  submitBid,
  bidAmount,
  handleBidAmountChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Submit Your Bid</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="bidAmount"
          aria-label="bid amount"
          label="Bid Amount (£)"
          type="number"
          name="bidAmount"
          fullWidth
          variant="outlined"
          value={bidAmount}
          onChange={handleBidAmountChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submitBid}>Submit Bid</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BidDialog;
