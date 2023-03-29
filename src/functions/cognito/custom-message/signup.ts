import type { CustomMessageSignUpTriggerEvent, Context } from "aws-lambda";
import cfg from "@configs/index";
import { Template } from "@libs/template";
import { User } from "@domain/entities";

export function useSignUp(
  template: Template,
  getUser: (username: string) => Promise<User>
) {
  return async function signup(
    event: CustomMessageSignUpTriggerEvent,
    context: Context
  ): Promise<CustomMessageSignUpTriggerEvent> {
    event.response.emailSubject = `${cfg.project.name} Account Confirmation`;
    event.response.emailMessage = await template.render(event.triggerSource, {
      event,
      context,
      user: await getUser(event.userName),
    });

    return event;
  };
}
