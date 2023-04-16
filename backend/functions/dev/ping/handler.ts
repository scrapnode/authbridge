import { APIGatewayEvent, ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import { ok } from "@backend/libs/response";
import * as mw from "@backend/functions/middlewares";
import configs from "@backend/configs";

const ping: Handler<APIGatewayEvent, ProxyResult> = async () => {
  return ok({
    timestamps: new Date().toISOString(),
    project: {
      region: configs.aws.region,
      name: configs.project.name,
      env: configs.project.env,
    },
  });
};

export const main = middy().use(mw.logger.use()).handler(ping);
