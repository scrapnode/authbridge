import { Event } from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent } from "aws-lambda";
import get from "lodash/get";

export function getAccessToken(event: APIGatewayProxyEvent | Event): string {
  if (!event.headers.authorization) return "";
  const [_, token] = event.headers.authorization.split(" ");
  return token || "";
}

export function resolveUserSub(event: APIGatewayProxyEvent | Event): string {
  return get(event, "requestContext.authorizer.jwt.claims.sub") || "";
}
