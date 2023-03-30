import { error500 } from "@libs/response";
import { MiddlewareObj } from "@middy/core";
import { logger } from "@libs/logger";

export function use(): MiddlewareObj {
  return {
    onError(request) {
      logger.error(request.error);

      const ctx = { request_id: request.context.awsRequestId };
      request.response = error500("oops, something went wrong", ctx);
    },
  };
}
