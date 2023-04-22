import { APIGatewayEvent, ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import configs from "@configs";

const ping: Handler<APIGatewayEvent, ProxyResult> = async () => {
  return ok({
    timestamps: new Date().toISOString(),
    project: {
      region: configs.aws.region,
      name: configs.project.name,
    },
  });
};

export const main = middy()
  .use(mw.logger.use())
  .handler(ping)
  .use(mw.error.use());
