import { error400 } from "@libs/response";
import { MiddlewareObj } from "@middy/core";
import { Event } from "@middy/http-json-body-parser";
import Ajv, { ValidateFunction } from "ajv";
import formats from "ajv-formats";
import { logger } from "@libs/logger";

export const instance = new Ajv({
  strict: true,
  allErrors: true,
  useDefaults: "empty",
  messages: true, // needs to be true to allow multi-locale errorMessage to work
});
formats(instance);

export function use(schemas: {
  body?: ValidateFunction<object>;
  headers?: ValidateFunction<object>;
}): MiddlewareObj<Event> {
  return {
    before(request) {
      const ctx = { request_id: request.context.awsRequestId };
      if (schemas.body) {
        const ok = schemas.body(request.event.body);
        if (!ok) {
          const msg = instance.errorsText(schemas.body.errors);
          logger.error({ body: request.event.body }, msg);
          request.response = error400(msg, ctx);
          return;
        }
      }

      if (schemas.headers) {
        const ok = schemas.headers(request.event.headers);
        if (!ok) {
          const msg = instance.errorsText(schemas.headers.errors);
          logger.error({ headers: request.event.headers }, msg);
          request.response = error400(msg, ctx);
          return;
        }
      }
    },
  };
}
