import path from "path";
import type { Handler, CustomMessageTriggerEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import * as mw from "@functions/middlewares";
import { Template } from "@libs/template";
import { project } from "@configs/project";
import { cognito } from "@configs/cognito";

const customMessage: Handler<CustomMessageTriggerEvent> = async (
  event,
  context
) => {
  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      return onSignUp(event, context);
    case "CustomMessage_ForgotPassword":
      return event;
    default:
      return event;
  }
};

export const main = middy().use(mw.logger.use()).handler(customMessage);

const template = new Template(
  path.resolve(__dirname, "../../../../templates"),
  { project, cognito }
);
export async function onSignUp(
  event: CustomMessageTriggerEvent,
  context: Context
): Promise<CustomMessageTriggerEvent> {
  event.response.emailSubject = `${project.name} Account Confirmation`;
  event.response.emailMessage = await template.render(event.triggerSource, {
    event,
    context,
  });

  return event;
}
