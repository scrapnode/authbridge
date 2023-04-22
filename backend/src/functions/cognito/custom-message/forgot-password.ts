import type {
  CustomMessageForgotPasswordTriggerEvent,
  Context,
} from "aws-lambda";
import { Handlebars } from "@libs/handlebars";
import configs from "@configs";
import * as cognito from "@libs/cognito";

export function useForgotPassowrd(hbs: Handlebars) {
  return async function forgotPassowrd(
    event: CustomMessageForgotPasswordTriggerEvent,
    context: Context
  ): Promise<CustomMessageForgotPasswordTriggerEvent> {
    event.response.emailSubject = `${configs.project.name} Password Recovery`;
    event.response.emailMessage = await hbs.render(event.triggerSource, {
      event,
      context,
      user: await cognito.user(event.userName),
    });

    return event;
  };
}
