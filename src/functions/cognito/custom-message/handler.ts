import path from "path";
import type { Handler, CustomMessageTriggerEvent } from "aws-lambda";
import middy from "@middy/core";
import * as mw from "@functions/middlewares";
import cfg from "@configs/index";
import * as cognito from "@libs/cognito";
import { Template } from "@libs/template";

import { useSignUp } from "./signup";
import { useForgotPassowrd } from "./forgot-password";

const template = new Template(
  path.resolve(__dirname, "../../../../templates"),
  { project: cfg.project }
);
const getUser = cognito.withUser(cfg.cognito);

const signup = useSignUp(template, getUser);
const forgotPassowrd = useForgotPassowrd(template, getUser);

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
