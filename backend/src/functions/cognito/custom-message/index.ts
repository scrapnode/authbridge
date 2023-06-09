import { handlerPath } from "@libs/helpers";
import configs from "@configs";

export default {
  "cognito-custom-message": {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
      {
        cognitoUserPool: {
          pool: configs.backend.cognito.pool.name,
          trigger: "CustomMessage" as any,
          existing: true,
        },
      },
    ],
  },
};
