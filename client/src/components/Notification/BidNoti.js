import {callAddNotificationAPI, fetchEmail, sendEmail, fetchMessageData, fetchSchoolUser,
    fetchBidders, fetchBidderIdsExcludingCurrent} from './Utilities';

export const BidNoti  = ()  => {
    const addBid = async (advertisementId, userId) => {
        if (!userId) {
            console.error('User ID not found. Please login.');
            return;
        }

        //notification to other bidders when outbid
        const performActionWithBidderIds = async (advertisementId, currentBidderId) => {
            try {
                const bidderIds = await fetchBidderIdsExcludingCurrent(advertisementId, currentBidderId);

                if (bidderIds) {
                    console.log('Retrieved Bidder IDs:', bidderIds);
                    for (const userId of bidderIds) {
                        const businessNotificationData = {
                            userId: userId,
                            messageId: 11,
                            status: 0,
                            time: new Date().toISOString(),
                            url: `/advertisement/${advertisementId}`,
                        };
                        await callAddNotificationAPI(businessNotificationData);

                        const bidderEmail = await fetchEmail(userId);
                        const bidderMessageData = await fetchMessageData(11);
                        const bidderEmailData = {
                            to: bidderEmail,
                            subject: bidderMessageData.messageTitle,
                            text: bidderMessageData.messageContent,
                        };
                        await sendEmail(bidderEmailData);
                    }
                } else {
                    console.log('No bidder IDs were found or there was an error fetching them.');
                }
            } catch (error) {
                console.error('Error performing action with bidder IDs:', error);
            }
        };
        performActionWithBidderIds(advertisementId, userId);

        //notification to business when they bid
        const businessNotificationData = {
            userId: userId,
            messageId: 7,
            status: 0,
            time: new Date().toISOString(),
            url: `/advertisement/${advertisementId}`,
        };
        callAddNotificationAPI(businessNotificationData);

        const businessEmail = await fetchEmail(userId);
        const businessMessageData = await fetchMessageData(7);
        const businessEmailData = {
            to: businessEmail,
            subject: businessMessageData.messageTitle,
            text: businessMessageData.messageContent,
        };
        sendEmail(businessEmailData);

        //notification to school when received bid
        const schoolData = await fetchSchoolUser(advertisementId);
        const schoolMessageData = await fetchMessageData(8);
        const schoolId = schoolData.advertisement.schoolId;

        const schoolNotificationData = {
            userId: schoolId,
            messageId: 8,
            status: 0,
            time: new Date().toISOString(),
            url: `/advertisement/${advertisementId}`,
        };
        callAddNotificationAPI(schoolNotificationData);

        const schoolEmail = await fetchEmail(schoolId);
        const schoolEmailData = {
            to: schoolEmail,
            subject: schoolMessageData.messageTitle,
            text: schoolMessageData.messageContent,
        };
        sendEmail(schoolEmailData);

    };


    const checkUnsuccessful = async () => {
        try {
            const fetchedData = await fetchBidders();
            if (fetchedData && fetchedData.length > 0) {
                for (const { advertisementId, nonHighestBidderIds, highestBidderId } of fetchedData) {
                    for (const bidderId of nonHighestBidderIds) {
                        const notificationData = {
                            userId: bidderId,
                            messageId: 9,
                            status: 0,
                            time: new Date().toISOString(),
                            url: `/advertisement/${advertisementId}`,
                        };

                        await callAddNotificationAPI(notificationData);

                        const bidderEmail = await fetchEmail(bidderId);
                        const bidderMessageData = await fetchMessageData(9);
                        const bidderEmailData = {
                            to: bidderEmail,
                            subject: bidderMessageData.messageTitle,
                            text: bidderMessageData.messageContent,
                        };
                        sendEmail(bidderEmailData);
                    }

                    if (highestBidderId) {
                        const highestNotificationData = {
                            userId: highestBidderId,
                            messageId: 10,
                            status: 0,
                            time: new Date().toISOString(),
                            url: `/advertisement/${advertisementId}`,
                        };

                        await callAddNotificationAPI(highestNotificationData);

                        const bidderEmail = await fetchEmail(highestBidderId);
                        const bidderMessageData = await fetchMessageData(10);
                        const bidderEmailData = {
                            to: bidderEmail,
                            subject: bidderMessageData.messageTitle,
                            text: bidderMessageData.messageContent,
                        };
                        sendEmail(bidderEmailData);
                    }
                }
            } else {
                console.log('No data to process for notifications.');
            }
        } catch (error) {
            console.error('Failed to process bidders:', error);
        }
    };

    return { addBid, checkUnsuccessful };

};

export default BidNoti;