const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const callAddNotificationAPI = async (notificationData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/notification/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationData),
    });

    await response.json();
  } catch (error) {
    console.error("API call error:", error);
  }
};

export const fetchTeacherId = async (wishlistItemId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/wishlists/item/${wishlistItemId}`
    );
    const { teacherId } = await response.json();
    return teacherId;
  } catch (error) {
    console.error("Error fetching teacher ID:", error);
    return null;
  }
};

export const fetchParentId = async (classroomId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/favourites/${classroomId}`);
    const data = await response.json();
    const firstItem = data[0];
    if (firstItem && "userId" in firstItem) {
      return firstItem.userId;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching teacher ID:", error);
    return null;
  }
};

export const fetchEmail = async (senderId) => {
  try {
    if (!senderId) {
      return;
    }
    const response = await fetch(`${BACKEND_URL}/users/email/${senderId}`);
    const { email } = await response.json();
    return email;
  } catch (error) {
    console.error("Error fetching email:", error);
    return null;
  }
};
export const sendEmail = async (emailData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/email/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const fetchMessageData = async (messageId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/email/messages/${messageId}`);
    const data = await response.json();
    return data; // This includes the subject and text
  } catch (error) {
    console.error("Error fetching message data:", error);
    return null;
  }
};

// Fetches the schoolId from an advertisement.
export const fetchSchoolUser = async (advertisementId) => {
  try {
    const adResponse = await fetch(
      `${BACKEND_URL}/advertisement/${advertisementId}/details`
    );
    const adData = await adResponse.json();

    return adData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// check for closed bids and returns an array of related bidder details (a winner and the others).
export const fetchBidders = async () => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/advertisement/check-unsuccessful`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseBody = await response.json();

    if (responseBody.success) {
      const data = responseBody.data;

      if (Array.isArray(data) && data.length > 0) {
        return data.map((ad) => {
          const { advertisementId, nonHighestBidderIds, highestBidderId } = ad;
          return { advertisementId, nonHighestBidderIds, highestBidderId };
        });
      } else {
        return [];
      }
    } else {
      console.error("Request was not successful:", responseBody.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching bidder IDs:", error);
    return null;
  }
};

// Retrieves business IDs that have placed a bid on a specific advertisement when outbid
// excluding the current bidder's ID who is offering the highest amount.
export const fetchBidderIdsExcludingCurrent = async (
  advertisementId,
  currentBidderId
) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/advertisement/${advertisementId}/businesses-excluding-current?currentBidderId=${currentBidderId}`
    );
    const data = await response.json();
    if (response.ok) {
      return data.businessIds;
    } else {
      throw new Error(
        data.message || "An error occurred while fetching bidder IDs"
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
