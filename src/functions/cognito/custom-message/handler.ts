import type { Handler, CustomMessageTriggerEvent } from "aws-lambda";
import { logger } from "@libs/logger";

const customMessage: Handler<CustomMessageTriggerEvent> = async (
  event,
  context
) => {
  logger.debug({ event, context }, "received event");

  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      return event;
    case "CustomMessage_ForgotPassword":
      return event;
    default:
      return event;
  }
};

export const main = customMessage;
