import type {
  CustomMessageForgotPasswordTriggerEvent,
  Context,
} from "aws-lambda";
import { Template } from "@backend/libs/template";
import configs from "@backend/configs";
import * as cognito from "@backend/libs/cognito";

export function useForgotPassowrd(template: Template) {
  return async function forgotPassowrd(
    event: CustomMessageForgotPasswordTriggerEvent,
    context: Context
  ): Promise<CustomMessageForgotPasswordTriggerEvent> {
    event.response.emailSubject = `${configs.project.name} Password Recovery`;
    event.response.emailMessage = await template.render(event.triggerSource, {
      event,
      context,
      user: await cognito.user(event.userName),
    });

    return event;
  };
}
