import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import * as cognito from "@libs/cognito";
import { fromRequest, toResponse } from "./transform";
import * as validator from "./validator";

const tokens: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any);
  const cmd = new InitiateAuthCommand(input);
  const output = await cognito.client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(mw.validator.use(validator))
  .handler(tokens)
  .use(mw.error.use());
