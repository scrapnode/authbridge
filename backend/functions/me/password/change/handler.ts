import { ProxyResult, Handler } from "aws-lambda";
import { ChangePasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import cfg from "@configs/index";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import * as helpers from "@helpers/index";
import { fromRequest, toResponse } from "./transform";

const client = cognito.client(cfg.cognito);

const change: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(
    event.body as any,
    helpers.events.getAccessToken(event)
  );
  const cmd = new ChangePasswordCommand(input);
  const output = await client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(
    mw.validator.use({
      headers: mw.validator.instance.compile<any>({
        type: "object",
        required: ["authorization"],
        properties: {
          authorization: { type: "string" },
        },
      }),
      body: mw.validator.instance.compile<any>({
        type: "object",
        required: ["previous_password", "proposed_password"],
        properties: {
          previous_password: { type: "string", format: "password" },
          proposed_password: { type: "string", format: "password" },
        },
      }),
    })
  )
  .handler(change)
  .use(mw.error.use());