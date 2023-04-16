import { ProxyResult, Handler, APIGatewayEvent } from "aws-lambda";
import middy from "@middy/core";
import _ from "lodash";
import * as mw from "@backend/functions/middlewares";
import * as cognito from "@backend/libs/cognito";
import { error401, ok } from "@backend/libs/response";

const get: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const sub = _.get(event, "requestContext.authorizer.jwt.claims.sub");
  if (!sub) {
    return error401();
  }

  const user = await cognito.user(sub);
  return ok(user);
};

export const main = middy().use(mw.logger.use()).handler(get);
