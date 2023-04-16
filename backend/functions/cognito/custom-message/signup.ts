import type { CustomMessageSignUpTriggerEvent, Context } from "aws-lambda";
import configs from "@backend/configs";
import { Template } from "@backend/libs/template";
import * as cognito from "@backend/libs/cognito";

export function useSignUp(template: Template) {
  return async function signup(
    event: CustomMessageSignUpTriggerEvent,
    context: Context
  ): Promise<CustomMessageSignUpTriggerEvent> {
    event.response.emailSubject = `${configs.project.name} Account Confirmation`;
    event.response.emailMessage = await template.render(event.triggerSource, {
      event,
      context,
      user: await cognito.user(event.userName),
    });

    return event;
  };
}
