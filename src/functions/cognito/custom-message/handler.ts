import path from "path";
import type { Handler, CustomMessageTriggerEvent, Context } from "aws-lambda";
import startCase from "lodash/startCase";
import { logger } from "@libs/logger";
import { Template } from "@libs/template";
import { project } from "@configs/project";
import { cognito } from "@configs/cognito";

const customMessage: Handler<CustomMessageTriggerEvent> = async (
  event,
  context
) => {
  logger.debug({ event, context }, "received event");

  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      return onSignUp(event, context);
    case "CustomMessage_ForgotPassword":
      return event;
    default:
      return event;
  }
};

export const main = customMessage;

const template = new Template(
  path.resolve(__dirname, "../../../../templates"),
  { project, cognito }
);
export async function onSignUp(
  event: CustomMessageTriggerEvent,
  context: Context
): Promise<CustomMessageTriggerEvent> {
  event.response.emailSubject = `${startCase(
    project.name
  )} Account Confirmation`;
  event.response.emailMessage = await template.render(event.triggerSource, {
    event,
    context,
  });

  return event;
}
