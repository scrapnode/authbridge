import { ProxyResult, Handler } from "aws-lambda";
import { ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import * as attributes from "@helpers/cognito/attributes";
import { fromRequest, toResponse } from "./transform";

const client = cognito.client(cfg.cognito);

const forgot: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new ForgotPasswordCommand(input);
  const output = await client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      body: mw.validator.compile(
        attributes.validator({
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        })
      ),
    })
  )
  .handler(forgot)
  .use(mw.error.use());
