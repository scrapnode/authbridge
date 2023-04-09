import { MiddlewareObj } from "@middy/core";
import { logger } from "@libs/logger";

export function use(): MiddlewareObj {
  return {
    before(request) {
      logger.debug(
        { event: request.event, context: request.context },
        "received event"
      );
    },
    after(request) {
      logger.debug({ response: request.response }, "return response");
    },
  };
}
