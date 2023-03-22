import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import middy from "@middy/core";
import { ok } from "@libs/response";

const me: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event,
  context
) => {
  return ok({ event, context });
};

export const main = middy().handler(me);
