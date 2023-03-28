import path from "path";
import type { CustomMessageTriggerEvent, Context } from "aws-lambda";
import { Template } from "@libs/template";
import cfg from "@configs/index";
import * as cognito from "@libs/cognito";

const template = new Template(
  path.resolve(__dirname, "../../../../templates"),
  { project: cfg.project }
);
const get = cognito.withUser(cfg.cognito);

export async function signup(
  event: CustomMessageTriggerEvent,
  context: Context
): Promise<CustomMessageTriggerEvent> {
  event.response.emailSubject = `${cfg.project.name} Account Confirmation`;
  event.response.emailMessage = await template.render(event.triggerSource, {
    event,
    context,
    user: await get(event.userName),
  });

  return event;
}
