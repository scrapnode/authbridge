import { ProxyResult, Handler } from "aws-lambda";
import { ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@backend/libs/response";
import * as mw from "@backend/functions/middlewares";
import * as cognito from "@backend/libs/cognito";
import { fromRequest, toResponse } from "./transform";

const forgot: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new ConfirmForgotPasswordCommand(input);
  const output = await cognito.client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      body: mw.validator.instance.compile<any>({
        type: "object",
        required: ["code", "password", "email"],
        properties: {
          code: { type: "string" },
          password: { type: "string", format: "password", minLength: 6 },
          email: { type: "string", format: "email" },
        },
      }),
    })
  )
  .handler(forgot)
  .use(mw.error.use());
