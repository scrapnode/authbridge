import { error500 } from "@libs/response";
import { MiddlewareObj } from "@middy/core";

export function use(): MiddlewareObj {
  return {
    onError(request) {
      const ctx = { request_id: request.context.awsRequestId };
      request.response = error500("oops, something went wrong", ctx);
    },
  };
}
