import path from "path";
import type { Handler, CustomMessageTriggerEvent } from "aws-lambda";
import middy from "@middy/core";
import * as mw from "@functions/middlewares";
import configs from "@configs";
import { Handlebars } from "@libs/handlebars";

import { useSignUp } from "./signup";
import { useForgotPassowrd } from "./forgot-password";

const template = new Handlebars(
  path.resolve(__dirname, "../../../../templates"),
  { project: configs.project }
);

const signup = useSignUp(template);
const forgotPassowrd = useForgotPassowrd(template);

const customMessage: Handler<CustomMessageTriggerEvent> = async (
  event,
  context
) => {
  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      return signup(event, context);
    case "CustomMessage_ForgotPassword":
      return forgotPassowrd(event, context);
    default:
      return event;
  }
};

export const main = middy().use(mw.logger.use()).handler(customMessage);
