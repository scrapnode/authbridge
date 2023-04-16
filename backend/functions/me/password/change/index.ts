import { handlerPath } from "@backend/libs/helpers";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "PUT",
        path: "/me/password",
      },
    },
  ],
};
