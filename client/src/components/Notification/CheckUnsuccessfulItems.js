import { useEffect, useContext } from "react";
import { AuthContext } from "../../App";
import { DonationNoti } from "./DonationNoti";

const CheckUnsuccessfulItems = () => {
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    const { checkUnsuccessful } = DonationNoti(authUser?.userId);

    const checkItems = () => {
      checkUnsuccessful()
        .then(() => {
          // console.log("check completed");
        })
        .catch((error) => {
          console.error("Error checking unsuccessful items:", error);
        });
    };

    checkItems();

    const intervalId = setInterval(checkItems, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [authUser?.userId]);
  return null;
};

export default CheckUnsuccessfulItems;
