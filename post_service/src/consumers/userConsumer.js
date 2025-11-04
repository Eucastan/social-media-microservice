import { consume } from "../config/mq.js";
import { logger } from "../config/logger.js";
import { UserRef } from "../models/index.js";

export const handleUserEvents = async () => {
  const exchange = process.env.EVENT_EXCHANGE || "social.events";
  const queue = "post_user_queue";

  await consume(exchange, queue, ["user.created"], async (message) => {
    try {
      const data = JSON.parse(message);
      logger.info("Received user.created event:", data);

      // Save minimal user info
      await UserRef.upsert({
        userId: data.userId,
        displayName: data.displayName,
        isPrivate: data.isPrivate,
      });

      logger.info(`UserRef updated for userId ${data.userId}`);
    } catch (err) {
      logger.error("Error handling user.created event:", err);
    }
  });
};
