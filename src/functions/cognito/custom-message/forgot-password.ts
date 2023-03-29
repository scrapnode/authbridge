import type {
  CustomMessageForgotPasswordTriggerEvent,
  Context,
} from "aws-lambda";
import { Template } from "@libs/template";
import cfg from "@configs/index";
import { User } from "@domain/entities";

export function useForgotPassowrd(
  template: Template,
  getUser: (username: string) => Promise<User>
) {
  return async function forgotPassowrd(
    event: CustomMessageForgotPasswordTriggerEvent,
    context: Context
  ): Promise<CustomMessageForgotPasswordTriggerEvent> {
    event.response.emailSubject = `${cfg.project.name} Password Recovery`;
    event.response.emailMessage = await template.render(event.triggerSource, {
      event,
      context,
      user: await getUser(event.userName),
    });

    return event;
  };
}
