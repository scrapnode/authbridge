import { handlerPath } from "@libs/helpers";
import { cognito } from "@configs/cognito";

export const cognitocustommessage = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      cognitoUserPool: {
        pool: cognito.pool.name,
        trigger: "CustomMessage" as any,
        existing: true,
      },
    },
  ],
};
