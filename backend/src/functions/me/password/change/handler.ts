import { ProxyResult, Handler } from "aws-lambda";
import { ChangePasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import * as request from "@libs/request";
import { fromRequest, toResponse } from "./transform";
import * as validator from "./validator";

const change: Handler<Event, ProxyResult> = async (event) => {
  const input = fromRequest(event.body as any, request.getAccessToken(event));
  const cmd = new ChangePasswordCommand(input);
  const output = await cognito.client.send(cmd);
  return ok(toResponse(output));
};

export const main = middy()
  .use(mw.logger.use())
  .use(json())
  .use(mw.validator.use(validator))
  .handler(change)
  .use(mw.error.use());
