import type { Handler, CustomMessageTriggerEvent } from "aws-lambda";
import middy from "@middy/core";
import * as mw from "@functions/middlewares";
import { signup } from "./signup";

const customMessage: Handler<CustomMessageTriggerEvent> = async (
  event,
  context
) => {
  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      return signup(event, context);
    case "CustomMessage_ForgotPassword":
      return event;
    default:
      return event;
  }
};

export const main = middy().use(mw.logger.use()).handler(customMessage);
