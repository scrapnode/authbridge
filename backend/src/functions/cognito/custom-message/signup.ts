import type { CustomMessageSignUpTriggerEvent, Context } from "aws-lambda";
import configs from "@configs";
import { Handlebars } from "@libs/handlebars";
import * as cognito from "@libs/cognito";

export function useSignUp(hbs: Handlebars) {
  return async function signup(
    event: CustomMessageSignUpTriggerEvent,
    context: Context
  ): Promise<CustomMessageSignUpTriggerEvent> {
    event.response.emailSubject = `${configs.project.name} Account Confirmation`;
    event.response.emailMessage = await hbs.render(event.triggerSource, {
      event,
      context,
      user: await cognito.user(event.userName),
    });

    return event;
  };
}
