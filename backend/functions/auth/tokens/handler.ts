import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@backend/libs/response";
import * as mw from "@backend/functions/middlewares";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import * as cognito from "@backend/libs/cognito";
import { fromRequest, toResponse } from "./transform";

const login: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new InitiateAuthCommand(input);
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
        required: ["refresh_token"],
        properties: {
          refresh_token: { type: "string" },
        },
      }),
    })
  )
  .handler(login);
