import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import {
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import * as cognito from "@libs/cognito";

const client = cognito.client(cfg.cognito);

interface Req {
  email: string;
  password: string;
}

const login: Handler<Event, ProxyResult> = async (event) => {
  const req: Req = event.body as any;
  const input: InitiateAuthCommandInput = {
    ClientId: cfg.cognito.client.id,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: req.email,
      PASSWORD: req.password,
    },
  };

  const cmd = new InitiateAuthCommand(input);
  const output = await client.send(cmd);

  return ok(output);
};

export const main = middy()
  .use(json())
  .use(mw.logger.use())
  .use(
    validator({
      eventSchema: transpileSchema({
        type: "object",
        required: ["body"],
        properties: {
          body: {
            type: "object",
            required: ["password", "email"],
            properties: {
              password: { type: "string", minLength: 6 },
              email: { type: "string", format: "email" },
            },
          },
        },
      }),
    })
  )
  .handler(login);
