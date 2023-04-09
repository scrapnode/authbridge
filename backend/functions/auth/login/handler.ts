import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import * as cognito from "@libs/cognito";
import { fromRequest, toResponse } from "./transform";

const client = cognito.client(cfg.cognito);

const login: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new InitiateAuthCommand(input);
  const output = await client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      body: mw.validator.instance.compile<any>({
        type: "object",
        required: ["password", "email"],
        properties: {
          password: { type: "string", format: "password", minLength: 6 },
          email: { type: "string", format: "email" },
        },
      }),
    })
  )
  .handler(login);
