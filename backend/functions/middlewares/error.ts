import { error500 } from "@backend/libs/response";
import { MiddlewareObj } from "@middy/core";
import { logger } from "@backend/libs/logger";

export function use(): MiddlewareObj {
  return {
    onError(request) {
      logger.error(
        { event: request.event, context: request.context },
        request.error.message
      );

      const ctx = { request_id: request.context.awsRequestId };
      request.response = error500("oops, something went wrong", ctx);
    },
  };
}
