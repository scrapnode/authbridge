import { handlerPath } from "@libs/helpers";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "PATCH",
        path: "/me",
      },
    },
  ],
};
