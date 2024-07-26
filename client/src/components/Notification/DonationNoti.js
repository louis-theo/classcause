import {
  callAddNotificationAPI,
  fetchTeacherId,
  fetchEmail,
  sendEmail,
  fetchMessageData,
  fetchParentId,
} from "./Utilities";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const DonationNoti = (userId) => {
  const callCheckTargetAPI = async (itemId) => {
    const senderId = await fetchTeacherId(itemId);
    const parentEmail = await fetchEmail(userId);
    const teacherEmail = await fetchEmail(senderId);
    let messageId;
    try {
      if (!parentEmail) {
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/donations/check-target/${itemId}`
      );
      const data = await response.json();

      if (data.isTargetReached) {
        messageId = 1;
      } else {
        messageId = 2;
      }
    } catch (error) {
      console.error("Failed to call API:", error);
    }

    if (messageId) {
      // to parent
      const parentMessageData = await fetchMessageData(messageId);
      const parentEmailData = {
        to: parentEmail || "",
        subject: parentMessageData.messageTitle,
        text: parentMessageData.messageContent,
      };
      sendEmail(parentEmailData);

      const parentNotificationData = {
        userId: userId || null,
        senderId: senderId,
        messageId: messageId,
        status: 0,
        time: new Date().toISOString(),
        url: `/classroom/${senderId}/item/${itemId}`,
      };
      callAddNotificationAPI(parentNotificationData);

      // to teacher
      messageId += 2;
      const teacherMessageData = await fetchMessageData(messageId);
      const teacherEmailData = {
        to: teacherEmail,
        subject: teacherMessageData.messageTitle,
        text: teacherMessageData.messageContent,
      };
      sendEmail(teacherEmailData);

      const teacherNotificationData = {
        userId: senderId,
        senderId: userId || null,
        messageId: messageId,
        status: 0,
        time: new Date().toISOString(),
        url: `/classroom/item/${itemId}`,
      };
      callAddNotificationAPI(teacherNotificationData);
    } else {
      console.log("Message ID is not defined");
    }
  };

  const checkUnsuccessful = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/donations/check-unsuccessful`
      );
      const result = await response.json();

      if (!Array.isArray(result.data) || result.data.length === 0) {
        return;
      }

      for (const item of result.data) {
        const { wishlistItemId, teacherId, donationUserIds } = item;

        const parentEmail = await fetchEmail(userId);
        const teacherEmail = await fetchEmail(teacherId);
        for (const userId of donationUserIds) {
          const NotificationData = {
            userId: userId || null,
            senderId: teacherId,
            messageId: 6,
            status: 0,
            time: new Date().toISOString(),
            url: `/classroom/item/${wishlistItemId}`,
          };
          callAddNotificationAPI(NotificationData);

          const parentMessageData = await fetchMessageData(6);
          const parentEmailData = {
            to: parentEmail || "",
            subject: parentMessageData.messageTitle,
            text: parentMessageData.messageContent,
          };
          sendEmail(parentEmailData);
        }
        const NotificationData = {
          userId: teacherId,
          messageId: 5,
          status: 0,
          time: new Date().toISOString(),
          url: `/classroom/item/${wishlistItemId}`,
        };
        callAddNotificationAPI(NotificationData);

        const teacherMessageData = await fetchMessageData(5);
        const teacherEmailData = {
          to: teacherEmail,
          subject: teacherMessageData.messageTitle,
          text: teacherMessageData.messageContent,
        };
        sendEmail(teacherEmailData);
      }
    } catch (error) {
      console.error("Failed to check for unsuccessful items:", error);
    }
  };

  const approveSuggestion = async (itemId, parentId, userId) => {
    const parentEmail = await fetchEmail(parentId);
    try {
      const parentMessageData = await fetchMessageData(12);

      const parentEmailData = {
        to: parentEmail,
        subject: parentMessageData.messageTitle,
        text: parentMessageData.messageContent,
      };

      await sendEmail(parentEmailData);

      const parentNotificationData = {
        userId: parentId,
        senderId: userId,
        messageId: 12,
        status: 0,
        time: new Date().toISOString(),
        url: `/classroom/item/${itemId}`,
      };

      await callAddNotificationAPI(parentNotificationData);
    } catch (error) {
      console.error("Failed to approve suggestion:", error);
    }
  };

  const notifyParent = async (userId) => {
    try {
      const parentId = await fetchParentId(userId);
      if (!parentId) {
        console.log("Parent ID not found for given user ID");
        return;
      }

      const parentEmail = await fetchEmail(parentId);
      const parentMessageData = await fetchMessageData(13);

      const parentEmailData = {
        to: parentEmail,
        subject: parentMessageData.messageTitle,
        text: parentMessageData.messageContent,
      };

      await sendEmail(parentEmailData);

      const parentNotificationData = {
        userId: parentId,
        senderId: userId,
        messageId: 13,
        status: 0,
        time: new Date().toISOString(),
        url: `/classroom/${userId}`,
      };

      await callAddNotificationAPI(parentNotificationData);

      // console.log('Notification and email sent to parent successfully.');
    } catch (error) {
      console.error("Failed to notify parent:", error);
    }
  };

  return {
    callCheckTargetAPI,
    checkUnsuccessful,
    approveSuggestion,
    notifyParent,
  };
};

export default DonationNoti;
