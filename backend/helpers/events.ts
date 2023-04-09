import { Event } from "@middy/http-json-body-parser";
import { APIGatewayProxyEvent } from "aws-lambda";

export function getAccessToken(event: APIGatewayProxyEvent | Event): string {
  if (!event.headers.authorization) return "";
  const [_, token] = event.headers.authorization.split(" ");
  return token || "";
}
