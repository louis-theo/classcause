import { useEffect } from "react";
import { BidNoti } from "./BidNoti";

const CheckUnsuccessfulBids = () => {
  useEffect(() => {
    const { checkUnsuccessful } = BidNoti();
    const checkBids = () => {
      checkUnsuccessful()
        .then(() => {
          // console.log("bid check completed");
        })
        .catch((error) => {
          console.error("Error checking unsuccessful bids:", error);
        });
    };

    checkBids();

    const intervalId = setInterval(checkBids, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, []);
  return null;
};

export default CheckUnsuccessfulBids;
