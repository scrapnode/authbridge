import { APIGatewayEvent, ProxyResult, Handler } from "aws-lambda";
import middy from "@middy/core";
import { ok } from "@libs/response";
import * as mw from "@functions/middlewares";
import { project } from "@configs/project";

const ping: Handler<APIGatewayEvent, ProxyResult> = async () => {
  return ok({
    timestamps: new Date().toISOString(),
    project: {
      name: project.name,
      region: project.region,
      debug: project.debug,
    },
  });
};

export const main = middy().use(mw.logger.use()).handler(ping);
