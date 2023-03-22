import { Schema } from "yup";
import { MiddlewareObj } from "@middy/core";
import { error400 } from "@libs/response";
import { logger } from "@libs/logger";

export function use<T = any>(schemas: {
  event?: Schema;
  context?: Schema;
}): MiddlewareObj<T> {
  return {
    async before(request) {
      if (schemas.event) {
        const { error } = await schemas.event
          .validate(request.event)
          .catch((error) => ({ error }));
        if (error) {
          logger.error(error);
          request.response = error400(error.message);
          return;
        }
      }

      if (schemas.context) {
        const { error } = await schemas.context
          .validate(request.context)
          .catch((error) => ({ error }));
        if (error) {
          logger.error(error);
          request.response = error400(error.message);
          return;
        }
      }
    },
  };
}
