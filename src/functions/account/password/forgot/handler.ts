import { ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import json, { Event } from "@middy/http-json-body-parser";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";

const forgot: Handler<Event, ProxyResult> = async (event, context) => {
  return ok({ event, context });
};

export const main = middy().use(json()).use(mw.logger.use()).handler(forgot);
