import { error400 } from "@libs/response";
import { MiddlewareObj } from "@middy/core";
import { Event } from "@middy/http-json-body-parser";
import Ajv, { SchemaObject, Options, ValidateFunction } from "ajv";
import formats from "ajv-formats";
import { logger } from "@libs/logger";

export function compile(
  schema: SchemaObject,
  opts?: Partial<Options>
): ValidateFunction<any> {
  const options: Options = {
    strict: true,
    coerceTypes: "array", // important for query string params
    allErrors: true,
    useDefaults: "empty",
    messages: true, // needs to be true to allow multi-locale errorMessage to work
    ...opts,
  };
  const validator = new Ajv(options);
  formats(validator);
  return validator.compile<any>(schema);
}

const MSG_BODY = "validation of request body was failed";
const MSG_HEADERS = "validation of request headers was failed";

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
          logger.error({ errors: schemas.body.errors }, MSG_BODY);
          request.response = error400(MSG_BODY, ctx);
          return;
        }
      }

      if (schemas.headers) {
        const ok = schemas.headers(request.event.headers);
        if (!ok) {
          logger.error({ errors: schemas.body.errors }, MSG_HEADERS);
          request.response = error400(MSG_HEADERS, ctx);
          return;
        }
      }
    },
  };
}
