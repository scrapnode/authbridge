import { ProxyResult, Handler, APIGatewayEvent } from "aws-lambda";
import middy from "@middy/core";
import _ from "lodash";
import cfg from "@configs/index";
import * as mw from "@functions/middlewares";
import * as cognito from "@libs/cognito";
import { error401, ok } from "@libs/response";

const getUser = cognito.withUser(cfg.cognito);

const get: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const sub = _.get(event, "requestContext.authorizer.jwt.claims.sub");
  if (!sub) {
    return error401();
  }

  const user = await getUser(sub);
  return ok(user);
};

export const main = middy().use(mw.logger.use()).handler(get);
