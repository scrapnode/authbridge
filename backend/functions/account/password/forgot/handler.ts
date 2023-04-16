import { ProxyResult, Handler } from "aws-lambda";
import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@backend/libs/response";
import * as mw from "@backend/functions/middlewares";
import * as cognito from "@backend/libs/cognito";
import { fromRequest, toResponse } from "./transform";

const forgot: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new ForgotPasswordCommand(input);
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
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      }),
    })
  )
  .handler(forgot)
  .use(mw.error.use());
