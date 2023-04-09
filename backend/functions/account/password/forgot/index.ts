import { handlerPath } from "@libs/helpers";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "POST",
        path: "/account/password/forgot",
      },
    },
  ],
};
