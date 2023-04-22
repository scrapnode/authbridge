import { ProxyResult, Handler, APIGatewayEvent } from "aws-lambda";
import middy from "@middy/core";
import _ from "lodash";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import * as request from "@libs/request";
import { error401, ok } from "@libs/response";

const get: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const sub = request.resolveUserSub(event);
  if (!sub) return error401();

  const user = await cognito.user(sub);
  return ok(user);
};

export const main = middy()
  .use(mw.logger.use())
  .handler(get)
  .use(mw.error.use());
