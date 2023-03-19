import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { ok } from "@libs/response";
import { project } from "@configs/project";
import { logger } from "@libs/logger";

const ping: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event
) => {
  logger.debug({ event }, "received event");
  return ok({
    timestamps: new Date().toISOString(),
    project: {
      name: project.name,
      region: project.region,
      debug: project.debug,
    },
  });
};

export const main = ping;
